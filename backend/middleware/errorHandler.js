export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || (error.name === 'CastError' ? 404 : 500);
  if (process.env.NODE_ENV !== 'production') console.error(error);
  const message = status >= 500 ? 'Something went wrong. Please try again.' : error.message;
  res.status(status).json({ success: false, message, ...(error.details ? { errors: error.details } : {}), ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}) });
}
