import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore"; 
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import AdminPanel from './components/AdminPanel';

const MONO_CREMA = "#fffbeb";

// 🔥 TUS DATOS ORIGINALES RESCATADOS
const productosOriginales = [
  { id: "emp_1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", opciones: ["Carne", "Pollo", "Arroz"], imagen: "/empanada.jpg", disponible: true },
  { id: "pap_1", nombre: "Papa Rellena", precio: 3000, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true },
  { id: "pas_1", nombre: "Pastel de Pollo", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "are_1", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa.jpg", disponible: true },
  { id: "pal_1", nombre: "Palitos de Queso", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "bun_1", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/bunuelo.jpg", disponible: true },
  { id: "des_1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", esDesayuno: true, imagen: "/desayuno.jpg", disponible: true },
  { id: "des_2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", esDesayuno: true, imagen: "/desayuno-especial.jpg", disponible: true },
  { id: "beb_1", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", imagen: "/agua.jpg", disponible: true },
  { id: "beb_2", nombre: "Jugo Natural Helado", precio: 3000, categoria: "Bebidas", imagen: "/jugo.jpg", disponible: true },
  { id: "beb_3", nombre: "Coca-Cola", precio: 3500, categoria: "Bebidas", imagen: "/coca-cola.jpg", disponible: true },
  { id: "beb_4", nombre: "Pony Malta", precio: 2500, categoria: "Bebidas", imagen: "/pony-malta.jpg", disponible: true }
];

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
      if (snapshot.exists()) setTiendaAbierta(snapshot.data().abierta);
    });

    return () => { unsubProd(); unsubTienda(); };
  }, []);

  // 🪄 FUNCIÓN PARA DEVOLVER TUS DATOS A LA VIDA
  const restaurarTodaLaBase = async () => {
    const cargando = toast.loading("Restaurando tu menú original en Firebase...");
    try {
      const promesas = productosOriginales.map(p => setDoc(doc(db, "productos", p.id), p));
      await Promise.all(promesas);
      toast.dismiss(cargando);
      toast.success("¡Tu menú original volvió con éxito! 🐒🔥");
    } catch (e) {
      toast.dismiss(cargando);
      toast.error("Hubo un error al restaurar");
    }
  };

  const toggleTiendaGlobal = async () => {
    try {
      await updateDoc(doc(db, "ajuste", "tienda"), { abierta: !tiendaAbierta });
    } catch (e) { toast.error("Error al conectar"); }
  };

  return (
    <HashRouter>
      <Toaster position="top-center" />
      
      {!tiendaAbierta && window.location.hash !== "#/admin" && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem' }}>🐒</h1>
          <h2 style={{ fontSize: '2rem', color: '#fbbf24' }}>¡EL MONO ESTÁ CERRADO!</h2>
        </div>
      )}

      <Routes>
        <Route path="/" element={
          <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>
            <Header accesoSecreto={() => {}} tipoArrozHoy="Pollo" />
            
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              
              {/* TUS BOTONES ORIGINALES */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px' }}>
                {["Desayunos", "Fritos", "Arroces", "Bebidas"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategoriaActiva(cat)}
                    style={{ padding: '10px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? '#fbbf24' : '#ffffff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 🚨 BOTÓN DE RESCATE (Solo aparece si la página está vacía) */}
              {productos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fee2e2', borderRadius: '20px', border: '2px dashed #b91c1c' }}>
                  <h2 style={{ color: '#b91c1c' }}>⚠️ La vitrina está vacía</h2>
                  <p>Haz clic abajo para subir automáticamente todos tus desayunos, fritos y bebidas originales a la base de datos.</p>
                  <button onClick={restaurarTodaLaBase} style={{ padding: '15px 30px', backgroundColor: '#b91c1c', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', marginTop: '15px' }}>
                    Restaurar mis productos originales 🐒
                  </button>
                </div>
              )}

              {/* LA VISUAL EXACTA CON LA SELECCIÓN DE SABORES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {productos
                  .filter(p => p.categoria?.toLowerCase() === categoriaActiva.toLowerCase())
                  .map(p => (
                    <div key={p.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                      <img src={p.imagen} alt={p.nombre} onError={(e) => e.target.src = "https://via.placeholder.com/200?text=El+Mono"} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '15px' }} />
                      <h3 style={{ margin: '15px 0 5px 0' }}>{p.nombre}</h3>
                      
                      {/* CAJA DESPLEGABLE PARA LOS SABORES (Carne, Pollo, Arroz) */}
                      {p.opciones && (
                        <select style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #ccc', marginBottom: '10px', fontFamily: 'inherit' }}>
                          <option value="">¿De qué la quieres?</option>
                          {p.opciones.map(opc => <option key={opc} value={opc}>{opc}</option>)}
                        </select>
                      )}

                      <p style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '1.4rem', margin: '5px 0' }}>${p.precio}</p>
                      <button style={{ width: '100%', padding: '12px', backgroundColor: '#fbbf24', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>
                        Agregar al pedido
                      </button>
                    </div>
                  ))}
              </div>

            </main>
          </div>
        } />

        {/* EL ADMIN LIMPIO Y SIN BLOQUEOS */}
        <Route path="/admin" element={
          <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <AdminPanel tiendaAbierta={tiendaAbierta} setTiendaAbierta={toggleTiendaGlobal} productos={productos} />
          </div>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}