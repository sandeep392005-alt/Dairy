function isAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = req.authUser?.email?.trim().toLowerCase();

  if (!adminEmail) {
    return res.status(500).json({
      error: 'Admin access is not configured. Set ADMIN_EMAIL in backend env.',
    });
  }

  if (!userEmail || userEmail !== adminEmail) {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  return next();
}

module.exports = isAdmin;