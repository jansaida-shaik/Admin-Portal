'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function EmployeeLookupPage({ searchParams }) {
  const params = use(searchParams);
  const name = params?.name;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function lookupEmployee() {
      if (!name) {
        setError('No employee name provided for lookup.');
        setLoading(false);
        return;
      }

      try {
        // Query the backend for an exact name match
        const response = await fetchApi(`/users?nameExact=${encodeURIComponent(name)}`);
        
        if (response?.data?.length > 0) {
          const matchedUser = response.data[0];
          // Redirect to the employee profile page
          router.replace(`/employees/${matchedUser.id}`);
        } else {
          setError(`No registered employee profile found for "${name}".`);
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to perform employee lookup. Please try again later.');
        setLoading(false);
      }
    }

    lookupEmployee();
  }, [name, router]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '4px solid var(--border-main)', borderTopColor: 'var(--accent)',
          borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <div style={{ marginTop: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--text-sub)' }}>
          Looking up employee profile for {name ? `"${name}"` : '...'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', maxWidth: '480px', width: '100%', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>
          Profile Not Found
        </h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.6 }}>
          {error}
          <br /><br />
          This name is assigned to an asset, but they do not have an official employee profile in the system yet.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/mobile-numbers" style={{
            padding: '10px 20px', borderRadius: '12px', background: 'var(--bg-input)',
            color: 'var(--text-head)', fontWeight: 600, fontSize: '13px', textDecoration: 'none'
          }}>
            Go Back
          </Link>
          <Link href="/employees" style={{
            padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #F58220, #245fb4)',
            color: '#fff', fontWeight: 700, fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(245,130,32,0.2)'
          }}>
            View Employee Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
