import './LoadingSkeleton.css';

// Reusable skeleton components matching existing card layouts
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--text" />
        <div className="skeleton-line skeleton-line--text skeleton-line--short" />
      </div>
    </div>
  );
}

export function SkeletonGalleryGrid({ count = 6 }) {
  return (
    <div className="gallery-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-gallery-item" aria-hidden="true">
          <div className="skeleton-image skeleton-image--square" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonNewsGrid({ count = 6 }) {
  return (
    <div className="news-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonForumList({ count = 5 }) {
  return (
    <div className="forum-topics-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-forum-item" aria-hidden="true">
          <div className="skeleton-avatar" />
          <div className="skeleton-forum-content">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--text skeleton-line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}
