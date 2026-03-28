import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; 
import AdminPanel from './components/AdminPanel';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, addDoc } from 'firebase/firestore'; 

// ==========================================
// 🔴 LISTA PARA LA INYECCIÓN (Temporal)
// ==========================================
const productosParaSubir = [
  { nombre: "Empanada de Carne", precio: 2500, categoria: "Fritos", disponible: true, imagen: "/empanada.jpg" },
  { nombre: "Papa Rellena de la Casa", precio: 3000, categoria: "Fritos", disponible: true, imagen: "/papa-rellena.jpg" },
  { nombre: "Pastel de Pollo", precio: 2500, categoria: "Fritos", disponible: true, imagen: "/pastel-pollo.jpg" },
  { nombre: "Arepa con Huevo", precio: 3500, categoria: "Fritos", disponible: true, imagen: "/arepa-huevo.jpg" },
  { nombre: "Cariseca", precio: 2000, categoria: "Fritos", disponible: true, imagen: "/cariseca.jpg" },
  { nombre: "Chorizo con Arepa", precio: 5000, categoria: "Fritos", disponible: true, imagen: "/chorizo.jpg" },
  { nombre: "Jugo Natural 12oz", precio: 3000, categoria: "Bebidas", disponible: true, imagen: "/jugo-natural.jpg" },
  { nombre: "Jugo Natural 16oz", precio: 4000, categoria: "Bebidas", disponible: true, imagen: "/jugo-natural.jpg" },
];

const MONO_CREMA = "#fffbeb";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState([]);
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  
  // Estados para el pedido
  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("pedidoMono");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [cantidades, setCantidades] = useState({});

  // 📡 CONEXIÓN REAL CON FIREBASE
  useEffect(() => {
    // Escuchar productos
    const unsubProd = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });

    // Escuchar configuración de la tienda
    const unsubConf = onSnapshot(doc(db, "configuracion", "tienda"), (snap) => {
      if (snap.exists()) {
        setTiendaAbierta(snap.data().tiendaAbierta);
        setAcompañanteArroz(snap.data().tipoArrozHoy);
      }
    });

    return () => { unsubProd(); unsubConf(); };
  }, []);

  // Persistencia de pedido
  useEffect(() => {
    localStorage.setItem("pedidoMono", JSON.stringify(pedido));
  }, [pedido]);

  // 🔥 FUNCIÓN MÁGICA DE INYECCIÓN
  const subirMenuCompleto = async () => {
    const idCarga = toast.loading("Subiendo fritos a la nube...");
    try {
      for (const p of productosParaSubir) {
        await addDoc(collection(db, "productos"), p);
      }
      toast.success("¡Menú de El Mono cargado!", { id: idCarga });
    } catch (e) {
      toast.error("Error al subir", { id: idCarga });
      console.error(e);
    }
  };

  // --- LOGICA DE CLIENTE ---
  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    const nuevoItem = {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: p.precio,
      cantidad: cant,
      subtotal: p.precio * cant
    };
    setPedido([...pedido, nuevoItem]);
    toast.success(`Agregado: ${p.nombre}`);
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin} 
        tiendaAbierta={tiendaAbierta} 
        productos={productos}
      />
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO }}>
      <Toaster position="top-center" />

      {/* 🚀 EL BOTÓN ROJO (Aparecerá arriba de todo) */}
      <button 
        onClick={subirMenuCompleto}
        style={{ 
          width: '100%', padding: '20px', background: 'red', color: 'white', 
          fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '18px' 
        }}
      >
        🔥 INYECTAR MENÚ COMPLETO A FIREBASE (DAR SOLO UN CLIC)
      </button>

      <Header accesoSecreto={() => {
        const pin = window.prompt("PIN de Admin:");
        if (pin === "mono2026") setIsAdmin(true);
      }} />

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* GRILLA DE PRODUCTOS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {productos.map(p => (
            <ProductCard 
              key={p.id}
              p={p}
              tiendaAbierta={tiendaAbierta}
              cantidades={cantidades}
              setCantidades={setCantidades}
              sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})}
              restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})}
              agregarAlCarrito={agregarAlCarrito}
            />
          ))}
        </div>

        {/* CARRITO */}
        {pedido.length > 0 && (
          <Carrito 
            pedido={pedido} 
            setPedido={setPedido} 
            total={total}
            nombre={nombre} setNombre={setNombre}
            direccion={direccion} setDireccion={setDireccion}
            metodoPago={metodoPago} setMetodoPago={setMetodoPago}
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        <p>📍 Carepa, Antioquia | Fritos El Mono 2026</p>
      </footer>
    </div>
  );
}