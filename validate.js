export function validate(schema) {
  return (req, res, next) => {
    const valid = schema.safeParse(req.body);
    if (!valid.success) {
      return res.status(400).json({ error: 'Invalid Input' });
    }
    req.body = valid.data;
    next();
  };
}
