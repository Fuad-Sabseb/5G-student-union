import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IconUnionEmblem, IconAcademicDocs, IconDownloadTech } from '../components/TechIcons';
import '../styles/authForm.css';
import '../styles/listing.css';
import './Resources.css';

const categories = [
  { id: 'all', labelKey: 'resources_page.cat_all', defaultLabel: 'All Materials' },
  { id: 'handbook', labelKey: 'resources_page.cat_handbook', defaultLabel: 'Freshman Handbooks & Guides' },
  { id: 'constitution', labelKey: 'resources_page.cat_constitution', defaultLabel: 'Constitution & Bylaws' },
  { id: 'exam', labelKey: 'resources_page.cat_exam', defaultLabel: 'Past Exams & Midterms' },
  { id: 'notes', labelKey: 'resources_page.cat_notes', defaultLabel: 'Lecture Notes & Slides' },
  { id: 'form', labelKey: 'resources_page.cat_form', defaultLabel: 'Forms & Certificates' },
];

export default function Resources() {
  const { t } = useTranslation();
  const { member } = useAuth();

  const [resources, setResources] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [loading, setLoading] = useState(true);

  // Upload modal state (for exec/admin)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'handbook',
    fileUrl: '',
    fileType: 'PDF',
    fileSize: '',
    department: 'All',
    yearOfStudy: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const isExecOrAdmin = member?.role === 'exec' || member?.role === 'admin';

  const loadResources = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.append('category', activeCategory);
    if (department !== 'All') params.append('department', department);
    if (search.trim()) params.append('search', search.trim());

    api
      .get(`/resources?${params.toString()}`)
      .then((res) => setResources(res.data))
      .catch((err) => console.error('Failed to load resources', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadResources();
  }, [activeCategory, department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResources();
  };

  const handleDownload = async (resource) => {
    try {
      await api.post(`/resources/${resource._id}/download`);
      setResources((prev) =>
        prev.map((r) => (r._id === resource._id ? { ...r, downloadsCount: (r.downloadsCount || 0) + 1 } : r))
      );
    } catch (e) {}

    // Open file
    window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    try {
      await api.post('/resources', uploadForm);
      setUploadModalOpen(false);
      setUploadForm({
        title: '',
        description: '',
        category: 'handbook',
        fileUrl: '',
        fileType: 'PDF',
        fileSize: '',
        department: 'All',
        yearOfStudy: '',
      });
      loadResources();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Could not upload resource.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <section className="section section--dusk resources-hero">
        <div className="container">
          <div className="resources-hero__inner">
            <div>
              <span className="eyebrow">GBSG Academic Repository</span>
              <h1>{t('resources_page.title') || 'Student Document & Study Hub'}</h1>
              <p>
                {t('resources_page.subtitle') ||
                  'Access official handbooks, union constitution, past exams, and academic notes for Jimma University students.'}
              </p>
            </div>
            {isExecOrAdmin && (
              <button
                type="button"
                className="btn btn--gold"
                onClick={() => setUploadModalOpen(true)}
              >
                + {t('resources_page.upload_btn') || 'Upload Document'}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Category Tabs */}
          <div className="resources-tabs" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`resources-tab ${activeCategory === cat.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {t(cat.labelKey) || cat.defaultLabel}
              </button>
            ))}
          </div>

          {/* Filter / Search Bar */}
          <div className="resources-filter-bar">
            <form onSubmit={handleSearchSubmit} className="resources-search-form">
              <input
                type="search"
                placeholder={t('resources_page.search_placeholder') || 'Search by document name, subject, or keyword...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn--dusk">
                {t('common.search') || 'Search'}
              </button>
            </form>

            <div className="resources-dept-filter">
              <label>{t('membership.department')}:</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science / IT</option>
                <option value="Medicine">Medicine & Health Sciences</option>
                <option value="Engineering">Engineering & Technology</option>
                <option value="Business">Business & Economics</option>
                <option value="Agriculture">Agriculture & Natural Resources</option>
                <option value="Law">Law & Governance</option>
              </select>
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <p>{t('common.loading')}</p>
          ) : resources.length === 0 ? (
            <div className="card empty-resources-box">
              <h3>{t('resources_page.no_results_title') || 'No documents found'}</h3>
              <p>{t('resources_page.no_results_desc') || 'Try changing your category tab or search query.'}</p>
            </div>
          ) : (
            <div className="resources-grid">
              {resources.map((res) => (
                <div key={res._id} className="card resource-card">
                  <div className="resource-card__header">
                    <span className="resource-type-badge">{res.fileType || 'PDF'}</span>
                    <span className="resource-cat-tag">{res.category}</span>
                  </div>

                  <h3 className="resource-card__title">{res.title}</h3>
                  {res.description && <p className="resource-card__desc">{res.description}</p>}

                  <div className="resource-card__meta">
                    {res.department && res.department !== 'All' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <IconUnionEmblem size={13} /> {res.department}
                      </span>
                    )}
                    {res.yearOfStudy && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <IconAcademicDocs size={13} /> Year {res.yearOfStudy}
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <IconDownloadTech size={13} /> {res.downloadsCount || 0} downloads
                    </span>
                  </div>

                  <div className="resource-card__footer">
                    <span className="resource-card__date">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      className="btn btn--gold btn--sm"
                      onClick={() => handleDownload(res)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconDownloadTech size={14} />
                      <span>{t('resources_page.download_btn') || 'Download / View'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Exec/Admin Upload Modal */}
      {uploadModalOpen && (
        <div className="modal-overlay" onClick={() => setUploadModalOpen(false)}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>{t('resources_page.upload_title') || 'Upload Educational Resource'}</h3>
            </div>
            <p className="modal-subtitle">
              {t('resources_page.upload_subtitle') || 'Share official union handbooks, past exam papers, and guides with students.'}
            </p>

            <form onSubmit={handleUploadSubmit} className="auth-form">
              <label>
                {t('resources_page.doc_title') || 'Document Title'} *
                <input
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g. Freshman Academic Survival Handbook 2026"
                />
              </label>

              <div className="auth-form__grid">
                <label>
                  {t('resources_page.category') || 'Category'} *
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  >
                    <option value="handbook">Freshman Handbook & Guides</option>
                    <option value="constitution">Constitution & Bylaws</option>
                    <option value="exam">Past Exam & Midterms</option>
                    <option value="notes">Lecture Notes & Slides</option>
                    <option value="form">Forms & Certificates</option>
                    <option value="general">General</option>
                  </select>
                </label>

                <label>
                  {t('resources_page.file_type') || 'File Format'}
                  <select
                    value={uploadForm.fileType}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value })}
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="PPTX">Presentation (.pptx)</option>
                    <option value="ZIP">ZIP Archive</option>
                  </select>
                </label>

                <label>
                  {t('membership.department')}
                  <input
                    value={uploadForm.department}
                    onChange={(e) => setUploadForm({ ...uploadForm, department: e.target.value })}
                    placeholder="e.g. Computer Science (or 'All')"
                  />
                </label>

                <label>
                  {t('membership.year_of_study')}
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={uploadForm.yearOfStudy}
                    onChange={(e) => setUploadForm({ ...uploadForm, yearOfStudy: e.target.value })}
                    placeholder="1 - 7 (optional)"
                  />
                </label>
              </div>

              <label>
                {t('resources_page.file_url') || 'File URL / Google Drive Link / Uploaded Link'} *
                <input
                  type="url"
                  required
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                  placeholder="https://..."
                />
              </label>

              <label>
                {t('resources_page.description') || 'Short Description'}
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Brief description of the document contents..."
                />
              </label>

              {uploadError && <p className="form-error">{uploadError}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setUploadModalOpen(false)}
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn--gold" disabled={uploading}>
                  {uploading ? t('common.loading') : (t('common.submit') || 'Publish Document')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
