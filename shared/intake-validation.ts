/** Bounded public-input validation; business details remain in the immutable payload. */
export function validCalculatorInput(input: unknown): input is Record<string, any> {
 if(!input||typeof input!=='object'||Array.isArray(input))return false;
 const p=input as Record<string,unknown>;
 for(const field of ['contactName','companyName','phone','email','address','notes'])if(p[field]!==undefined&&(typeof p[field]!=='string'||String(p[field]).length>10000))return false;
 const area=Number(p.squareFootage);
 return Number.isFinite(area)&&area>0&&Number.isSafeInteger(Math.round(area*100));
}
