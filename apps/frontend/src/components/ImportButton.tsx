'use client';
import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface ImportButtonProps {
  moduleName: string;
  sampleData: any[];
  onImportSuccess?: (result: any) => void;
}

export default function ImportButton({ moduleName, sampleData, onImportSuccess }: ImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadSampleXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, `${moduleName}_sample.xlsx`);
    setIsOpen(false);
  };

  const downloadSampleCSV = () => {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${moduleName}_sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setIsOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const loadingToast = toast.loading(`Importing ${moduleName}...`);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData || jsonData.length === 0) {
            toast.error('The uploaded file is empty.', { id: loadingToast });
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }

          // Send JSON payload to backend
          const response = await axios.post(`/api/import/${moduleName}`, { data: jsonData });
          
          if (response.data.success) {
            toast.success(`Imported ${response.data.importedCount} records successfully!`, { id: loadingToast });
            if (response.data.skippedCount > 0) {
               toast.success(`Skipped ${response.data.skippedCount} duplicates.`, { duration: 4000 });
            }
            if (onImportSuccess) {
              onImportSuccess(response.data);
            }
          } else {
            toast.error(response.data.message || 'Import failed', { id: loadingToast });
          }
        } catch (err: any) {
          console.error("Import processing error:", err);
          toast.error(err.response?.data?.error || 'Failed to process file', { id: loadingToast });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      
      reader.onerror = () => {
        toast.error('Error reading file', { id: loadingToast });
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      
      reader.readAsBinaryString(file);
    } catch (err: any) {
      toast.error('Unexpected error occurred', { id: loadingToast });
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button
        onClick={() => !isImporting && setIsOpen(!isOpen)}
        disabled={isImporting}
        style={{
          background: 'rgba(255,255,255,0.05)', color: 'var(--text-sub)', border: '1px solid var(--border-main)',
          padding: '10px 16px', borderRadius: '14px', fontWeight: 600, fontSize: '13px', cursor: isImporting ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', opacity: isImporting ? 0.7 : 1
        }}
        onMouseEnter={(e) => { if(!isImporting) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; } }}
        onMouseLeave={(e) => { if(!isImporting) { e.currentTarget.style.color = 'var(--text-sub)'; e.currentTarget.style.borderColor = 'var(--border-main)'; } }}
      >
        {isImporting ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        )}
        {isImporting ? 'Importing...' : 'Import'}
      </button>

      {isOpen && !isImporting && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px', zIndex: 50,
          background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)', padding: '6px', minWidth: '180px'
        }}>
          {[
            { label: 'Upload File', onClick: triggerFileInput, icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12' },
            { label: 'Download Sample (Excel)', onClick: downloadSampleXLSX, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15h6' },
            { label: 'Download Sample (CSV)', onClick: downloadSampleCSV, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15h6' }
          ].map((item, idx) => (
            <button key={idx} onClick={item.onClick} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px',
              background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer', borderRadius: '8px', textAlign: 'left', transition: 'all 0.15s ease',
              marginTop: idx === 1 ? '4px' : '0', borderTop: idx === 1 ? '1px solid var(--border-main)' : 'none'
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
