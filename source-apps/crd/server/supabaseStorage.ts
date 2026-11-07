/**
 * Server-only Supabase Storage helpers for the combined Roof Doctors site.
 * Never import this module into browser code or expose the service role key.
 */
const PRIVATE_BUCKET = 'roof-doctors-private';
const PUBLIC_BUCKET = 'roof-doctors-public';
const MAX_PRIVATE_FILE_BYTES = 15 * 1024 * 1024;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_PRIVATE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^https:\/\//i.test(url)) {
    throw new Error('Supabase Storage is not configured on the server.');
  }
  return { url, key };
}

function safeSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 100) || 'file';
}

async function upload(bucket: string, objectPath: string, bytes: Buffer, contentType: string, upsert: boolean) {
  const { url, key } = config();
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': contentType,
      'x-upsert': upsert ? 'true' : 'false',
    },
    body: bytes,
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Supabase Storage upload failed (${response.status}): ${detail}`);
  }
}

export async function uploadPrivateLeadFile(leadId: string, originalName: string, contentType: string, bytes: Buffer) {
  if (!ALLOWED_PRIVATE_TYPES.has(contentType)) throw new Error('Unsupported file type.');
  if (!bytes.length || bytes.length > MAX_PRIVATE_FILE_BYTES) throw new Error('File must be under 15 MB.');
  const extension = safeSegment(originalName.split('.').pop() || 'bin').toLowerCase();
  const objectPath = `leads/${safeSegment(leadId)}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await upload(PRIVATE_BUCKET, objectPath, bytes, contentType, false);
  return { bucket: PRIVATE_BUCKET, path: objectPath, contentType, size: bytes.length, originalName: safeSegment(originalName) };
}

export async function createPrivateDownloadUrl(objectPath: string, expiresInSeconds = 300): Promise<string> {
  const { url, key } = config();
  const safePath = objectPath.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${url}/storage/v1/object/sign/${PRIVATE_BUCKET}/${safePath}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: Math.min(Math.max(expiresInSeconds, 30), 3600) }),
  });
  if (!response.ok) throw new Error(`Supabase signed URL request failed (${response.status}).`);
  const result = await response.json() as { signedURL?: string };
  if (!result.signedURL) throw new Error('Supabase did not return a signed URL.');
  return result.signedURL.startsWith('http') ? result.signedURL : `${url}/storage/v1${result.signedURL}`;
}

export async function uploadPublicLogo(bytes: Buffer): Promise<{ path: string; publicUrl: string }> {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length < 8 || bytes.length > MAX_LOGO_BYTES || !bytes.subarray(0, 8).equals(pngSignature)) {
    throw new Error('Logo image must be a valid PNG under 2 MB.');
  }
  const objectPath = 'branding/crd-logo-full.png';
  await upload(PUBLIC_BUCKET, objectPath, bytes, 'image/png', true);
  const { url } = config();
  return { path: objectPath, publicUrl: `${url}/storage/v1/object/public/${PUBLIC_BUCKET}/${objectPath}` };
}
