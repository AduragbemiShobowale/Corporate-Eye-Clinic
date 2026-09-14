// Reusable skeleton for any admin table
export default function TableSkeleton({ cols = 6, rows = 6 }) {
  return (
    <div className="admin-card" style={{ overflow: "hidden" }}>
      <table className="admin-table" style={{ tableLayout: "fixed" }}>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div
                  className="tsk-bar"
                  style={{ width: `${50 + (i % 3) * 15}%` }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} style={{ opacity: 1 - r * 0.1 }}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div
                    className="tsk-bar"
                    style={{
                      width: `${45 + ((r + c) % 4) * 12}%`,
                      height: c === 0 ? 14 : 12,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
