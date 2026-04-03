const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function logAuthDebug(message, context = {}) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[auth]', message, context);
  }
}

function getSupabaseConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';

  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    '';

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

async function verifySupabaseAccessToken(token) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error('Supabase auth verification is not configured on backend.');
    error.code = 'SUPABASE_AUTH_CONFIG_MISSING';
    throw error;
  }

  let response;
  try {
    response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (networkError) {
    const error = new Error('Unable to reach Supabase auth service.');
    error.code = 'SUPABASE_AUTH_UNREACHABLE';
    error.cause = networkError;
    throw error;
  }

  if (!response.ok) {
    let upstreamMessage = `Supabase auth rejected token (status ${response.status}).`;
    try {
      const body = await response.json();
      upstreamMessage = body?.msg || body?.error_description || body?.error || upstreamMessage;
    } catch (parseError) {
      // Keep fallback message if body is not JSON.
    }

    return {
      user: null,
      error: {
        code: 'SUPABASE_AUTH_REJECTED',
        status: response.status,
        message: upstreamMessage,
      },
    };
  }

  const user = await response.json();

  if (!user?.email || !user?.id) {
    return {
      user: null,
      error: {
        code: 'SUPABASE_USER_PAYLOAD_INVALID',
        status: 401,
        message: 'Supabase user payload missing email or id.',
      },
    };
  }

  return {
    user: {
      email: user.email,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      googleId: null,
      picture: user.user_metadata?.avatar_url || null,
      emailVerified: Boolean(user.email_confirmed_at),
      provider: user.app_metadata?.provider || 'local',
      supabaseUserId: user.id,
    },
    error: null,
  };
}

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.trim().split(/\s+/);

    if (!token || scheme !== 'Bearer') {
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
        logAuthDebug('Google token verification failed. Falling back to Supabase token verification.');
      }
    }

    const { user: supabaseUser, error: supabaseError } = await verifySupabaseAccessToken(token);
    if (supabaseUser) {
      req.authUser = supabaseUser;
      return next();
    }

    logAuthDebug('Supabase token verification failed.', {
      code: supabaseError?.code,
      status: supabaseError?.status,
      message: supabaseError?.message,
    });

    return res.status(401).json({
      error: 'Invalid or expired token.',
      code: supabaseError?.code || 'AUTH_TOKEN_INVALID',
      details: supabaseError?.message || 'Token could not be validated.',
    });

  } catch (error) {
    if (error.code === 'SUPABASE_AUTH_CONFIG_MISSING') {
      logAuthDebug('Backend auth configuration missing.', {
        hasSupabaseUrl: Boolean(
          process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
        ),
        hasSupabaseAnonKey: Boolean(
          process.env.SUPABASE_ANON_KEY?.trim() ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()
        ),
      });

      return res.status(500).json({
        error: 'Backend auth configuration is incomplete. Set SUPABASE_URL and SUPABASE_ANON_KEY.',
        code: error.code,
      });
    }

    if (error.code === 'SUPABASE_AUTH_UNREACHABLE') {
      logAuthDebug('Supabase auth service unreachable.', { message: error.message });
      return res.status(502).json({
        error: 'Supabase auth service is unreachable. Please try again shortly.',
        code: error.code,
      });
    }

    logAuthDebug('Unexpected auth verification error.', {
      code: error.code || 'UNKNOWN',
      message: error.message,
    });

    return res.status(401).json({
      error: 'Invalid or expired token.',
      code: error.code || 'AUTH_TOKEN_INVALID',
    });
  }
}

module.exports = verifyToken;
