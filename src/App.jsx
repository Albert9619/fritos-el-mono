import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore"; 
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import AdminPanel from './components/AdminPanel';

const MONO_CREMA = "#fffbeb";

const salsasBase = [
  { nombre: "Pique", disponible: true, imagen: "/pique.png" },
  { nombre: "Salsa Roja", disponible: true, imagen: "/salsa-roja.png" },
  { nombre: "Salsa Rosada", disponible: true, imagen: "/salsa-rosada.png" },
  { nombre: "Suero", disponible: true, imagen: "/suero.png" },
  { nombre: "Suero Picante", disponible: true, imagen: "/suero-picante.png" }
];

const extrasArrozBase = [
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Queso Extra", disponible: true, precio: 1000 }
];

function AdminGuard({ children }) {
  const [acceso, setAcceso] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const pin = window.prompt("🔐 Acceso Restringido. Ingresa el PIN:");
    if (pin === "mono2026") {
      setAcceso(true);
    } else {
      navigate("/");
    }
  }, [navigate]);

  return acceso ? children : <div style={{ padding: '50px', textAlign: 'center' }}>Verificando...</div>;
}

function AdminLayout({ children }) {
  return <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#fff', padding: '20px' }}>{children}</div>;
}

function ClientLayout({ children }) {
  return <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px', position: 'relative' }}>{children}</div>;
}

export default function App() {
  const [productos, setProductos] = useState([]);
  const [salsas, setSalsas] = useState(salsasBase);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [pedido, setPedido] = useState(() => {
    const g = localStorage.getItem('pedido_mono');
    return g ? JSON.parse(g) : [];
  });
  
  const [tiendaAbierta, setTiendaAbierta] = useState(true);

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });

    const unsubTienda = onSnapshot(doc(db, "ajustes", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        setTiendaAbierta(snapshot.data().abierta);
      }
    });

    return () => { unsubProd(); unsubTienda(); };
  }, []);

  useEffect(() => {
    localStorage.setItem('pedido_mono', JSON.stringify(pedido));
  }, [pedido]);

  const toggleTiendaGlobal = async () => {
    try {
      const tiendaRef = doc(db, "ajustes", "tienda");
      await updateDoc(tiendaRef, { abierta: !tiendaAbierta });
      toast.success(tiendaAbierta ? "🔴 Tienda Cerrada" : "🟢 Tienda Abierta");
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const adminProps = { tiendaAbierta, setTiendaAbierta: toggleTiendaGlobal, productos, salsas, extrasArroz };

  return (
    <HashRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={
          <ClientLayout>
            <Header accesoSecreto={() => {}} tipoArrozHoy={"Pollo"} />
            
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', position: 'relative' }}>
              
              {/* 🛡️ ESTO ES LO QUE BLOQUEA EL CELULAR */}
              {!tiendaAbierta && (
                <div style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  textAlign: 'center',
                  padding: '20px',
                  backdropFilter: 'blur(5px)'
                }}>
                  <span style={{ fontSize: '60px' }}>😴</span>
                  <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>¡LO SENTIMOS!</h1>
                  <p style={{ fontSize: '1.2rem' }}>El Mono está descansando o ya cerramos por hoy.</p>
                  <p style={{ backgroundColor: '#fbbf24', color: 'black', padding: '10px 20px', borderRadius: '20px', marginTop: '20px', fontWeight: 'bold' }}>
                    Vuelve pronto para los mejores fritos
                  </p>
                </div>
              )}

              <div style={{ opacity: tiendaAbierta ? 1 : 0.2, pointerEvents: tiendaAbierta ? 'auto' : 'none' }}>
                {/* AQUÍ PEGA TUS COMPONENTES DE CATEGORÍAS Y PRODUCTOS 
                   (Ejemplo: <Categorias /> <ListaProductos />)
                */}
                <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Menú de Hoy</h2>
                <p style={{ textAlign: 'center' }}>Los productos aparecerán aquí si Firebase está conectado.</p>
              </div>

            </main>
          </ClientLayout>
        } />

        <Route path="/admin" element={
          <AdminGuard>
            <AdminLayout>
              <AdminPanel {...adminProps} />
            </AdminLayout>
          </AdminGuard>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}