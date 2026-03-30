import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore"; 
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import AdminPanel from './components/AdminPanel';

const MONO_CREMA = "#fffbeb";

export default function App() {
  const [productos, setProductos] = useState([]);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos"); // Categoría por defecto

  useEffect(() => {
    // Escucha la base de datos sin alterar tu diseño
    const unsubProd = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });

    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        setTiendaAbierta(snapshot.data().abierta);
      }
    });

    return () => { unsubProd(); unsubTienda(); };
  }, []);

  const toggleTiendaGlobal = async () => {
    try {
      const tiendaRef = doc(db, "ajuste", "tienda");
      await updateDoc(tiendaRef, { abierta: !tiendaAbierta });
    } catch (e) { 
      toast.error("Error al conectar con Firebase"); 
    }
  };

  return (
    <HashRouter>
      <Toaster position="top-center" />
      
      {/* PANTALLA DE CIERRE (Solo tapa a los clientes, no borra el código) */}
      {!tiendaAbierta && window.location.hash !== "#/admin" && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center', padding: '20px' }}>
          <h1 style={{ fontSize: '4rem' }}>🐒</h1>
          <h2 style={{ fontSize: '2rem', color: '#fbbf24' }}>¡EL MONO ESTÁ CERRADO!</h2>
          <p>Estamos preparando más fritos. Vuelve pronto.</p>
        </div>
      )}

      <Routes>
        {/* VISTA DEL CLIENTE (TU DISEÑO ORIGINAL RESTAURADO) */}
        <Route path="/" element={
          <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>
            <Header accesoSecreto={() => {}} tipoArrozHoy="Pollo" />
            
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              
              {/* TUS CATEGORÍAS COMPLETAS DE VUELTA */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px' }}>
                {["Desayunos", "Fritos", "Arroces", "Bebidas"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    style={{ 
                      padding: '10px 25px', 
                      borderRadius: '25px', 
                      border: 'none', 
                      backgroundColor: categoriaActiva === cat ? '#fbbf24' : '#ffffff', 
                      fontWeight: 'bold', 
                      cursor: 'pointer', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* LA VISUAL DE TUS PRODUCTOS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {productos
                  .filter(p => p.categoria?.toLowerCase() === categoriaActiva.toLowerCase())
                  .map(p => (
                    <div key={p.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                      <img 
                        src={p.imagen} 
                        alt={p.nombre} 
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px' }} 
                      />
                      <h3 style={{ margin: '15px 0 5px 0' }}>{p.nombre}</h3>
                      {p.opciones && (
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                          Disponibles: {p.opciones.join(" - ")}
                        </p>
                      )}
                      <p style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '1.4rem', margin: '5px 0' }}>${p.precio}</p>
                      <button style={{ width: '100%', padding: '12px', backgroundColor: '#fbbf24', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>
                        Agregar al pedido
                      </button>
                    </div>
                  ))}
              </div>

              {/* AVISO SI LA CATEGORÍA ESTÁ VACÍA EN FIREBASE */}
              {productos.filter(p => p.categoria?.toLowerCase() === categoriaActiva.toLowerCase()).length === 0 && (
                <div style={{ textAlign: 'center', padding: '50px', color: 'gray' }}>
                  Aún no has agregado {categoriaActiva} en el administrador.
                </div>
              )}

            </main>
          </div>
        } />

        {/* VISTA DEL ADMINISTRADOR (ARREGLADA, YA NO SALDRÁ EN BLANCO) */}
        <Route path="/admin" element={
          <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <AdminPanel 
              tiendaAbierta={tiendaAbierta} 
              setTiendaAbierta={toggleTiendaGlobal} 
              productos={productos} 
            />
          </div>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}