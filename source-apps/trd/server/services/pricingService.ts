import type {
  Estimate,
  EstimateLineItem,
  EstimateVersion,
  Proposal,
  ProposalOption,
  PriceBook,
  ScopeTemplate,
  Measurement,
} from '../../shared/types/index.ts';
import { generateId } from '../db/database.ts';

const FINANCIAL_ROLES = ['ADMIN', 'ADMINISTRATOR', 'OWNER', 'EXECUTIVE', 'OFFICE_MANAGER', 'OFFICE', 'SALES_MANAGER', 'SALES', 'PROJECT_MANAGER'];

export function canAccessFinancials(userRole?: string): boolean {
  if (!userRole) return false;
  return FINANCIAL_ROLES.includes(userRole.toUpperCase());
}

export function calculateLineItemTotals(item: Partial<EstimateLineItem>): EstimateLineItem {
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const extendedPrice = Math.round(quantity * unitPrice * 100) / 100;

  const materialCost = Number(item.materialCost) || 0;
  const laborCost = Number(item.laborCost) || 0;
  const subcontractorCost = Number(item.subcontractorCost) || 0;
  const otherCost = Number(item.otherCost) || 0;

  let internalUnitCost = Number(item.internalUnitCost);
  if (isNaN(internalUnitCost) || internalUnitCost === 0) {
    internalUnitCost = materialCost + laborCost + subcontractorCost + otherCost;
  }
  const internalExtendedCost = Math.round(quantity * internalUnitCost * 100) / 100;

  const margin = extendedPrice > 0 ? Math.round(((extendedPrice - internalExtendedCost) / extendedPrice) * 1000) / 10 : 0;

  return {
    id: item.id || generateId('eli'),
    estimateId: item.estimateId,
    description: (item.description || 'Roofing Item').trim(),
    category: item.category || 'ROOFING',
    quantity,
    unit: item.unit || 'SQ',
    unitPrice,
    totalPrice: extendedPrice,
    extendedPrice,
    internalUnitCost,
    internalExtendedCost,
    laborCost,
    materialCost,
    subcontractorCost,
    otherCost,
    margin,
    taxable: item.taxable !== undefined ? Boolean(item.taxable) : true,
    roofArea: item.roofArea,
    roofSystem: item.roofSystem,
    material: item.material,
    manufacturer: item.manufacturer,
    product: item.product,
    wasteFactor: Number(item.wasteFactor) || 1.0,
    notes: item.notes,
    source: item.source || 'MANUAL',
    sortOrder: item.sortOrder || 0,
  };
}

export function calculateEstimateTotals(
  rawLineItems: Partial<EstimateLineItem>[],
  taxRate: number = 0.0825, // Standard Texas sales tax rate (8.25%)
  discounts: number = 0,
  adjustments: number = 0
) {
  const lineItems: EstimateLineItem[] = rawLineItems.map((item, idx) => {
    const calc = calculateLineItemTotals(item);
    if (!calc.sortOrder) calc.sortOrder = idx + 1;
    return calc;
  });

  const subtotal = Math.round(lineItems.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100;

  const taxableSubtotal = Math.round(
    lineItems.filter((i) => i.taxable).reduce((sum, item) => sum + item.totalPrice, 0) * 100
  ) / 100;

  const validDiscounts = Math.max(0, Number(discounts) || 0);
  const validAdjustments = Number(adjustments) || 0;

  const netTaxable = Math.max(0, taxableSubtotal - validDiscounts + validAdjustments);
  const tax = Math.round(netTaxable * (Number(taxRate) || 0) * 100) / 100;

  const total = Math.max(0, Math.round((subtotal - validDiscounts + validAdjustments + tax) * 100) / 100);

  const internalCost = Math.round(
    lineItems.reduce((sum, item) => sum + (item.internalExtendedCost || 0), 0) * 100
  ) / 100;

  const contractRevenueExcludingTax = Math.max(0, total - tax);
  const estimatedGrossProfit = Math.round((contractRevenueExcludingTax - internalCost) * 100) / 100;
  const estimatedMargin =
    contractRevenueExcludingTax > 0
      ? Math.round((estimatedGrossProfit / contractRevenueExcludingTax) * 1000) / 10
      : 0;

  return {
    lineItems,
    subtotal,
    discounts: validDiscounts,
    adjustments: validAdjustments,
    taxRate: Number(taxRate) || 0,
    tax,
    total,
    internalCost,
    estimatedGrossProfit,
    estimatedMargin,
  };
}

export function maskEstimateFinancials(estimate: Estimate, canViewFinancials: boolean): Estimate {
  if (canViewFinancials) {
    return estimate;
  }

  const cloned: Estimate = JSON.parse(JSON.stringify(estimate));
  delete cloned.internalCost;
  delete cloned.estimatedGrossProfit;
  delete cloned.estimatedMargin;
  delete cloned.internalNotes;

  if (cloned.lineItems) {
    cloned.lineItems = cloned.lineItems.map((item) => {
      const sanitized = { ...item };
      delete sanitized.internalUnitCost;
      delete sanitized.internalExtendedCost;
      delete sanitized.laborCost;
      delete sanitized.materialCost;
      delete sanitized.subcontractorCost;
      delete sanitized.otherCost;
      delete sanitized.margin;
      return sanitized;
    });
  }

  if (cloned.versions) {
    cloned.versions = cloned.versions.map((ver) => {
      const sanitizedVer = { ...ver };
      delete sanitizedVer.internalCost;
      delete sanitizedVer.estimatedGrossProfit;
      delete sanitizedVer.estimatedMargin;
      if (sanitizedVer.lineItems) {
        sanitizedVer.lineItems = sanitizedVer.lineItems.map((item) => {
          const s = { ...item };
          delete s.internalUnitCost;
          delete s.internalExtendedCost;
          delete s.laborCost;
          delete s.materialCost;
          delete s.subcontractorCost;
          delete s.otherCost;
          delete s.margin;
          return s;
        });
      }
      return sanitizedVer;
    });
  }

  return cloned;
}

export function maskProposalFinancials(proposal: Proposal, canViewFinancials: boolean): Proposal {
  if (canViewFinancials) return proposal;

  const cloned: Proposal = JSON.parse(JSON.stringify(proposal));
  if (cloned.options) {
    cloned.options = cloned.options.map((opt) => {
      const s = { ...opt };
      delete s.internalCost;
      delete s.margin;
      return s;
    });
  }
  return cloned;
}

export function generateEstimateNumber(existingEstimates: Estimate[]): string {
  const year = new Date().getFullYear();
  const count = existingEstimates.length + 1;
  return `EST-${year}-${String(count).padStart(4, '0')}`;
}

export function generateProposalNumber(existingProposals: Proposal[]): string {
  const year = new Date().getFullYear();
  const count = existingProposals.length + 1;
  return `PROP-${year}-${String(count).padStart(4, '0')}`;
}

export function buildLineItemsFromMeasurementAndTemplate(
  template: ScopeTemplate,
  measurement: Measurement,
  priceBook?: PriceBook
): EstimateLineItem[] {
  const norm = measurement.normalizedData || {
    totalSquares: 32.5,
    totalAreaSqFt: 3250,
    predominantPitch: '6/12',
    ridgesLengthFt: 65,
    valleysLengthFt: 45,
    rakesLengthFt: 110,
    eavesLengthFt: 180,
    stepFlashingLengthFt: 40,
    flashingLengthFt: 25,
    facetsCount: 8,
  };

  const activePbVersion = priceBook?.versions.find((v) => v.id === priceBook.activeVersionId) || priceBook?.versions[0];
  const itemsMap = new Map((activePbVersion?.items || []).map((i) => [i.itemCode, i]));

  return template.items.map((tplItem, idx) => {
    let quantity = 1;
    switch (tplItem.quantityFormula) {
      case 'TOTAL_SQUARES':
        quantity = Math.round((norm.totalSquares || 30) * tplItem.defaultQuantityMultiplier * 10) / 10;
        break;
      case 'EAVES_LF':
        quantity = Math.round((norm.eavesLengthFt || 150) * tplItem.defaultQuantityMultiplier);
        break;
      case 'VALLEYS_LF':
        quantity = Math.round((norm.valleysLengthFt || 40) * tplItem.defaultQuantityMultiplier);
        break;
      case 'RIDGES_LF':
        quantity = Math.round((norm.ridgesLengthFt || 60) * tplItem.defaultQuantityMultiplier);
        break;
      case 'RAKES_LF':
        quantity = Math.round((norm.rakesLengthFt || 100) * tplItem.defaultQuantityMultiplier);
        break;
      case 'STEP_FLASHING_LF':
        quantity = Math.round((norm.stepFlashingLengthFt || 35) * tplItem.defaultQuantityMultiplier);
        break;
      case 'FIXED':
      default:
        quantity = tplItem.defaultQuantityMultiplier;
        break;
    }

    const pbItem = itemsMap.get(tplItem.itemCode);
    const unitPrice = pbItem ? pbItem.unitPrice : tplItem.unitPrice;
    const materialCost = pbItem ? pbItem.materialCost : 0;
    const laborCost = pbItem ? pbItem.laborCost : 0;
    const subcontractorCost = pbItem ? pbItem.subcontractorCost : 0;
    const otherCost = pbItem ? pbItem.otherCost : 0;
    const internalUnitCost = pbItem ? pbItem.internalTotalCost : 0;

    return calculateLineItemTotals({
      id: generateId('eli'),
      description: tplItem.description,
      category: tplItem.category as any,
      quantity,
      unit: tplItem.unit as any,
      unitPrice,
      materialCost,
      laborCost,
      subcontractorCost,
      otherCost,
      internalUnitCost,
      taxable: pbItem ? pbItem.taxable : true,
      source: 'SCOPE_TEMPLATE',
      sortOrder: idx + 1,
    });
  });
}
