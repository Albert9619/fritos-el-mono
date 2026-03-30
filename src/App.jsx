import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore"; 
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import AdminPanel from './components/AdminPanel';

const MONO_CREMA = "#fffbeb";

function AdminGuard({ children }) {
  const [acceso, setAcceso] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const pin = window.prompt("🔐 Acceso Restringido. Ingresa el PIN:");
    if (pin === "mono2026") { setAcceso(true); } else { navigate("/"); }
  }, [navigate]);
  return acceso ? children : <div style={{ padding: '50px', textAlign: 'center' }}>Verificando...</div>;
}

export default function App() {
  const [productos, setProductos] = useState([]);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");

  useEffect(() => {
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

  // Función de mantenimiento para organizar categorías viejas
  const ejecutarMantenimiento = async () => {
    const cargando = toast.loading("Actualizando menú...");
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const promesas = querySnapshot.docs.map(async (documento) => {
        const p = documento.data();
        const docRef = doc(db, "productos", documento.id);
        let cambios = {};
        if (p.categoria === "Arroz") cambios.categoria = "Arroces";
        if (p.categoria === "Bebida") cambios.categoria = "Bebidas";
        if (p.categoria === "Desayuno") cambios.categoria = "Desayunos";
        if (Object.keys(cambios).length > 0) return updateDoc(docRef, cambios);
      });
      await Promise.all(promesas);
      toast.dismiss(cargando);
      toast.success("¡Menú organizado! 🐒");
    } catch (error) { toast.dismiss(cargando); toast.error("Error al actualizar"); }
  };

  const toggleTiendaGlobal = async () => {
    try {
      const tiendaRef = doc(db, "ajuste", "tienda");
      await updateDoc(tiendaRef, { abierta: !tiendaAbierta });
    } catch (e) { toast.error("Error en Firebase"); }
  };

  return (
    <HashRouter>
      <Toaster position="top-center" />
      
      {!tiendaAbierta && window.location.hash !== "#/admin" && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
          <h1 style={{ fontSize: '4rem' }}>🐒</h1>
          <h2 style={{ fontSize: '2rem', color: '#fbbf24' }}>¡EL MONO ESTÁ CERRADO!</h2>
        </div>
      )}

      <Routes>
        <Route path="/" element={
          <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>
            <Header accesoSecreto={() => {}} tipoArrozHoy="Pollo" />
            
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              
              {/* BOTONES CON TODAS LAS CATEGORÍAS */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px', whiteSpace: 'nowrap' }}>
                {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    style={{ padding: '10px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? '#fbbf24' : '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* LISTA DE PRODUCTOS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {productos
                  .filter(p => p.categoria?.toLowerCase() === categoriaActiva.toLowerCase())
                  .map(p => (
                    <div key={p.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                      <img 
                        src={p.imagen} 
                        alt={p.nombre} 
                        onError={(e) => e.target.src = "https://via.placeholder.com/200?text=Frito+El+Mono"}
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px' }} 
                      />
                      <h3 style={{ margin: '15px 0 5px 0' }}>{p.nombre}</h3>
                      {p.opciones && <p style={{ fontSize: '0.8rem', color: 'gray' }}>{p.opciones.join(" - ")}</p>}
                      <p style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '1.4rem' }}>${p.precio}</p>
                      <button style={{ width: '100%', padding: '12px', backgroundColor: '#fbbf24', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Agregar</button>
                    </div>
                  ))}
              </div>

              <div style={{ marginTop: '50px', textAlign: 'center' }}>
                <button onClick={ejecutarMantenimiento} style={{ fontSize: '10px', opacity: 0.3 }}>Mantenimiento 🐒</button>
              </div>
            </main>
          </div>
        } />

        <Route path="/admin" element={
          <AdminGuard>
            {/* Contenedor para que el Admin no salga en blanco */}
            <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '20px' }}>
              <AdminPanel 
                tiendaAbierta={tiendaAbierta} 
                setTiendaAbierta={toggleTiendaGlobal} 
                productos={productos} 
              />
            </div>
          </AdminGuard>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}