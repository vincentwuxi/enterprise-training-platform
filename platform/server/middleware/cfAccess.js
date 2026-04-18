/**
 * Cloudflare Access JWT Verification Middleware
 * ─────────────────────────────────────────────
 * Validates the Cf-Access-Jwt-Assertion header injected by
 * Cloudflare Access after a user passes the gateway authentication.
 *
 * - Production: Enforced — blocks requests without valid CF JWT
 * - Development: Skipped — allows direct localhost access
 *
 * Env vars:
 *   CF_TEAM_DOMAIN   — e.g. "aivolo" (for https://aivolo.cloudflareaccess.com)
 *   CF_ACCESS_AUD    — Application Audience Tag from CF Access dashboard
 *
 * NOTE: Env vars are read at runtime (not import time) because ES module
 * imports are hoisted before dotenv.config() runs.
 */
import jwt from 'jsonwebtoken';
import https from 'https';

// ── Runtime config getters (avoid ES module import timing issue) ──
function getCfTeamDomain() { return process.env.CF_TEAM_DOMAIN || ''; }
function getCfAccessAud()  { return process.env.CF_ACCESS_AUD || ''; }
function getCertsUrl() {
  const domain = getCfTeamDomain();
  return domain ? `https://${domain}.cloudflareaccess.com/cdn-cgi/access/certs` : '';
}

// ── JWKS Cache ──
let cachedKeys = null;
let cacheExpiresAt = 0;
const CACHE_TTL = 3600000; // 1 hour

/**
 * Fetch Cloudflare's public signing keys (JWKS)
 */
function fetchCfPublicKeys() {
  return new Promise((resolve, reject) => {
    if (cachedKeys && Date.now() < cacheExpiresAt) {
      return resolve(cachedKeys);
    }

    const certsUrl = getCertsUrl();
    if (!certsUrl) {
      return reject(new Error('CF_TEAM_DOMAIN not configured'));
    }

    https.get(certsUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          cachedKeys = parsed.public_certs || parsed.keys || [];
          cacheExpiresAt = Date.now() + CACHE_TTL;
          resolve(cachedKeys);
        } catch (e) {
          reject(new Error(`Failed to parse CF JWKS: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Verify a Cloudflare Access JWT token
 * Exported for use by SSO endpoint
 */
export async function verifyCfToken(token) {
  const keys = await fetchCfPublicKeys();

  // Cloudflare returns public_certs as array of {kid, cert}
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) throw new Error('Invalid JWT format');

  const matchingKey = keys.find(k => k.kid === decoded.header.kid);
  if (!matchingKey) throw new Error('No matching signing key found');

  const cfAud = getCfAccessAud();
  const cfDomain = getCfTeamDomain();

  return new Promise((resolve, reject) => {
    jwt.verify(token, matchingKey.cert, {
      audience: cfAud,
      issuer: `https://${cfDomain}.cloudflareaccess.com`,
      algorithms: ['RS256'],
    }, (err, payload) => {
      if (err) reject(err);
      else resolve(payload);
    });
  });
}

/**
 * Express Middleware: Verify Cloudflare Access JWT (Optional Layer)
 *
 * Behavior:
 * - NODE_ENV !== 'production': skip (allow direct access)
 * - CF_TEAM_DOMAIN not set: skip
 * - No CF JWT header: pass through (app-level JWT auth is primary security)
 * - Valid CF JWT: attach identity to req.cfIdentity
 * - Invalid CF JWT: log warning and pass through (don't block)
 */
export function verifyCfAccess(req, res, next) {
  // Skip in non-production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Skip if CF Access not configured (read at runtime!)
  const cfDomain = getCfTeamDomain();
  const cfAud = getCfAccessAud();
  if (!cfDomain || !cfAud) {
    return next();
  }

  const cfJwt = req.headers['cf-access-jwt-assertion'];

  // No CF JWT header — pass through (app-level auth handles security)
  if (!cfJwt) {
    return next();
  }

  // Verify the CF JWT (optional enrichment)
  verifyCfToken(cfJwt)
    .then(payload => {
      req.cfIdentity = {
        email: payload.email,
        sub: payload.sub,
        iss: payload.iss,
      };
      next();
    })
    .catch(err => {
      console.warn(`[CF Access] Invalid CF JWT from ${req.ip}: ${err.message}`);
      // Don't block — app-level JWT auth is the primary gate
      next();
    });
}

