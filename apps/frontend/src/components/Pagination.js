'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Pagination({ page, limit, totalPages, total, setPage, setLimit }) {
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    setPortalRoot(document.getElementById('pagination-portal-root'));
  }, []);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  const paginationContent = (
    <div style={{
      width: '100%',
      height: '60px',
      background: 'var(--bg-pagination-transparent, rgba(10, 15, 26, 0.55))',
      borderTop: '1px solid var(--border-main)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
      padding: '0 40px',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px',
      color: 'var(--text-head)',
    }}>
      {/* Left: Per-page + count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-sub)', fontSize: '12px' }}>Show per page:</span>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-head)',
            border: '1px solid var(--border-main)',
            borderRadius: '8px',
            padding: '4px 8px',
            outline: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '12px',
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span style={{ color: 'var(--text-sub)', fontWeight: 500, fontSize: '12px' }}>
          Displaying{' '}
          <strong style={{ color: 'var(--text-head)', fontWeight: 700 }}>
            {total === 0 ? '0-0' : `${start}-${end}`}
          </strong>{' '}
          of {total}
        </span>
      </div>

      {/* Right: Prev / Page / Next */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handlePrev}
          disabled={page === 1}
          style={{
            background: 'var(--bg-input)',
            color: page === 1 ? 'var(--text-sub)' : 'var(--text-head)',
            border: '1px solid var(--border-main)',
            borderRadius: '8px',
            padding: '5px 14px',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            opacity: page === 1 ? 0.45 : 1,
            fontWeight: 700,
            fontSize: '12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-main)'; }}
        >
          Prev
        </button>

        <div style={{
          background: 'rgba(245, 130, 32, 0.1)',
          color: '#F58220',
          padding: '5px 14px',
          borderRadius: '8px',
          fontWeight: 800,
          fontSize: '12px',
          border: '1px solid rgba(245, 130, 32, 0.22)',
          minWidth: '90px',
          textAlign: 'center',
        }}>
          Page {page} of {totalPages}
        </div>

        <button
          onClick={handleNext}
          disabled={page >= totalPages}
          style={{
            background: 'var(--bg-input)',
            color: page >= totalPages ? 'var(--text-sub)' : 'var(--text-head)',
            border: '1px solid var(--border-main)',
            borderRadius: '8px',
            padding: '5px 14px',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            opacity: page >= totalPages ? 0.45 : 1,
            fontWeight: 700,
            fontSize: '12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-main)'; }}
        >
          Next
        </button>
      </div>
    </div>
  );

  if (!portalRoot) return null;

  return createPortal(paginationContent, portalRoot);
}
