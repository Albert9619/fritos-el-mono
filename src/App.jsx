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
  }, []);

  return acceso ? children : <div style={{ padding: '50px', textAlign: 'center' }}>Verificando...</div>;
}

// Layout exclusivo para admin
function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#fff', padding: '20px' }}>
      {children}
    </div>
  );
}

// Layout exclusivo para cliente
function ClientLayout({ children }) {
  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>
      {children}
    </div>
  );
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

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // 🔴 Firebase en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('pedido_mono', JSON.stringify(pedido));
  }, [pedido]);

  const adminProps = { tiendaAbierta, setTiendaAbierta, productos, salsas, extrasArroz };

  return (
    <HashRouter>
      <Toaster position="top-center" />
      <Routes>

        {/* Vista cliente */}
        <Route path="/" element={
          <ClientLayout>
            <Header accesoSecreto={() => window.location.href = "/#/admin"} tipoArrozHoy={tipoArrozHoy} />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              {/* Aquí van tus categorías y productos */}
            </main>
          </ClientLayout>
        } />

        {/* Vista admin separada */}
        <Route path="/admin" element={
          <AdminGuard>
            <AdminLayout>
              <AdminPanel {...adminProps} />
            </AdminLayout>
          </AdminGuard>
        } />

        {/* Redirección global */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}