const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifySupabaseAccessToken(token) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const user = await response.json();

  if (!user?.email || !user?.id) {
    return null;
  }

  return {
    email: user.email,
    fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
    googleId: null,
    picture: user.user_metadata?.avatar_url || null,
    emailVerified: Boolean(user.email_confirmed_at),
    provider: user.app_metadata?.provider || 'local',
    supabaseUserId: user.id,
  };
}

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token.' });
    }

    if (process.env.GOOGLE_CLIENT_ID?.trim()) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (payload?.email && payload?.sub) {
          req.authUser = {
            email: payload.email,
            fullName: payload.name || '',
            googleId: payload.sub,
            picture: payload.picture || null,
            emailVerified: payload.email_verified,
            provider: 'google',
          };

          return next();
        }
      } catch (googleError) {
        // Fall back to Supabase token verification.
      }
    }

    const supabaseUser = await verifySupabaseAccessToken(token);
    if (supabaseUser) {
      req.authUser = supabaseUser;
      return next();
    }

    return res.status(401).json({ error: 'Invalid token payload.' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = verifyToken;
