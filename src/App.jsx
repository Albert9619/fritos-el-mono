import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; 
import AdminPanel from './components/AdminPanel';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, addDoc } from 'firebase/firestore'; // ✅ addDoc añadido

// ==========================================
// 🔴 LISTA PARA LA INYECCIÓN (Temporal)
// ==========================================
const productosParaSubir = [
  { nombre: "Empanada de Carne", precio: 2500, categoria: "Fritos", disponible: true, imagen: "/empanada.jpg" },
  { nombre: "Papa Rellena", precio: 3000, categoria: "Fritos", disponible: true, imagen: "/papa.jpg" },
  { nombre: "Cariseca", precio: 2000, categoria: "Fritos", disponible: true, imagen: "/cariseca.jpg" },
  { nombre: "Chorizo con Arepa", precio: 5000, categoria: "Fritos", disponible: true, imagen: "/chorizo.jpg" },
  { nombre: "Jugo de Mora 12oz", precio: 3000, categoria: "Bebidas", disponible: true, imagen: "/jugo.jpg" },
  { nombre: "Jugo de Mora 16oz", precio: 4000, categoria: "Bebidas", disponible: true, imagen: "/jugo.jpg" },
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 }
];

const salsasBase = [
  { nombre: "Pique", disponible: true },
  { nombre: "Salsa Roja", disponible: true },
  { nombre: "Salsa Rosada", disponible: true },
  { nombre: "Suero", disponible: true },
  { nombre: "Suero Picante", disponible: true }
];

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState([]);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [salsas, setSalsas] = useState(salsasBase);

  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("pedidoMono");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [salsasElegidas, setSalsasElegidas] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null); 

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // 📡 Conexión en tiempo real
  useEffect(() => {
    const unsubProductos = onSnapshot(collection(db, "productos"), (snapshot) => {
      const listaProductos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(listaProductos);
    });

    const unsubConfig = onSnapshot(doc(db, "configuracion", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTiendaAbierta(data.tiendaAbierta);
        setAcompañanteArroz(data.tipoArrozHoy);
      }
    });

    return () => { unsubProductos(); unsubConfig(); };
  }, []);

  // 🔥 FUNCIÓN DE INYECCIÓN
  const subirMenuCompleto = async () => {
    try {
      toast.loading("Subiendo fritos...");
      for (const producto of productosParaSubir) {
        await addDoc(collection(db, "productos"), producto);
      }
      toast.dismiss();
      toast.success("¡Menú inyectado con éxito!");
    } catch (error) {
      toast.error("Error al subir el menú");
    }
  };

  // --- ACCESO Y FUNCIONES (Admin/Cliente) ---
  const accesoSecreto = () => {
    const clave = window.prompt("🔐 Ingresa el PIN:");
    if (clave === "mono2026") { setIsAdmin(true); toast.success("Bienvenido"); }
    else if (clave !== null) { toast.error("PIN incorrecto"); }
  };

  const toggleProducto = (id) => setProductos(productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, nuevoPrecio) => setProductos(productos.map(p => p.id === id ? { ...p, precio: parseInt(nuevoPrecio) || 0 } : p));
  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Cerrado");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, cantidad: cant, subtotal: precioBase * cant }]);
    toast.success("¡Agregado!");
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta}
        productos={productos} toggleProducto={toggleProducto} cambiarPrecioProducto={cambiarPrecioProducto}
        extrasArroz={extrasArroz} salsas={salsas}
      />
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  const tajadaObj = extrasArroz.find(e => e.id === 'tajada') || { disponible: false, precio: 0 };
  const yucaObj = extrasArroz.find(e => e.id === 'yuca') || { disponible: false, precio: 0 };
  const huevoObj = extrasArroz.find(e => e.id === 'huevo') || { disponible: false, precio: 1000 };

  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '60px' }}>
      <Toaster position="bottom-center" />
      
      {/* 🚀 BOTÓN TEMPORAL DE INYECCIÓN */}
      <button 
        onClick={subirMenuCompleto}
        style={{ width: '100%', padding: '15px', background: 'red', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
      >
        🔥 SUBIR MENÚ A FIREBASE (UN SOLO CLIC)
      </button>

      <Header accesoSecreto={accesoSecreto} tipoArrozHoy={tipoArrozHoy} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        {productos.map(p => (
          <ProductCard 
            key={p.id} p={p} tiendaAbierta={tiendaAbierta} 
            cantidades={cantidades} agregarAlCarrito={agregarAlCarrito}
            tajadaObj={tajadaObj} yucaObj={yucaObj} huevoObj={huevoObj}
            sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id]||1)+1})}
            restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id]||1)-1)})}
          />
        ))}
      </div>

      {pedido.length > 0 && (
        <Carrito pedido={pedido} setPedido={setPedido} total={total} nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion} metodoPago={metodoPago} setMetodoPago={setMetodoPago} />
      )}

      <footer style={{ textAlign: 'center', padding: '40px', background: 'white' }}>
        <p>📍 Carepa, Antioquia | Fritos El Mono 2026</p>
      </footer>
    </div>
  );
}