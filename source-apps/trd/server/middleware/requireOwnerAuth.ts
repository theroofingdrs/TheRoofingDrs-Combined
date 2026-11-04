import type { NextFunction, Request, Response } from 'express';

export interface VerifiedStaffUser {
  id: string;
  email: string;
}

export async function requireOwnerAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const supabaseUrl = process.env.SUPABASE_URL;
  const apiKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  if (!supabaseUrl || !apiKey) {
    console.error('[Auth] SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_PUBLISHABLE_KEY) must be configured.');
    return res.status(503).json({ error: 'Authentication service is not configured.' });
  }

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: apiKey, Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return res.status(401).json({ error: 'Session is invalid or expired.' });

    const user = await response.json() as { id?: string; email?: string };
    if (!user.id || user.email?.toLowerCase() !== 'theroofingdrs@gmail.com') {
      return res.status(403).json({ error: 'This account is not authorized for staff administration.' });
    }

    (req as Request & { verifiedStaff?: VerifiedStaffUser }).verifiedStaff = {
      id: user.id,
      email: user.email,
    };
    return next();
  } catch (error) {
    console.error('[Auth] Supabase token verification failed:', error);
    return res.status(503).json({ error: 'Authentication service is temporarily unavailable.' });
  }
}
