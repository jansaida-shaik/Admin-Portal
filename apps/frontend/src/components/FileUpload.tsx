'use client';
import { useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function FileUpload({ value = '', onChange, label = 'Files / Documents' }) {
  const [uploading, setUploading] = useState(false);

  // Parse JSON representation
  let files = [];
  try {
    files = typeof value === 'string' && value ? JSON.parse(value) : (Array.isArray(value) ? value : []);
  } catch (e) { files = []; }

  const handleFileChange = async (e) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < selected.length; i++) {
      formData.append('files', selected[i]);
    }

    try {
      // Reusing default fetch for multipart form since JSON content-type breaks boundary headers
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.urls) {
        const newFiles = [...files, ...data.urls];
        onChange(JSON.stringify(newFiles)); // Send stringified JSON back up
      } else {
        alert('Upload fail: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Connection Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    const newFiles = files.filter((_, idx) => idx !== indexToRemove);
    onChange(JSON.stringify(newFiles));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </label>
      )}
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* File Select Core Node */}
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dotted var(--border-main)',
          borderRadius: '12px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          color: 'var(--text-head)',
          fontSize: '13px',
          fontWeight: 700,
          transition: 'all 0.2s',
          userSelect: 'none'
        }}
        onMouseEnter={e => { if(!uploading) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={e => { if(!uploading) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        >
          <input 
            type="file" 
            multiple 
            disabled={uploading}
            onChange={handleFileChange}
            style={{ display: 'none' }} 
          />
          <span>{uploading ? '📡 Storing Uploads...' : '📎 Attach Receipts/Docs'}</span>
        </label>

        {/* Render dynamic chips */}
        {files.map((url, idx) => {
          const filename = url.split('/').pop().substring(14); // trim original random hash timestamps
          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'rgba(245, 130, 32, 0.06)',
              border: '1px solid rgba(245, 130, 32, 0.2)',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#F58220'
            }}>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#F58220', textDecoration: 'none', display:'inline-flex', alignItems:'center', gap:'4px' }}>
                📄 {filename.length > 15 ? filename.substring(0,12) + '...' : filename}
              </a>
              <button 
                type="button" 
                onClick={() => removeFile(idx)} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 2px',
                  fontWeight: 900,
                  display:'flex', alignItems:'center'
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
