const DATABASE_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'EHOSTUNREACH',
  'ENOTFOUND',
  'EPERM',
  'ETIMEDOUT',
  'P1000',
  'P1001',
  'P1010'
]);

function getDatabaseTarget() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(databaseUrl);
    return {
      host: parsed.hostname || 'localhost',
      port: parsed.port || '5432',
      database: parsed.pathname.replace(/^\/+/, '') || 'unknown'
    };
  } catch {
    return null;
  }
}

function isDatabaseConnectionError(err) {
  return Boolean(err?.code && DATABASE_ERROR_CODES.has(err.code));
}

function formatDatabaseConnectionMessage() {
  const target = getDatabaseTarget();

  if (!target) {
    return 'Database connection failed. Verify DATABASE_URL and ensure PostgreSQL is running.';
  }

  return `Database connection failed. Could not reach PostgreSQL at ${target.host}:${target.port}/${target.database}.`;
}

function buildDatabaseErrorResponse(err) {
  return {
    status: 503,
    body: {
      error: formatDatabaseConnectionMessage(),
      code: err.code,
      hint: 'Start PostgreSQL and verify apps/backend/.env points to a reachable database.'
    }
  };
}

module.exports = {
  buildDatabaseErrorResponse,
  formatDatabaseConnectionMessage,
  isDatabaseConnectionError
};
