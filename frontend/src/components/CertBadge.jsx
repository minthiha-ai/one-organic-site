import Icon from './Icon.jsx';

export default function CertBadge({ icon, children }) {
  return (
    <span>
      <Icon name={icon} style={{ fontSize: 14, verticalAlign: -2, marginRight: 4 }} />
      {children}
    </span>
  );
}
