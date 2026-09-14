import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import '../../styles/admin.css';
import '../../styles/listing.css';

const statuses = ['pending', 'active', 'inactive'];

export default function AdminAlumni() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [alumniFilter, setAlumniFilter] = useState('true'); // default view alumni, with option to view all
  const [gradYearFilter, setGradYearFilter] = useState('');
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (alumniFilter !== '') params.isAlumni = alumniFilter;
    if (gradYearFilter) params.graduationYear = gradYearFilter;
    if (search.trim()) params.search = search.trim();

    api
      .get('/members', { params })
      .then((res) => setMembers(res.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [statusFilter, alumniFilter, gradYearFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [load]);

  const updateMember = async (id, patch) => {
    await api.put(`/members/${id}`, patch);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirm_delete_alumni'))) return;
    await api.delete(`/members/${id}`);
    load();
  };

  const handleFieldChange = (id, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveAlumniDetails = async (m) => {
    const itemEdits = edits[m._id] || {};
    await updateMember(m._id, {
      graduationYear:
        itemEdits.graduationYear !== undefined
          ? itemEdits.graduationYear ? Number(itemEdits.graduationYear) : undefined
          : m.graduationYear,
      currentOccupation:
        itemEdits.currentOccupation !== undefined
          ? itemEdits.currentOccupation
          : m.currentOccupation,
      currentCompany:
        itemEdits.currentCompany !== undefined ? itemEdits.currentCompany : m.currentCompany,
      currentLocation:
        itemEdits.currentLocation !== undefined ? itemEdits.currentLocation : m.currentLocation,
      willingToMentor:
        itemEdits.willingToMentor !== undefined
          ? itemEdits.willingToMentor
          : Boolean(m.willingToMentor),
    });
    setEdits((prev) => {
      const next = { ...prev };
      delete next[m._id];
      return next;
    });
  };

  return (
    <>
      <h1>{t('admin.alumni_title')}</h1>

      <div className="admin-toolbar">
        <div className="admin-toolbar__filters">
          {/* Status Filter */}
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

          {/* IsAlumni Toggle */}
          <select
            className="admin-select"
            value={alumniFilter}
            onChange={(e) => setAlumniFilter(e.target.value)}
          >
            <option value="true">🎓 {t('membership.type_alumni')} (isAlumni: true)</option>
            <option value="false">🎒 {t('membership.type_student')} (isAlumni: false)</option>
            <option value="">👥 All Members</option>
          </select>

          {/* Grad Year Filter */}
          <input
            className="admin-input"
            type="number"
            placeholder={t('membership.graduation_year')}
            style={{ width: '130px' }}
            value={gradYearFilter}
            onChange={(e) => setGradYearFilter(e.target.value)}
          />

          {/* Search Bar */}
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
          <p className="admin-empty">{t('admin.no_alumni')}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.table_name')}</th>
                <th>{t('admin.table_is_alumni')}</th>
                <th>{t('admin.table_grad_year')}</th>
                <th>{t('admin.table_occupation')}</th>
                <th>{t('admin.table_location')}</th>
                <th>{t('admin.table_mentor')}</th>
                <th>{t('admin.table_status')}</th>
                <th>{t('admin.table_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const itemEdits = edits[m._id] || {};
                const isModified = Object.keys(itemEdits).length > 0;

                return (
                  <tr key={m._id}>
                    <td>
                      <div>
                        <strong>{m.fullName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>
                          {m.email}
                        </div>
                      </div>
                    </td>

                    {/* isAlumni Flip Button / Toggle */}
                    <td>
                      <button
                        type="button"
                        className={`admin-btn-sm ${m.isAlumni ? 'admin-btn-sm--primary' : ''}`}
                        onClick={() => updateMember(m._id, { isAlumni: !m.isAlumni })}
                        title="Click to toggle between Student and Alumnus"
                      >
                        {m.isAlumni ? `🎓 ${t('admin.mark_as_student')}` : `🎒 ${t('admin.mark_as_alumni')}`}
                      </button>
                    </td>

                    {/* Graduation Year Inline Input */}
                    <td>
                      <input
                        type="number"
                        className="admin-input"
                        style={{ width: '80px' }}
                        defaultValue={m.graduationYear || ''}
                        placeholder="Year"
                        onChange={(e) => handleFieldChange(m._id, 'graduationYear', e.target.value)}
                      />
                    </td>

                    {/* Occupation & Company Inline Input */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          className="admin-input"
                          style={{ minWidth: '130px' }}
                          defaultValue={m.currentOccupation || ''}
                          placeholder={t('membership.current_occupation')}
                          onChange={(e) =>
                            handleFieldChange(m._id, 'currentOccupation', e.target.value)
                          }
                        />
                        <input
                          className="admin-input"
                          style={{ minWidth: '130px' }}
                          defaultValue={m.currentCompany || ''}
                          placeholder={t('membership.current_company')}
                          onChange={(e) => handleFieldChange(m._id, 'currentCompany', e.target.value)}
                        />
                      </div>
                    </td>

                    {/* Location Inline Input */}
                    <td>
                      <input
                        className="admin-input"
                        style={{ minWidth: '110px' }}
                        defaultValue={m.currentLocation || ''}
                        placeholder={t('membership.current_location')}
                        onChange={(e) => handleFieldChange(m._id, 'currentLocation', e.target.value)}
                      />
                    </td>

                    {/* Willing to Mentor Checkbox */}
                    <td>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          defaultChecked={Boolean(m.willingToMentor)}
                          onChange={(e) => handleFieldChange(m._id, 'willingToMentor', e.target.checked)}
                        />
                        <span style={{ fontSize: '0.8rem' }}>⭐ {t('admin.table_mentor')}</span>
                      </label>
                    </td>

                    {/* Membership Status Badge */}
                    <td>
                      <span className={`status-badge status-badge--${m.membershipStatus}`}>
                        {m.membershipStatus}
                      </span>
                    </td>

                    {/* Actions: Save / Approve / Deactivate / Delete */}
                    <td>
                      <div className="admin-actions">
                        {isModified && (
                          <button
                            type="button"
                            className="admin-btn-sm admin-btn-sm--primary"
                            onClick={() => saveAlumniDetails(m)}
                          >
                            {t('admin.save')}
                          </button>
                        )}

                        {m.membershipStatus !== 'active' ? (
                          <button
                            type="button"
                            className="admin-btn-sm admin-btn-sm--primary"
                            onClick={() => updateMember(m._id, { membershipStatus: 'active' })}
                          >
                            {t('admin.approve')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn-sm"
                            onClick={() => updateMember(m._id, { membershipStatus: 'inactive' })}
                          >
                            {t('admin.deactivate')}
                          </button>
                        )}

                        <button
                          type="button"
                          className="admin-btn-sm admin-btn-sm--danger"
                          onClick={() => handleDelete(m._id)}
                        >
                          {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
