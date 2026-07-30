import { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/listing.css';
import './Blog.css';

export default function BlogDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { member } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/blog/${id}`)
      .then((res) => setPost(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this article?')) return;
    await api.delete(`/blog/${id}`);
    navigate('/blog');
  };

  if (loading) return <div className="container section">{t('common.loading')}</div>;
  if (!post) return null;

  const isOwner = member && post.author?._id === member._id;
  const isAdmin = member?.role === 'admin';

  return (
    <>
      <section className="section section--dusk news-hero">
        <div className="container">
          <NavLink to="/blog" className="back-link">
            ← {t('blog_page.back')}
          </NavLink>
          <span className="news-card__type">{post.language.toUpperCase()}</span>
          <h1>{post.title}</h1>
          <p>
            {t('blog_page.by')} {post.author?.fullName}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container news-detail">
          {post.coverImageUrl && <img src={getMediaUrl(post.coverImageUrl)} alt="" className="news-detail__image" />}
          <p className="news-detail__content">{post.content}</p>

          {(isOwner || isAdmin) && (
            <button
              className="btn btn--outline"
              onClick={handleDelete}
              style={{ color: '#b3261e', borderColor: '#b3261e', marginTop: '1.5rem' }}
            >
              Delete Article
            </button>
          )}
        </div>
      </section>
    </>
  );
}
