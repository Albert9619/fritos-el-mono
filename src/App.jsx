import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { HashRouter, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_TEXTO = "#333333";

// --- 📋 DATOS INICIALES (Solo quedan como respaldo) ---
const productosBase = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.png", disponible: true, categoria: "fritos" },
  // ... (puedes dejar los demás aquí por si acaso)
];

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

export default function App() {
  // --- 🧠 ESTADOS ---
  const [productos, setProductos] = useState([]); // Empieza vacío, se llena desde Firebase
  const [salsas, setSalsas] = useState(salsasBase);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [pedido, setPedido] = useState(() => {
    const g = localStorage.getItem('pedido_mono');
    return g ? JSON.parse(g) : [];
  });

  const [isAdmin, setIsAdmin] = useState(false);
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

  // 📡 1. ESCUCHAR FIREBASE EN TIEMPO REAL
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id, // Captura el ID de Firebase (esos códigos largos de tu foto)
        ...d.data()
      }));
      setProductos(docs);
    });
    return () => unsub(); // Limpieza
  }, []);

  // 💾 GUARDADO LOCAL (Solo para el carrito)
  useEffect(() => { localStorage.setItem('pedido_mono', JSON.stringify(pedido)); }, [pedido]);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // --- 🔌 FUNCIONES ADMIN (CONECTADAS A FIREBASE) ---
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

  // Estas siguen siendo locales por ahora (puedes pasarlas a Firebase mañana)
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
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioFinal, saborElegido: sabores[p.id] || "", detallesExtra: det, cantidad: cant, subtotal: precioFinal * cant }]);
    toast.success("🛒 ¡Añadido!");
  };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return toast.error("Completa tus datos");
    let mensaje = `🧾 *NUEVO PEDIDO - MONO*\n👤 *Nombre:* ${nombre}\n📍 *Dirección:* ${direccion}\n💳 *Pago:* ${metodoPago}\n\n🍽️ *Detalle:*\n`;
    pedido.forEach(item => { mensaje += `- ${item.cantidad}x ${item.nombre}${item.saborElegido ? ' ('+item.saborElegido+')' : ''} ${item.detallesExtra}\n`; });
    if (salsasElegidas.length > 0) mensaje += `\n🧂 *Salsas:* ${salsasElegidas.join(", ")}\n`;
    mensaje += `\n💰 *Total: $${pedido.reduce((acc, i) => acc + i.subtotal, 0).toLocaleString('es-CO')}*`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`, "_blank");
    setPedido([]);
    localStorage.removeItem('pedido_mono');
  };

  const totalItems = pedido.reduce((acc, item) => acc + item.cantidad, 0);

  if (isAdmin) return <AdminPanel setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta} productos={productos} toggleProducto={toggleProducto} cambiarPrecioProducto={cambiarPrecioProducto} extrasArroz={extrasArroz} toggleExtraArroz={toggleExtraArroz} salsas={salsas} toggleSalsa={toggleSalsa} />;

  return (
  <HashRouter>
  <Toaster position="top-center" />
  
  <Routes>
    {/* 🏠 LA VISTA DEL CLIENTE (Lo que ya tienes) */}
    <Route path="/" element={
      <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '140px' }}>
        <Header accesoSecreto={() => {}} tipoArrozHoy={tipoArrozHoy} />
        
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
           {/* AQUÍ VA TODO TU CÓDIGO DE CATEGORÍAS Y PRODUCTOS */}
        </main>

        {/* AQUÍ VAN EL BOTÓN FLOTANTE Y EL CARRITO */}
      </div>
    } />

    {/* 🔐 LA VISTA DEL ADMIN (fritos-el-mono/admin) */}
    <Route path="/admin" element={
      <AdminGuard isAdmin={isAdmin} setIsAdmin={setIsAdmin}>
        <AdminPanel 
          setIsAdmin={setIsAdmin} 
          tiendaAbierta={tiendaAbierta} 
          setTiendaAbierta={setTiendaAbierta} 
          productos={productos} 
          toggleProducto={toggleProducto} 
          cambiarPrecioProducto={cambiarPrecioProducto}
          extrasArroz={extrasArroz}
          toggleExtraArroz={toggleExtraArroz}
          salsas={salsas}
          toggleSalsa={toggleSalsa}
        />
      </AdminGuard>
    } />

    {/* Si escriben cualquier otra cosa, los manda al inicio */}
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
</HashRouter>
);
}
// 🛡️ Esto va al final del archivo, fuera de la función App
function AdminGuard({ isAdmin, setIsAdmin, children }) {
  const navigate = useNavigate(); // Necesitas importar useNavigate de react-router-dom

  useEffect(() => {
    if (!isAdmin) {
      const pin = window.prompt("🔐 Acceso Restringido. Ingresa el PIN:");
      if (pin === "mono2026") {
        setIsAdmin(true);
      } else {
        navigate("/"); // Si falla, lo manda al inicio
      }
    }
  }, [isAdmin, setIsAdmin, navigate]);

  return isAdmin ? children : <div style={{padding: '50px', textAlign: 'center'}}>Verificando...</div>;
}