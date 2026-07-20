import ScriptText from '../components/ScriptText.jsx';
import MissionBand from '../components/MissionBand.jsx';

export default function OurStory() {
  return (
    <>
      <div style={{ padding: '40px var(--gutter)' }}>
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <ScriptText size={26} style={{ margin: '0 0 4px' }}>one earth, one life</ScriptText>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--hero-title-size)', fontWeight: 600, margin: '0 0 18px', lineHeight: 1.25 }}>
            Our Story
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-secondary-text)', margin: '0 0 16px' }}>
            It began with a simple observation: the health of the earth and the health of its people are impossible to
            separate. One Organic was founded on that idea — starting with the coconut, one of the most generous
            plants grown along Thailand's coastline, and a commitment to processing it the way nature intended.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-secondary-text)', margin: '0 0 16px' }}>
            Every jar of virgin coconut oil is cold-pressed, never refined, and never rushed. Every bottle of coconut
            syrup comes from the flower, not the fruit. Every bar of soap is handcrafted from ingredients we'd be
            comfortable naming out loud. Nothing hidden, nothing added that doesn't need to be there.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-secondary-text)', margin: 0 }}>
            We're a small producer, and we intend to stay thoughtful as we grow — sourcing responsibly, packaging with
            reuse in mind, and treating our surrounding community as a partner in that work, not an afterthought.
            Interwoven and inseparable isn't just a tagline for us; it's how we try to make decisions.
          </p>
        </div>
      </div>

      <div style={{ padding: '0 var(--gutter)', marginBottom: 40 }}>
        <div
          style={{
            maxWidth: 'var(--grid-max-width)',
            margin: '0 auto',
            height: 220,
            border: '0.5px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--color-muted)', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            Farm &amp; production photography
            <br />
            to be provided by client
          </p>
        </div>
      </div>

      <MissionBand />
    </>
  );
}
