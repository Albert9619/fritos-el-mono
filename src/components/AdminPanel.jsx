import React from 'react';
import { Toaster } from 'react-hot-toast';

// CORRECCIÓN DEL IMPORT (Línea 5)
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

        {/* LISTA DE PRODUCTOS */}
        <div style={{ background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee' }}><h3 style={{ margin: 0 }}>Gestión de Menú</h3></div>
          {productos.map(p => (
            <div key={p.id} style={{ borderBottom: '1px solid #eee', padding: '15px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{p.nombre}</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {!p.tamanos && <input type="number" value={p.precio || ""} onChange={(e) => cambiarPrecioProducto(p.id, e.target.value)} style={{ width: '70px', padding: '5px' }} />}
                  <MiniSwitch activo={p.disponible} onClick={() => toggleProducto(p.id)} />
                </div>
              </div>
              {/* Sabores */}
              {p.opciones && (
                <div style={{ marginTop: '10px', paddingLeft: '15px', borderLeft: '2px solid #f97316' }}>
                  {p.opciones.map(opt => (
                    <div key={opt.nombre} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                      <span style={{ fontSize: '13px' }}>{opt.nombre}</span>
                      <MiniSwitch activo={opt.disponible} onClick={() => toggleSabor(p.id, opt.nombre)} />
                    </div>
                  ))}
                </div>
              )}
              {/* Tamaños */}
              {p.tamanos && (
                <div style={{ marginTop: '10px', paddingLeft: '15px', borderLeft: '2px solid #f97316' }}>
                  {p.tamanos.map(tam => (
                    <div key={tam.nombre} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                      <span style={{ fontSize: '13px' }}>{tam.nombre}</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" value={tam.precio || ""} onChange={(e) => cambiarPrecioTamano(p.id, tam.nombre, e.target.value)} style={{ width: '60px' }} />
                        <MiniSwitch activo={tam.disponible} onClick={() => toggleTamano(p.id, tam.nombre)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}