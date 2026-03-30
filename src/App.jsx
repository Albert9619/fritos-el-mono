import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore"; // Importamos lo necesario
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

// 🔐 AdminGuard protege solo /admin
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

// Layouts
function AdminLayout({ children }) {
  return <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#fff', padding: '20px' }}>{children}</div>;
}

function ClientLayout({ children }) {
  return <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>{children}</div>;
}

export default function App() {
  const [productos, setProductos] = useState([]);
  const [salsas, setSalsas] = useState(salsasBase);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [pedido, setPedido] = useState(() => {
    const g = localStorage.getItem('pedido_mono');
    return g ? JSON.parse(g) : [];
  });
  
  // 🔘 Estado de la tienda (Empieza en true por defecto)
  const [tiendaAbierta, setTiendaAbierta] = useState(true);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // 🔥 ESCUCHAR FIREBASE EN TIEMPO REAL
  useEffect(() => {
    // 1. Escuchar Productos
    const unsubProd = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });

    // 2. Escuchar Interruptor de Tienda (Colección ajustes -> documento tienda)
    const unsubTienda = onSnapshot(doc(db, "ajustes", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        setTiendaAbierta(snapshot.data().abierta);
      }
    });

    return () => {
      unsubProd();
      unsubTienda();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pedido_mono', JSON.stringify(pedido));
  }, [pedido]);

  // 🕹️ FUNCIÓN PARA CAMBIAR EL ESTADO GLOBAL (Manda la orden a Firebase)
  const toggleTiendaGlobal = async () => {
    try {
      const tiendaRef = doc(db, "ajustes", "tienda");
      await updateDoc(tiendaRef, { abierta: !tiendaAbierta });
      toast.success(tiendaAbierta ? "🔴 Tienda Cerrada" : "🟢 Tienda Abierta");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("No se pudo conectar con Firebase");
    }
  };

  // Preparamos las props para el admin
  const adminProps = { 
    tiendaAbierta, 
    setTiendaAbierta: toggleTiendaGlobal, // Usamos la función de Firebase
    productos, 
    salsas, 
    extrasArroz 
  };

  return (
    <HashRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Vista cliente */}
        <Route path="/" element={
          <ClientLayout>
            <Header accesoSecreto={() => {}} tipoArrozHoy={tipoArrozHoy} />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              {/* Si la tienda está cerrada, puedes mostrar un mensaje global aquí */}
              {!tiendaAbierta && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
                  🚫 LO SENTIMOS, LA TIENDA ESTÁ CERRADA POR AHORA
                </div>
              )}
              {/* Aquí van tus componentes de categorías y productos */}
            </main>
          </ClientLayout>
        } />

        {/* Vista admin protegida */}
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