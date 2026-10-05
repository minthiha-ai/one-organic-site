import Button from '../components/Button.jsx';
import { NoIndex } from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <NoIndex title="Page not found">
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '64px var(--gutter)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24, margin: '0 0 12px' }}>Page not found</h1>
        <p style={{ fontSize: 14, color: 'var(--color-secondary-text)', margin: '0 0 24px' }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Button to="/shop">Shop the collection</Button>
      </div>
    </NoIndex>
  );
}
