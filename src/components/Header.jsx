import React from 'react';

export default function Header({ accesoSecreto, tipoArrozHoy }) {
  const MONO_NARANJA = "#f97316";

  return (
    <header style={{ textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <img src="/logo-fritos-el-mono.jpg" alt="Banner Fritos El Mono" style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '25px', background: 'rgba(255, 255, 255, 0.95)', borderTop: `5px solid ${MONO_NARANJA}` }}>
        <h1 onDoubleClick={accesoSecreto} style={{ color: MONO_NARANJA, margin: 0, fontSize: '36px', fontWeight: '900', userSelect: 'none', cursor: 'pointer' }}>
          Fritos El Mono 🐒
        </h1>
        <p style={{ marginTop: '5px', fontSize: '18px', fontWeight: '600' }}>
          Hoy Arroz de <span style={{color: MONO_NARANJA}}>{tipoArrozHoy}</span>
        </p>
      </div>
    </header>
  );
}