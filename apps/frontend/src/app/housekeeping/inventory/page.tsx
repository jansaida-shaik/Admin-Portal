'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import { Plus, Search, MapPin, PackageOpen, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CleaningInventoryPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    itemId: '',
    locationId: '',
    quantityAdded: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stockData, alertsData, itemsData, locsData] = await Promise.all([
        fetchApi('/housekeeping/inventory'),
        fetchApi('/housekeeping/inventory/alerts'),
        fetchApi('/items?limit=1000'), // Ensure backend returns cleaning items, for now just use regular items
        fetchApi('/locations?limit=1000')
      ]);
      setStocks(stockData || []);
      setAlerts(alertsData || []);
      setItems(itemsData?.data || []);
      setLocations(locsData || []);
    } catch (e) {
      console.error('Failed to fetch inventory', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/housekeeping/inventory/update', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setShowAddForm(false);
      fetchData();
      toast.success('Stock updated successfully');
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const filtered = stocks.filter(s => (s.item?.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-head)' }}>Cleaning Inventory</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Manage consumables, track stock levels, and low-stock alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ExportButton data={stocks} filename="cleaning_inventory.csv" />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: 'var(--brand-primary)', color: 'white',
              border: 'none', padding: '0 20px', borderRadius: '8px',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {showAddForm ? <XCircle size={18} /> : <Plus size={18} />}
            {showAddForm ? 'Cancel' : 'Update Stock'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && !showAddForm && (
        <div style={{ background: '#f59e0b15', border: '1px solid #f59e0b', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', fontWeight: 700, fontSize: '14px' }}>
            <AlertTriangle size={18} /> Low Stock Alerts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {alerts.map(a => (
              <div key={a.id} style={{ background: 'var(--bg-panel)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-main)', fontSize: '13px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-head)' }}>{a.item?.name}</span> at <span style={{ fontWeight: 600, color: 'var(--text-head)' }}>{a.location?.name}</span> 
                <br/> Current: <strong style={{ color: '#ef4444' }}>{a.quantity}</strong> (Min: {a.minStock})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-head)' }}>Update Stock Levels</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Item</label>
              <select required value={formData.itemId} onChange={(e) => setFormData({...formData, itemId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">Select Item</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Location (Branch)</label>
              <select required value={formData.locationId} onChange={(e) => setFormData({...formData, locationId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">Select Location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name} - {l.city}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Quantity Added</label>
              <input type="number" required min="1" value={formData.quantityAdded} onChange={(e) => setFormData({...formData, quantityAdded: Number(e.target.value)})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
              <button type="submit" style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Update Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Standard Table Interface */}
      <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
        
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-main)', display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
            <input
              type="text"
              placeholder="Search by item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-body)', border: '1px solid var(--border-main)', padding: '10px 16px 10px 44px', borderRadius: '8px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading inventory...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-body)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Item Name</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Location (Branch)</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Quantity</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stock) => {
                const isLow = stock.quantity <= stock.minStock;
                return (
                  <tr key={stock.id} style={{ borderTop: '1px solid var(--border-main)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                          <PackageOpen size={18} />
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--text-head)', fontSize: '14px' }}>
                          {stock.item?.name || `ID: ${stock.itemId}`}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} color="var(--text-sub)" />
                        <span style={{ fontSize: '14px', color: 'var(--text-head)', fontWeight: 500 }}>{stock.location?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '15px', color: 'var(--text-head)', fontWeight: 700 }}>
                      {stock.quantity}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {isLow ? (
                        <span style={{ background: '#ef444415', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                          LOW STOCK
                        </span>
                      ) : (
                        <span style={{ background: '#10b98115', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                          ADEQUATE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
