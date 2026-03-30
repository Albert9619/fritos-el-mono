import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore"; 
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import AdminPanel from './components/AdminPanel';

const MONO_CREMA = "#fffbeb";

export default function App() {
  const [productos, setProductos] = useState([]);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos"); // Empezamos en Fritos

  useEffect(() => {
    // 1. Escuchar fritos
    const unsubProd = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });

    // 2. Escuchar interruptor
    const unsubTienda = onSnapshot(doc(db, "ajustes", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        setTiendaAbierta(snapshot.data().abierta);
      }
    });

    return () => { unsubProd(); unsubTienda(); };
  }, []);

  const toggleTiendaGlobal = async () => {
    try {
      const tiendaRef = doc(db, "ajustes", "tienda");
      await updateDoc(tiendaRef, { abierta: !tiendaAbierta });
      toast.success(tiendaAbierta ? "🔴 Tienda Cerrada" : "🟢 Tienda Abierta");
    } catch (e) { toast.error("Error en Firebase"); }
  };

  return (
    <HashRouter>
      <Toaster position="top-center" />
      
      {/* 🚫 BLOQUEO GLOBAL */}
      {!tiendaAbierta && window.location.hash !== "#/admin" && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center', padding: '20px' }}>
          <h1 style={{ fontSize: '4rem' }}>🐒</h1>
          <h2 style={{ fontSize: '2rem' }}>¡EL MONO ESTÁ CERRADO!</h2>
          <p>Vuelve pronto por tus fritos favoritos.</p>
        </div>
      )}

      <Routes>
        <Route path="/" element={
          <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>
            <Header accesoSecreto={() => {}} tipoArrozHoy="Pollo" />
            
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              
              {/* 📂 CATEGORÍAS */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                {["Fritos", "Arroces", "Bebidas"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: categoriaActiva === cat ? '#fbbf24' : '#e5e7eb', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 🍕 LISTA DE PRODUCTOS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {productos
                  .filter(p => p.categoria === categoriaActiva)
                  .map(p => (
                    <div key={p.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                      <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px' }} />
                      <h3 style={{ margin: '10px 0' }}>{p.nombre}</h3>
                      <p style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '1.2rem' }}>${p.precio}</p>
                      <button style={{ width: '100%', padding: '10px', backgroundColor: '#fbbf24', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>
                        Agregar al pedido
                      </button>
                    </div>
                  ))}
              </div>

              {productos.length === 0 && <p style={{ textAlign: 'center' }}>Cargando productos desde Firebase...</p>}
            </main>
          </div>
        } />

        <Route path="/admin" element={
          <AdminPanel tiendaAbierta={tiendaAbierta} setTiendaAbierta={toggleTiendaGlobal} productos={productos} />
        } />
      </Routes>
    </HashRouter>
  );
}