import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);

  async function load() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    setMarking(id);
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setMarking(null);
    load();
  }

  async function markAllRead() {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    load();
  }

  const unread = notifications.filter((n) => !n.read).length;

  if (loading)
    return (
      <div className="admin-empty">
        <p className="admin-empty-body">Loading…</p>
      </div>
    );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Notifications</h1>
          <p className="admin-page-subtitle">
            {unread > 0
              ? `${unread} unread notification${unread !== 1 ? "s" : ""}`
              : "All caught up."}
          </p>
        </div>
        {unread > 0 && (
          <button className="admin-btn admin-btn--ghost" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="admin-card admin-empty">
          <p className="notif-empty-icon">🔔</p>
          <p className="admin-empty-title">No notifications yet.</p>
          <p className="admin-empty-body">
            Low-stock alerts will appear here when a product drops to 3 units or
            below.
          </p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item${n.read ? " notif-item--read" : ""}`}
            >
              <div className="notif-icon-wrap">
                {n.type === "low_stock" ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ) : (
                  <span>🔔</span>
                )}
              </div>
              <div className="notif-body">
                <p className="notif-title">{n.title}</p>
                <p className="notif-text">{n.body}</p>
                <p className="notif-time">
                  {new Date(n.created_at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!n.read && (
                <button
                  className="notif-read-btn"
                  onClick={() => markRead(n.id)}
                  disabled={marking === n.id}
                >
                  {marking === n.id ? "…" : "Mark read"}
                </button>
              )}
              {n.read && <span className="notif-read-label">Read</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
