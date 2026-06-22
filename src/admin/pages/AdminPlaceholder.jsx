export default function AdminPlaceholder({ title }) {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          <p className="admin-page-subtitle">This page is being built — coming in Phase 2.</p>
        </div>
      </div>
      <div className="admin-card admin-empty">
        <p className="admin-empty-title">Coming soon</p>
        <p className="admin-empty-body">
          The foundation is live. Full functionality for this page will be added next.
        </p>
      </div>
    </div>
  );
}