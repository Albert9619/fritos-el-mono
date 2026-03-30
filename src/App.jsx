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
    }, (error) => {
      console.error("Error en Firebase Productos:", error);
      toast.error("Error al leer productos");
    });

    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        setTiendaAbierta(snapshot.data().abierta);
      }
    }, (error) => {
      console.error("Error en Firebase Ajuste:", error);
    });

    return () => { unsubProd(); unsubTienda(); };
  }, []);

  // 🔥 ESTA ES LA FUNCIÓN QUE ARREGLA LOS ARROCES Y LAS OPCIONES
  const ejecutarMantenimiento = async () => {
    const cargando = toast.loading("Actualizando el menú del Mono...");
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      
      const promesas = querySnapshot.docs.map(async (documento) => {
        const p = documento.data();
        const docRef = doc(db, "productos", documento.id);
        let cambios = {};

        // 1. Corregir Categoría "Arroz" a "Arroces"
        if (p.categoria === "Arroz") {
          cambios.categoria = "Arroces";
        }

        // 2. Si es arroz, ponerle las opciones de Pollo, Cerdo y Paisa
        if (p.categoria === "Arroz" || p.categoria === "Arroces" || p.esArroz) {
          cambios.opciones = ["Pollo", "Cerdo", "Paisa"];
        }

        // 3. Asegurar que esté disponible
        if (p.disponible === undefined) {
          cambios.disponible = true;
        }

        if (Object.keys(cambios).length > 0) {
          return updateDoc(docRef, cambios);
        }
      });

      await Promise.all(promesas);
      toast.dismiss(cargando);
      toast.success("¡Base de Datos Actualizada! 🐒🔥");
    } catch (error) {
      toast.dismiss(cargando);
      toast.error("Error al actualizar");
      console.error(error);
    }
  };

  const toggleTiendaGlobal = async () => {
    try {
      const tiendaRef = doc(db, "ajuste", "tienda");
      await updateDoc(tiendaRef, { abierta: !tiendaAbierta });
      toast.success(tiendaAbierta ? "🔴 Tienda Cerrada" : "🟢 Tienda Abierta");
    } catch (e) { 
      toast.error("No tienes permiso para cambiar esto"); 
    }
  };

  return (
    <HashRouter>
      <Toaster position="top-center" />
      
      {!tiendaAbierta && window.location.hash !== "#/admin" && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
          <h1 style={{ fontSize: '4rem' }}>🐒</h1>
          <h2 style={{ fontSize: '2rem', color: '#fbbf24' }}>¡EL MONO ESTÁ CERRADO!</h2>
          <p>Estamos preparando más fritos. Vuelve pronto.</p>
        </div>
      )}

      <Routes>
        <Route path="/" element={
          <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>
            <Header accesoSecreto={() => {}} tipoArrozHoy="Pollo" />
            
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px' }}>
                {["Fritos", "Arroces", "Bebidas"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    style={{ padding: '10px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? '#fbbf24' : '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

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
                      
                      {/* ✍️ Muestra las opciones si el producto las tiene */}
                      {p.opciones && (
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                          Opciones: {p.opciones.join(" - ")}
                        </p>
                      )}

                      <p style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '1.4rem', margin: '5px 0' }}>${p.precio}</p>
                      <button style={{ width: '100%', padding: '12px', backgroundColor: '#fbbf24', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>
                        Agregar al pedido
                      </button>
                    </div>
                  ))}
              </div>

              {/* ⚠️ BOTÓN DE MANTENIMIENTO TEMPORAL */}
              <div style={{ marginTop: '50px', textAlign: 'center' }}>
                <button 
                  onClick={ejecutarMantenimiento}
                  style={{ fontSize: '10px', opacity: 0.5, background: 'none', border: '1px solid gray', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Mantenimiento del Menú 🐒
                </button>
              </div>

            </main>
          </div>
        } />

        <Route path="/admin" element={
          <AdminGuard>
            <div style={{backgroundColor: '#fff', minHeight: '100vh'}}>
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