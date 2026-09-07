// ============================================================
// EMPTY STATE COMPONENT
// ============================================================
// Shown when a list has no items to display.
// The icon prop accepts a Lucide React component (React.ReactNode)
// so you can pass any icon: <SearchX size={64} />
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;  // accepts Lucide icons or any JSX
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <span className="empty-state-icon">{icon}</span>}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
