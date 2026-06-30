'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import { Plus, Search, CheckCircle, XCircle, Camera, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChecklistsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Form state for Admin
  const [formData, setFormData] = useState({
    userId: '',
    task: ''
  });

  // Form state for Completion (Staff)
  const [completionPhoto, setCompletionPhoto] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksData, usersData] = await Promise.all([
        fetchApi(`/housekeeping/checklist?date=${dateFilter}`),
        fetchApi('/users?limit=1000')
      ]);
      setTasks(tasksData || []);
      setUsers(usersData?.data || []);
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/housekeeping/checklist', {
        method: 'POST',
        body: JSON.stringify({ ...formData, date: dateFilter })
      });
      setShowAddForm(false);
      fetchData();
      toast.success('Task assigned successfully');
      setFormData({ userId: '', task: '' });
    } catch (error: any) {
      toast.error('Failed to assign task');
    }
  };

  const completeTask = async (id: string, isCompleted: boolean) => {
    const photoUrl = completionPhoto[id];
    if (isCompleted && !photoUrl) {
      toast.error('A photo link is mandatory to complete this task.');
      return;
    }

    try {
      await fetchApi(`/housekeeping/checklist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isCompleted, photoUrl: isCompleted ? photoUrl : null })
      });
      toast.success(isCompleted ? 'Task marked complete' : 'Task unmarked');
      
      // clear photo text if unmarking
      if (!isCompleted) {
        setCompletionPhoto(prev => ({...prev, [id]: ''}));
      }

      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update task');
    }
  };

  const filtered = tasks.filter(t => (t.task || '').toLowerCase().includes(search.toLowerCase()) || (t.user?.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-head)' }}>Daily Checklists</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Assign tasks and track proof of completion with mandatory photos.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
              color: 'var(--text-head)', padding: '8px 16px', borderRadius: '8px',
              fontSize: '14px', outline: 'none'
            }}
          />
          <ExportButton data={tasks} filename={`checklists_${dateFilter}.csv`} />
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
            {showAddForm ? 'Cancel' : 'Assign Task'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-head)' }}>Assign New Task for {dateFilter}</h2>
          <form onSubmit={handleAssign} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Employee</label>
              <select required value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">Select Employee</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.department || 'General'}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Task Description</label>
              <input type="text" required value={formData.task} onChange={(e) => setFormData({...formData, task: e.target.value})} placeholder="e.g. Deep clean the lobby" style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
              <button type="submit" style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Assign Task
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
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-body)', border: '1px solid var(--border-main)', padding: '10px 16px 10px 44px', borderRadius: '8px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading tasks...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-body)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Task Details</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Status & Proof</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} style={{ borderTop: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                        <UserIcon size={18} />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-head)', fontSize: '14px' }}>
                        {task.user?.name || `ID: ${task.userId}`}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-head)' }}>
                    {task.task}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {task.isCompleted ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ background: '#10b98115', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                          COMPLETED
                        </span>
                        {task.photoUrl && (
                          <a href={task.photoUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>
                            <Camera size={14} /> View Proof
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ background: '#f59e0b15', color: '#f59e0b', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                          PENDING
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {!task.isCompleted ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                        <input 
                          type="url" 
                          placeholder="Photo Proof URL..." 
                          value={completionPhoto[task.id] || ''}
                          onChange={(e) => setCompletionPhoto(prev => ({...prev, [task.id]: e.target.value}))}
                          style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', padding: '6px 10px', borderRadius: '6px', outline: 'none', fontSize: '12px', width: '150px' }}
                        />
                        <button onClick={() => completeTask(task.id, true)} style={{ background: '#10b98120', color: '#10b981', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                          Mark Done
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => completeTask(task.id, false)} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                        Undo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
                    No tasks found for this date.
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
