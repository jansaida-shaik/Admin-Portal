'use client';
import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers?: { key: string; label: string }[];
}

export default function ExportButton({ data, filename, headers }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatData = () => {
    if (!headers) return data;
    return data.map(item => {
      const formatted: any = {};
      headers.forEach(h => {
        // Handle nested keys e.g. "location.name"
        const value = h.key.split('.').reduce((o, i) => (o ? o[i] : ''), item);
        formatted[h.label] = value || '';
      });
      return formatted;
    });
  };

  const exportExcel = () => {
    const formattedData = formatData();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    setIsOpen(false);
  };

  const exportCSV = () => {
    const formattedData = formatData();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const formattedData = formatData();
    if (formattedData.length === 0) {
      alert("No data to export");
      return;
    }
    const tableHeaders = Object.keys(formattedData[0]);
    const tableData = formattedData.map(row => Object.values(row));

    doc.text(`Codegnan Report: ${filename}`, 14, 15);
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 130, 32] } // Codegnan orange
    });

    doc.save(`${filename}.pdf`);
    setIsOpen(false);
  };

  const printData = () => {
    const formattedData = formatData();
    if (formattedData.length === 0) return;
    const tableHeaders = Object.keys(formattedData[0]);
    const tableData = formattedData.map(row => Object.values(row));

    let printHtml = `
      <html><head><title>Print Report - ${filename}</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h2 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; color: #333; }
      </style>
      </head><body>
      <h2>Codegnan Report: ${filename}</h2>
      <table>
        <thead><tr>${tableHeaders.map(th => `<th>${th}</th>`).join('')}</tr></thead>
        <tbody>
          ${tableData.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      </body></html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.05)', color: 'var(--text-sub)', border: '1px solid var(--border-main)',
          padding: '10px 16px', borderRadius: '14px', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-sub)'; e.currentTarget.style.borderColor = 'var(--border-main)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px', zIndex: 50,
          background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)', padding: '6px', minWidth: '150px'
        }}>
          {[
            { label: 'Export as Excel', onClick: exportExcel, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
            { label: 'Export as CSV', onClick: exportCSV, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
            { label: 'Export as PDF', onClick: exportPDF, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
            { label: 'Print Document', onClick: printData, icon: 'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z' }
          ].map((item, idx) => (
            <button key={idx} onClick={item.onClick} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
              background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer', borderRadius: '8px', textAlign: 'left', transition: 'all 0.15s ease'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-sub)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon}></path>
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
