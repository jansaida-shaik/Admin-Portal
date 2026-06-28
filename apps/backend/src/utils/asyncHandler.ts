import { buildDatabaseErrorResponse, isDatabaseConnectionError } from './databaseError';

// V8 TurboFan Optimization: extract try/catch blocks into a higher-order function
// so that the actual route handler logic can be optimized by V8.
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('Unhandled route error:', err);

    if (isDatabaseConnectionError(err)) {
      const {
        status,
        body
      } = buildDatabaseErrorResponse(err);
      return res.status(status).json(body);
    }

    res.status(500).json({
      error: err.message || 'Unexpected server error'
    });
  });
};

export default asyncHandler;
