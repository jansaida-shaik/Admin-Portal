'use client';
import { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select item...", 
  searchPlaceholder = "Type to filter...",
  style = {},
  className = "",
  renderOption = null
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Handle clicks outside to auto-close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map options safely (supports both { value, label } or simple strings) and filter duplicates
  const normalizedOptions = [];
  const seenValues = new Set();
  options.forEach(opt => {
    let val = '';
    let lbl = '';
    if (typeof opt === 'object' && opt !== null) {
      val = opt.value?.toString() || '';
      lbl = opt.label?.toString() || '';
    } else {
      val = opt?.toString() || '';
      lbl = opt?.toString() || '';
    }
    if (!seenValues.has(val)) {
      seenValues.add(val);
      normalizedOptions.push({ value: val, label: lbl });
    }
  });

  const filtered = normalizedOptions.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOpt = normalizedOptions.find(opt => opt.value === value);
  const displayLabel = selectedOpt ? selectedOpt.label : placeholder;

  const handleSelect = (val) => {
    onChange({ target: { value: val } }); // Mock native event to prevent breakage in legacy handlers
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={className} style={{ 
      position: 'relative', 
      height: '100%', 
      minWidth: style.minWidth || '150px',
      flexShrink: 0,
      userSelect: 'none',
      ...style 
    }}>
      {/* Trigger Element */}
      <div 
        onClick={() => {
          if (isOpen) setSearch('');
          setIsOpen(!isOpen);
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          background: 'var(--bg-panel)',
          border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border-main)'}`,
          borderRadius: '14px',
          color: 'var(--text-head)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          boxSizing: 'border-box',
          boxShadow: isOpen ? '0 0 0 3px rgba(245, 130, 32, 0.15)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          opacity: selectedOpt ? 1 : 0.6,
          marginRight: '8px'
        }}>
          {displayLabel}
        </span>
        
        {/* Down Chevron Vector */}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
          transition: 'transform 0.2s ease',
          opacity: 0.7,
          flexShrink: 0
        }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Dropdown Drawer Panel */}
      {isOpen && (
        <div className="glass-card" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          maxHeight: '260px',
          borderRadius: '16px',
          background: 'var(--bg-pagination)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid var(--border-main)',
          boxShadow: 'var(--card-shadow)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          
          {/* Inline Search Bar */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-main)', background: 'transparent' }}>
            <input 
              type="text"
              autoFocus
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                height: '34px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-main)',
                borderRadius: '10px',
                padding: '0 12px',
                color: 'var(--text-head)',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Scrollable Options List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '12px' }}>
                No results found
              </div>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    onClick={() => handleSelect(opt.value)}
                    className={`searchable-select-option ${isSelected ? 'selected' : ''}`}
                  >
                    {renderOption ? renderOption(opt, isSelected) : <span>{opt.label}</span>}
                    {isSelected && !renderOption && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .searchable-select-option {
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          color: var(--text-head);
          font-size: 13px;
          font-weight: 500;
          background: transparent;
          transition: background 0.15s ease, color 0.15s ease;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .searchable-select-option:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        body.light-mode .searchable-select-option:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .searchable-select-option.selected {
          color: #fff !important;
          font-weight: 700;
          background: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
