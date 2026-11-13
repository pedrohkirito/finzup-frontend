import { ImageResponse } from 'next/og';

export const alt = 'Finzup — Seu dinheiro está sumindo e você não sabe o porquê?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#020617',
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgba(3,182,230,0.35), transparent 42%), radial-gradient(circle at 100% 100%, rgba(16,185,129,0.22), transparent 38%)',
          color: '#ffffff',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
          Finzup
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 920 }}>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em' }}>
            Seu dinheiro está sumindo e você não sabe o porquê?
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 30, lineHeight: 1.35, color: '#cbd5e1' }}>
            A Finzup organiza tudo num só lugar e aponta o próximo passo.
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: '#67e8f9' }}>
          Plano anual · R$ 70,80 · reembolso integral em 7 dias
        </div>
      </div>
    ),
    { ...size },
  );
}
