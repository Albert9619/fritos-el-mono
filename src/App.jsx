import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_TEXTO = "#333333";

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

// 🛡️ AdminGuard va ANTES de App para poder ser usado dentro del Router
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
  }, []); // Solo se ejecuta una vez al entrar a /admin

  return acceso ? children : <div style={{ padding: '50px', textAlign: 'center' }}>Verificando...</div>;
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
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [opcionesDesayuno, setOpcionesDesayuno] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [salsasElegidas, setSalsasElegidas] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("fritos");

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

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const toggleProducto = async (id) => {
    try {
      const p = productos.find(item => item.id === id);
      const docRef = doc(db, "productos", id);
      await updateDoc(docRef, { disponible: !p.disponible });
      toast.success(`${p.nombre} actualizado`);
    } catch (e) { toast.error("Error al sincronizar"); }
  };

  const cambiarPrecioProducto = async (id, n) => {
    try {
      const docRef = doc(db, "productos", id);
      await updateDoc(docRef, { precio: parseInt(n) || 0 });
    } catch (e) { console.error(e); }
  };

  const toggleSalsa = (nom) => setSalsas(prev => prev.map(s => s.nombre === nom ? { ...s, disponible: !s.disponible } : s));
  const toggleExtraArroz = (id) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Cerrado");
    const cant = cantidades[p.id] || 1;
    let precioFinal = p.precio || 0;
    let det = "";
    if (p.tamanos) {
      const tam = p.tamanos.find(t => t.nombre === (tamanosJugo[p.id] || p.tamanos[0].nombre));
      precioFinal = tam?.precio || 0;
    }
    if (p.esDesayuno) {
      const opt = opcionesDesayuno[p.id] || {};
      if (!opt.acompañante || !opt.jugo) return toast.error("Faltan opciones");
      if (opt.agrandarJugo) precioFinal += 1000;
      det = `(${opt.acompañante} + ${opt.huevo || opt.proteina || ''} + Jugo ${opt.jugo}${opt.agrandarJugo ? ' GRANDE' : ''})`;
    }
    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: precioFinal,
      saborElegido: sabores[p.id] || "",
      detallesExtra: det,
      cantidad: cant,
      subtotal: precioFinal * cant
    }]);
    toast.success("🛒 ¡Añadido!");
  };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return toast.error("Completa tus datos");
    let mensaje = `🧾 *NUEVO PEDIDO - MONO*\n👤 *Nombre:* ${nombre}\n📍 *Dirección:* ${direccion}\n💳 *Pago:* ${metodoPago}\n\n🍽️ *Detalle:*\n`;
    pedido.forEach(item => { mensaje += `- ${item.cantidad}x ${item.nombre}${item.saborElegido ? ' (' + item.saborElegido + ')' : ''} ${item.detallesExtra}\n`; });
    if (salsasElegidas.length > 0) mensaje += `\n🧂 *Salsas:* ${salsasElegidas.join(", ")}\n`;
    mensaje += `\n💰 *Total: $${pedido.reduce((acc, i) => acc + i.subtotal, 0).toLocaleString('es-CO')}*`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`, "_blank");
    setPedido([]);
    localStorage.removeItem('pedido_mono');
  };

  const adminProps = {
    tiendaAbierta, setTiendaAbierta,
    productos, toggleProducto, cambiarPrecioProducto,
    extrasArroz, toggleExtraArroz,
    salsas, toggleSalsa
  };

  // ✅ HashRouter envuelve TODO, incluyendo las rutas
  return (
    <HashRouter>
      <Toaster position="top-center" />
      <Routes>

        {/* 🏠 Vista del cliente */}
        <Route path="/" element={
          <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>
            <Header accesoSecreto={() => {}} tipoArrozHoy={tipoArrozHoy} />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              {/* Tu código de categorías y productos aquí */}
            </main>
          </div>
        } />

        {/* 🔐 Vista del admin — se accede con /#/admin */}
        <Route path="/admin" element={
          <AdminGuard>
            <AdminPanel
              setIsAdmin={() => {}}
              {...adminProps}
            />
          </AdminGuard>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}