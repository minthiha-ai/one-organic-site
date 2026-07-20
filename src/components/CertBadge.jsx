export default function CertBadge({ icon, children }) {
  return (
    <span>
      <i
        className={`ti ${icon}`}
        style={{ fontSize: 14, verticalAlign: -2, marginRight: 4 }}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
