import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; 
import AdminPanel from './components/AdminPanel';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore'; 

// --- COLORES BRANDING ORTEGA GESTIÓN DIGITAL ---
const MONO_CREMA = "#fffbeb";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState([]);
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  
  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("pedidoMono");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [cantidades, setCantidades] = useState({});

  // 📡 1. ESCUCHAR LA NUBE (Firebase)
  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });

    const unsubConf = onSnapshot(doc(db, "configuracion", "tienda"), (snap) => {
      if (snap.exists()) {
        setTiendaAbierta(snap.data().tiendaAbierta);
        setAcompañanteArroz(snap.data().tipoArrozHoy);
      }
    });

    return () => { unsubProd(); unsubConf(); };
  }, []);

  // 💾 2. PERSISTENCIA LOCAL DEL CARRITO
  useEffect(() => {
    localStorage.setItem("pedidoMono", JSON.stringify(pedido));
  }, [pedido]);

  // 🕹️ 3. FUNCIONES DEL CONTROLADOR (ADMIN)
  // Ahora estas funciones hablan con FIREBASE
  
  const toggleTienda = async () => {
    const tiendaRef = doc(db, "configuracion", "tienda");
    await updateDoc(tiendaRef, { tiendaAbierta: !tiendaAbierta });
    toast.success(tiendaAbierta ? "Tienda Cerrada 🔴" : "Tienda Abierta 🟢");
  };

  const toggleProducto = async (id, estadoActual) => {
    const prodRef = doc(db, "productos", id);
    await updateDoc(prodRef, { disponible: !estadoActual });
  };

  const cambiarPrecioProducto = async (id, nuevoPrecio) => {
    const prodRef = doc(db, "productos", id);
    await updateDoc(prodRef, { precio: Number(nuevoPrecio) });
    toast.success("Precio actualizado");
  };

  const accesoSecreto = () => {
    const pin = window.prompt("🔑 PIN de Ortega Gestión Digital:");
    if (pin === "mono2026") {
      setIsAdmin(true);
      toast.success("Modo Admin Activado");
    } else if (pin !== null) {
      toast.error("PIN Incorrecto");
    }
  };

  // 🛒 4. LÓGICA DE CLIENTE
  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Lo sentimos, estamos cerrados.");
    const cant = cantidades[p.id] || 1;
    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: p.precio,
      cantidad: cant,
      subtotal: p.precio * cant
    }]);
    toast.success(`${p.nombre} agregado`);
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR (El Controlador)
  // ==========================================
  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin} 
        tiendaAbierta={tiendaAbierta} 
        setTiendaAbierta={toggleTienda} // Ahora usa la función de Firebase
        productos={productos}
        toggleProducto={toggleProducto}
        cambiarPrecioProducto={cambiarPrecioProducto}
        // Pasamos extras vacíos por ahora para no romper el componente
        extrasArroz={[]} 
        salsas={[]}
      />
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO }}>
      <Toaster position="top-center" />

      <Header accesoSecreto={accesoSecreto} tipoArrozHoy={acompañanteArroz} />

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        {!tiendaAbierta && (
          <div style={{ textAlign: 'center', padding: '20px', background: '#fee2e2', borderRadius: '15px', marginBottom: '20px', border: '2px solid #ef4444', color: '#b91c1c', fontWeight: 'bold' }}>
            🔴 LOCAL CERRADO ACTUALMENTE
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {productos.map(p => (
            <ProductCard 
              key={p.id}
              p={p}
              tiendaAbierta={tiendaAbierta}
              cantidades={cantidades}
              sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})}
              restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})}
              agregarAlCarrito={agregarAlCarrito}
            />
          ))}
        </div>

        {pedido.length > 0 && (
          <Carrito 
            pedido={pedido} setPedido={setPedido} total={total}
            nombre={nombre} setNombre={setNombre}
            direccion={direccion} setDireccion={setDireccion}
            metodoPago={metodoPago} setMetodoPago={setMetodoPago}
            enviarWhatsApp={() => {
              const mensaje = `Nuevo Pedido:\n${pedido.map(i => `- ${i.cantidad}x ${i.nombre}`).join('\n')}\nTotal: $${total}\nCliente: ${nombre}`;
              window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
            }}
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        <p>🚀 Ortega Gestión Digital | Carepa 2026</p>
      </footer>
    </div>
  );
}