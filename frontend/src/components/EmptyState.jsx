import './EmptyState.css';

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div className="empty-state">
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      
      <h3 className="empty-state__title">{title}</h3>
      
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      
      {action && (
        <div className="empty-state__action">
          {action}
        </div>
      )}
      
      <div className="star-divider" aria-hidden="true">
        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
      </div>
    </div>
  );
}
