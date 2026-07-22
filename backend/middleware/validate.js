import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(422).json({ success: false, message: 'Please check the highlighted fields.', errors: result.array().map(({ path, msg }) => ({ field: path, message: msg })) });
}
