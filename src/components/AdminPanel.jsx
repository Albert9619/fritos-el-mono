import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function AdminPanel({ 
  setIsAdmin, 
  tiendaAbierta, 
  setTiendaAbierta, 
  productos, 
  toggleProducto, 
  cambiarPrecioProducto, 
  toggleSabor, 
  toggleTamano, 
  cambiarPrecioTamano, 
  extrasArroz, 
  toggleExtraArroz, 
  cambiarPrecioExtraArroz, 
  salsas, 
  toggleSalsa 
}) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";
  const MONO_VERDE = "#16a34a";
  const MONO_TEXTO = "#333333";

  // Esta es la pieza de los interruptores (botones verde/gris)
  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{ width: '40px', height: '22px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '21px' : '3px', transition: '0.3s' }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <Toaster position="top-center" />
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => setIsAdmin(false)} style={{ marginBottom: '20px', padding: '10px 15px', borderRadius: '10px', border: 'none', background: MONO_TEXTO, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          ← Volver a la Tienda
        </button>
        
        <div style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <h1 style={{ color: MONO_NARANJA, margin: '0 0 10px 0' }}>Panel de Control ⚙️</h1>
          <div style={{ padding: '20px', borderRadius: '15px', background: tiendaAbierta ? '#dcfce7' : '#fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '18px' }}>ESTADO: {tiendaAbierta ? '🟢 ABIERTO' : '🔴 CERRADO'}</strong>
            <button onClick={() => setTiendaAbierta(!tiendaAbierta)} style={{ background: MONO_TEXTO, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              {tiendaAbierta ? 'Cerrar Negocio' : 'Abrir Negocio'}
            </button>
          </div>
        </div>

        {/* PRODUCTOS */}
        <div style={{ background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee' }}><h3 style={{ margin: 0 }}>Productos Principales</h3></div>
          {productos.map(p => (
            <div key={p.id} style={{ borderBottom: '2px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', gap: '10px' }}>
                <strong style={{ fontSize: '16px', flexGrow: 1 }}>{p.nombre}</strong>
                <input type="number" value={p.precio || ""} disabled={p.esJugo} onChange={(e) => cambiarPrecioProducto(p.id, e.target.value)} style={{ width: '70px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd', background: p.esJugo ? '#eee' : 'white' }} />
                <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: p.disponible ? MONO_VERDE : 'red' }}>{p.disponible ? 'HAY' : 'AGOTADO'}</span>
                  <MiniSwitch activo={p.disponible} onClick={() => toggleProducto(p.id)} />
                </div>
              </div>

              {p.opciones && (
                <div style={{ padding: '10px 20px', background: '#fafafa', borderTop: '1px dashed #ddd' }}>
                  {p.opciones.map(opt => (
                    <div key={opt.nombre} style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', paddingLeft: '15px' }}>
                      <span style={{ fontSize: '14px', color: opt.disponible ? '#333' : '#aaa' }}>- {opt.nombre}</span>
                      <MiniSwitch activo={opt.disponible} onClick={() => toggleSabor(p.id, opt.nombre)} />
                    </div>
                  ))}
                </div>
              )}

              {p.tamanos && (
                <div style={{ padding: '10px 20px', background: '#fafafa', borderTop: '1px dashed #ddd' }}>
                  {p.tamanos.map(tam => (
                    <div key={tam.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', paddingLeft: '15px' }}>
                      <span style={{ fontSize: '14px', width: '80px' }}>- {tam.nombre}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input type="number" value={tam.precio || ""} onChange={(e) => cambiarPrecioTamano(p.id, tam.nombre, e.target.value)} style={{ width: '65px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }} />
                        <MiniSwitch activo={tam.disponible} onClick={() => toggleTamano(p.id, tam.nombre)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* EXTRAS ARROZ */}
          <div style={{ flex: '1 1 300px', background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', paddingBottom: '10px' }}>
            <div style={{ padding: '15px 20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee' }}><h3 style={{ margin: 0 }}>Extras del Arroz</h3></div>
            {extrasArroz.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                <span>{e.nombre}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {e.precio !== undefined && (
                    <input type="number" value={e.precio || ""} onChange={(ev) => cambiarPrecioExtraArroz(e.id, ev.target.value)} style={{ width: '65px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }} />
                  )}
                  <MiniSwitch activo={e.disponible} onClick={() => toggleExtraArroz(e.id)} />
                </div>
              </div>
            ))}
          </div>

          {/* SALSAS */}
          <div style={{ flex: '1 1 300px', background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', paddingBottom: '10px' }}>
            <div style={{ padding: '15px 20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee' }}><h3 style={{ margin: 0 }}>Salsas</h3></div>
            {salsas.map(s => (
              <div key={s.nombre} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                <span>{s.nombre}</span>
                <MiniSwitch activo={s.disponible} onClick={() => toggleSalsa(s.nombre)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}