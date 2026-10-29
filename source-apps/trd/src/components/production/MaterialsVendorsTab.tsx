import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Building2,
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ExternalLink,
  Search,
} from 'lucide-react';
import { api } from '../../lib/api.ts';
import type { PurchaseOrder, Material, Vendor } from '../../../shared/types/index.ts';

export const MaterialsVendorsTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'pos' | 'materials' | 'vendors'>('pos');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states for creating material
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState<'SHINGLES' | 'UNDERLAYMENT' | 'FLASHING' | 'VENTILATION' | 'FASTENERS' | 'ACCESSORIES'>('SHINGLES');
  const [matManufacturer, setMatManufacturer] = useState('Owens Corning');
  const [matSku, setMatSku] = useState('');
  const [matUnit, setMatUnit] = useState('BUNDLE');
  const [matCost, setMatCost] = useState(38.5);

  // Form states for creating vendor
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [venName, setVenName] = useState('');
  const [venContact, setVenContact] = useState('');
  const [venPhone, setVenPhone] = useState('');
  const [venEmail, setVenEmail] = useState('');
  const [venAccount, setVenAccount] = useState('');
  const [venCity, setVenCity] = useState('Texarkana');

  const loadData = async () => {
    try {
      setLoading(true);
      const [posRes, matsRes, vensRes] = await Promise.all([
        api.getPurchaseOrders(),
        api.getMaterials(),
        api.getVendors(),
      ]);
      setPurchaseOrders(posRes);
      setMaterials(matsRes);
      setVendors(vensRes);
    } catch (err: any) {
      console.error('Failed to load materials and vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMaterial({
        name: matName,
        category: matCategory,
        manufacturer: matManufacturer,
        sku: matSku || `SKU-${Date.now().toString().slice(-4)}`,
        unit: matUnit,
        costPerUnit: Number(matCost),
      });
      showToast('Material added to product catalog!');
      setShowAddMaterial(false);
      setMatName('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create material');
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createVendor({
        name: venName,
        contactName: venContact,
        phone: venPhone,
        email: venEmail,
        accountNumber: venAccount,
        city: venCity,
        state: 'TX',
      });
      showToast('Supplier partner registered!');
      setShowAddVendor(false);
      setVenName('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create vendor');
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Materials, Supply Houses &amp; Rooftop Purchase Orders</h2>
          <p className="text-xs text-slate-500">
            Precision takeoff purchasing and direct supplier fulfillment via ABC Supply, Beacon, and SRS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'materials' && (
            <button
              onClick={() => setShowAddMaterial(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Catalog Material</span>
            </button>
          )}
          {subTab === 'vendors' && (
            <button
              onClick={() => setShowAddVendor(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Supply Branch</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setSubTab('pos')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'pos' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Rooftop Purchase Orders ({purchaseOrders.length})</span>
        </button>
        <button
          onClick={() => setSubTab('materials')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'materials' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Material Catalog ({materials.length})</span>
        </button>
        <button
          onClick={() => setSubTab('vendors')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === 'vendors' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Supply Houses &amp; Vendors ({vendors.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: PURCHASE ORDERS */}
      {subTab === 'pos' && (
        <div className="space-y-4">
          {purchaseOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2 shadow-xs">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No Purchase Orders Created Yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Open any Project in the Projects tab and click "Auto-Generate Rooftop PO" to automatically calculate bundles, underlayment rolls, and ridge caps.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{po.poNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : po.status === 'ORDERED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">
                        ${(po.totalCost || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div>Project ID: <span className="font-mono text-slate-700">{po.projectId}</span></div>
                      <div>Delivery Target: <span className="font-medium text-slate-800">{po.deliveryDate || 'Scheduled'}</span></div>
                    </div>

                    {po.rooftopDelivery && (
                      <div className="text-[11px] font-semibold text-purple-700 bg-purple-50 p-2 rounded border border-purple-200 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Rooftop Conveyor Delivery Verified</span>
                      </div>
                    )}

                    {po.items && (
                      <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] space-y-1">
                        {po.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600">
                            <span>{it.quantity} {it.unit} &bull; {it.description}</span>
                            <span className="font-mono font-semibold">${(it.totalCost || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[10px]">Vendor: {po.vendorId}</span>
                    <div className="space-x-1.5">
                      {po.status === 'DRAFT' && (
                        <button
                          onClick={async () => {
                            const conf = prompt('Enter Supplier Order # (e.g. ABC-88219):', `ABC-${Date.now().toString().slice(-5)}`);
                            if (!conf) return;
                            await api.orderPurchaseOrder(po.id, { supplierConfirmationNumber: conf });
                            showToast('Order confirmed with supplier!');
                            loadData();
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Mark Ordered
                        </button>
                      )}
                      {po.status === 'ORDERED' && (
                        <button
                          onClick={async () => {
                            await api.deliverPurchaseOrder(po.id);
                            showToast('Marked as delivered to jobsite rooftop!');
                            loadData();
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Confirm Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MATERIAL CATALOG */}
      {subTab === 'materials' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item &amp; Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Cost Per Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{mat.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {mat.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{mat.manufacturer}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{mat.sku}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ${(mat.costPerUnit || 0).toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/ {mat.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SUPPLY HOUSES & VENDORS */}
      {subTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vendors.map((ven) => (
            <div key={ven.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{ven.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                    Active Branch
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ven.city}, {ven.state}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ven.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ven.email}</span>
                </div>
                {ven.contactName && (
                  <div className="text-[11px] text-slate-500">
                    Contact: <strong className="text-slate-800">{ven.contactName}</strong>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                Account #: <span className="font-bold text-slate-800">{ven.accountNumber}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD MATERIAL */}
      {showAddMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add Material to Catalog</h3>
            <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  required
                  placeholder="e.g. Owens Corning Duration Architectural Shingles"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={matCategory}
                    onChange={(e: any) => setMatCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="SHINGLES">Shingles</option>
                    <option value="UNDERLAYMENT">Underlayment</option>
                    <option value="FLASHING">Flashing</option>
                    <option value="VENTILATION">Ventilation</option>
                    <option value="FASTENERS">Fasteners</option>
                    <option value="ACCESSORIES">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={matManufacturer}
                    onChange={(e) => setMatManufacturer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    placeholder="BUNDLE, ROLL, BOX, LF"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={matCost}
                    onChange={(e) => setMatCost(Number(e.target.value))}
                    step={0.5}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaterial(false)}
                  className="px-3 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VENDOR */}
      {showAddVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add Supply House Branch</h3>
            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  value={venName}
                  onChange={(e) => setVenName(e.target.value)}
                  required
                  placeholder="e.g. ABC Supply Co."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch City *</label>
                  <input
                    type="text"
                    value={venCity}
                    onChange={(e) => setVenCity(e.target.value)}
                    required
                    placeholder="Texarkana, Tyler, Longview"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={venAccount}
                    onChange={(e) => setVenAccount(e.target.value)}
                    placeholder="e.g. RD-TX-904"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={venPhone}
                    onChange={(e) => setVenPhone(e.target.value)}
                    required
                    placeholder="(903) 555-0100"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={venContact}
                    onChange={(e) => setVenContact(e.target.value)}
                    placeholder="Branch Manager"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Dispatch Email</label>
                <input
                  type="email"
                  value={venEmail}
                  onChange={(e) => setVenEmail(e.target.value)}
                  placeholder="orders@supplyhouse.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVendor(false)}
                  className="px-3 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Register Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
