export function basicAuth(req, res, next) {
  const user = process.env.AUTH_USER;
  const pass = process.env.AUTH_PASS;

  if (!user || !pass) {
    // No credentials configured: fail closed rather than silently allowing access.
    return res.status(500).send('Server auth is not configured (AUTH_USER/AUTH_PASS missing)');
  }

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');
    const reqUser = decoded.slice(0, separatorIndex);
    const reqPass = decoded.slice(separatorIndex + 1);
    if (reqUser === user && reqPass === pass) {
      return next();
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="langapp"');
  return res.status(401).send('Authentication required');
}
