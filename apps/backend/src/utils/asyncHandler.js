// V8 TurboFan Optimization: extract try/catch blocks into a higher-order function
// so that the actual route handler logic can be optimized by V8.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('Unhandled route error:', err);
    res.status(500).json({ error: err.message });
  });
};

module.exports = asyncHandler;
