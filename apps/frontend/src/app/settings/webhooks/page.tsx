'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Webhook, Plus, Trash2, Power } from 'lucide-react';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const data = await fetchApi('/webhooks');
      setWebhooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await fetchApi('/webhooks', {
        method: 'POST',
        body: JSON.stringify({
          url: formData.get('url'),
          event: formData.get('event'),
          secret: formData.get('secret')
        })
      });
      toast.success('Webhook added!');
      setShowModal(false);
      loadWebhooks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add webhook');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetchApi(`/webhooks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !current })
      });
      toast.success('Status updated');
      loadWebhooks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await fetchApi(`/webhooks/${id}`, { method: 'DELETE' });
      toast.success('Webhook deleted');
      loadWebhooks();
    } catch (err) {
      toast.error('Failed to delete webhook');
    }
  };

  return (
    <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
      <div className="responsive-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-head)', margin: 0 }}>Webhooks & Integrations</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Configure Discord/Slack alerts for portal events.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', background: '#F58220', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          <Plus size={18} /> Add Webhook
        </button>
      </div>

      <div className="glass-card" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-main)' }}>
              <th style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>URL Payload</th>
              <th style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Event Triggers</th>
              <th style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading...</td></tr>
            ) : webhooks.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)' }}>No webhooks configured.</td></tr>
            ) : (
              webhooks.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-head)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Webhook size={18} color="var(--text-sub)" />
                      </div>
                      <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.url}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-sub)' }}>
                    <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '12px' }}>
                      {w.event}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => toggleActive(w.id, w.isActive)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: w.isActive ? '#10b981' : 'var(--text-sub)', fontWeight: 600 }}>
                      <Power size={14} /> {w.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => handleDelete(w.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--text-head)' }}>Add Webhook</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>Payload URL *</label>
                <input name="url" type="url" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }} placeholder="https://discord.com/api/webhooks/..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>Event Trigger *</label>
                <select name="event" required style={{ width: '100%', padding: '12px', background: '#1c1c1c', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }}>
                  <option value="USER_CREATED">User Created</option>
                  <option value="SUBSCRIPTION_ADDED">Subscription Added</option>
                  <option value="TICKET_CREATED">Ticket Created</option>
                  <option value="ALL">All Events</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-main)', color: 'var(--text-sub)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#F58220', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Webhook</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
