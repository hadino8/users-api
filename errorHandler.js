export function errorHandler(err, req, res, next) {
  // console.log(err);
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Email already exists',
    });
  }
  res.status(500).json({ error: 'Internal server error' });
}
