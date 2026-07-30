import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import '../../styles/admin.css';
import '../../styles/listing.css';

const roles = ['member', 'exec', 'admin'];
const statuses = ['pending', 'active', 'inactive'];

export default function AdminMembers() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [leadershipEdits, setLeadershipEdits] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (roleFilter) params.role = roleFilter;
    if (search) params.search = search;
    api
      .get('/members', { params })
      .then((res) => setMembers(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter, roleFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 300); // debounce search-as-you-type
    return () => clearTimeout(timeout);
  }, [load]);

  const updateMember = async (id, patch) => {
    await api.put(`/members/${id}`, patch);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirm_delete_member'))) return;
    await api.delete(`/members/${id}`);
    load();
  };

  const handleLeadershipChange = (id, field, value) => {
    setLeadershipEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveLeadership = async (member) => {
    const edits = leadershipEdits[member._id] || {};
    await updateMember(member._id, {
      leadershipPosition: edits.leadershipPosition ?? member.leadershipPosition,
      leadershipOrder:
        edits.leadershipOrder !== undefined ? Number(edits.leadershipOrder) : member.leadershipOrder,
    });
  };

  return (
    <>
      <h1>{t('admin.members_title')}</h1>

      <div className="admin-toolbar">
        <div className="admin-toolbar__filters">
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('admin.filter_status')}: {t('admin.status_all')}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">{t('admin.filter_role')}: {t('admin.role_all')}</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            className="admin-input"
            placeholder={t('admin.filter_search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-empty">{t('common.loading')}</p>
        ) : members.length === 0 ? (
          <p className="admin-empty">{t('admin.no_members')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.table_name')}</th>
                <th>{t('admin.table_email')}</th>
                <th>{t('admin.table_campus')}</th>
                <th>{t('admin.table_status')}</th>
                <th>{t('admin.table_role')}</th>
                <th>{t('admin.leadership_position')}</th>
                <th>{t('admin.table_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td>{m.fullName}</td>
                  <td>{m.email}</td>
                  <td>{m.campus || '—'}</td>
                  <td>
                    <span className={`status-badge status-badge--${m.membershipStatus}`}>
                      {m.membershipStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-inline-select"
                      value={m.role}
                      onChange={(e) => updateMember(m._id, { role: e.target.value })}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {m.role !== 'member' ? (
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <input
                          className="admin-input"
                          style={{ width: '120px' }}
                          defaultValue={m.leadershipPosition}
                          placeholder={t('admin.leadership_position')}
                          onChange={(e) =>
                            handleLeadershipChange(m._id, 'leadershipPosition', e.target.value)
                          }
                        />
                        <input
                          className="admin-input"
                          type="number"
                          style={{ width: '55px' }}
                          defaultValue={m.leadershipOrder}
                          title={t('admin.leadership_order')}
                          onChange={(e) => handleLeadershipChange(m._id, 'leadershipOrder', e.target.value)}
                        />
                        <button className="admin-btn-sm" onClick={() => saveLeadership(m)}>
                          {t('admin.save')}
                        </button>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="admin-actions">
                      {m.membershipStatus !== 'active' ? (
                        <button
                          className="admin-btn-sm admin-btn-sm--primary"
                          onClick={() => updateMember(m._id, { membershipStatus: 'active' })}
                        >
                          {t('admin.approve')}
                        </button>
                      ) : (
                        <button
                          className="admin-btn-sm"
                          onClick={() => updateMember(m._id, { membershipStatus: 'inactive' })}
                        >
                          {t('admin.deactivate')}
                        </button>
                      )}
                      <button className="admin-btn-sm admin-btn-sm--danger" onClick={() => handleDelete(m._id)}>
                        {t('admin.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
