'use client';

import { createPortal } from 'react-dom';

export default function Pagination({ page, limit, totalPages, total, setPage, setLimit }) {
  const portalRoot = typeof document === 'undefined'
    ? null
    : document.getElementById('pagination-portal-root');

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  const paginationContent = (
    <>
      <style>{`
        .pagination-shell {
          padding: 8px 12px !important;
          min-height: 52px !important;
        }
        .pagination-meta {
          gap: 6px !important;
        }
        .pagination-actions {
          gap: 4px !important;
        }
        .pagination-btn {
          padding: 4px 8px !important;
          font-size: 11px !important;
          min-width: unset !important;
        }
        .pagination-text {
          font-size: 11px !important;
        }
        @media (max-width: 480px) {
          .hide-on-mobile {
            display: none !important;
          }
          .pagination-shell {
            padding: 8px !important;
          }
          .pagination-page-indicator {
            padding: 4px 8px !important;
            min-width: 60px !important;
            font-size: 11px !important;
          }
        }
        @media (min-width: 768px) {
          .pagination-shell {
            padding: 12px 40px !important;
            min-height: 60px !important;
          }
          .pagination-meta { gap: 12px !important; }
          .pagination-actions { gap: 8px !important; }
          .pagination-btn { padding: 5px 14px !important; font-size: 12px !important; }
          .pagination-text { font-size: 12px !important; }
          .pagination-page-indicator { padding: 5px 14px !important; min-width: 90px !important; font-size: 12px !important; }
        }
      `}</style>
      <div className="pagination-shell" style={{
        width: '100%',
        background: 'var(--bg-pagination-transparent, rgba(10, 15, 26, 0.55))',
        borderTop: '1px solid var(--border-main)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-head)',
      }}>
        {/* Left: Per-page + count */}
        <div className="pagination-meta" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="hide-on-mobile pagination-text" style={{ fontWeight: 600, color: 'var(--text-sub)' }}>Show per page:</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-head)',
              border: '1px solid var(--border-main)',
              borderRadius: '8px',
              padding: '4px 6px',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="pagination-text" style={{ color: 'var(--text-sub)', fontWeight: 500, marginLeft: '4px' }}>
            <span className="hide-on-mobile">Displaying </span>
            <strong style={{ color: 'var(--text-head)', fontWeight: 700 }}>
              {total === 0 ? '0-0' : `${start}-${end}`}
            </strong>{' '}
            <span className="hide-on-mobile">of {total}</span>
          </span>
        </div>

        {/* Right: Prev / Page / Next */}
        <div className="pagination-actions" style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          <button
            className="pagination-btn"
            onClick={handlePrev}
            disabled={page === 1}
            style={{
              background: 'var(--bg-input)',
              color: page === 1 ? 'var(--text-sub)' : 'var(--text-head)',
              border: '1px solid var(--border-main)',
              borderRadius: '8px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.45 : 1,
              fontWeight: 700,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-main)'; }}
          >
            <span className="hide-on-mobile">Prev</span>
            <span className="hide-on-desktop" style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: '&larr;' }} />
            <style>{`@media (max-width: 480px) { .hide-on-desktop { display: inline !important; } }`}</style>
          </button>

          <div className="pagination-page-indicator" style={{
            background: 'rgba(245, 130, 32, 0.1)',
            color: '#F58220',
            borderRadius: '8px',
            fontWeight: 800,
            border: '1px solid rgba(245, 130, 32, 0.22)',
            textAlign: 'center',
          }}>
            <span className="hide-on-mobile">Page </span>{page} <span className="hide-on-mobile">of </span><span style={{display:'none'}} className="slash">/</span>{totalPages}
            <style>{`@media (max-width: 480px) { .slash { display: inline !important; margin: 0 2px; color: rgba(245,130,32,0.5); } }`}</style>
          </div>

          <button
            className="pagination-btn"
            onClick={handleNext}
            disabled={page >= totalPages}
            style={{
              background: 'var(--bg-input)',
              color: page >= totalPages ? 'var(--text-sub)' : 'var(--text-head)',
              border: '1px solid var(--border-main)',
              borderRadius: '8px',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages ? 0.45 : 1,
              fontWeight: 700,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-main)'; }}
          >
            <span className="hide-on-mobile">Next</span>
            <span className="hide-on-desktop" style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: '&rarr;' }} />
          </button>
        </div>
      </div>
    </>
  );

  if (!portalRoot) return null;

  return createPortal(paginationContent, portalRoot);
}
