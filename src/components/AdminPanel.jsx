import React from 'react';
import { Toaster } from 'react-hot-toast';

// CORRECCIÓN DE RUTA
import ProductCard from './ProductCard'; 

export default function AdminPanel({ 
  setIsAdmin, tiendaAbierta, setTiendaAbierta, productos, toggleProducto, cambiarPrecioProducto, 
  toggleSabor, toggleTamano, cambiarPrecioTamano, extrasArroz, toggleExtraArroz, 
  cambiarPrecioExtraArroz, salsas, toggleSalsa 
}) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";
  const MONO_VERDE = "#16a34a";
  const MONO_TEXTO = "#333333";

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{ width: '40px', height: '22px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '21px' : '3px', transition: '0.3s' }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <Toaster position="top-center" />
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        <button onClick={() => setIsAdmin(false)} style={{ marginBottom: '20px', padding: '10px 15px', borderRadius: '10px', border: 'none', background: MONO_TEXTO, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}> ← Volver </button>
        
        <div style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <h1 style={{ color: MONO_NARANJA, margin: '0 0 10px 0' }}>Panel de Control ⚙️</h1>
          <button onClick={() => setTiendaAbierta(!tiendaAbierta)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: tiendaAbierta ? MONO_VERDE : 'red', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
            {tiendaAbierta ? '🟢 TIENDA ABIERTA' : '🔴 TIENDA CERRADA'}
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '25px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '15px 20px', background: MONO_AMARILLO }}><h3 style={{ margin: 0 }}>Menú Principal</h3></div>
          {productos.map(p => (
            <div key={p.id} style={{ borderBottom: '1px solid #eee', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>{p.nombre}</span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {!p.tamanos && <input type="number" value={p.precio || ""} onChange={(e) => cambiarPrecioProducto(p.id, e.target.value)} style={{ width: '70px', padding: '5px' }} />}
                <MiniSwitch activo={p.disponible} onClick={() => toggleProducto(p.id)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}