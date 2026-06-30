export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      minHeight: '400px',
      color: 'var(--text-sub)',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255, 90, 31, 0.2)',
        borderTopColor: '#F58220',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em' }}>
        Loading module...
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
