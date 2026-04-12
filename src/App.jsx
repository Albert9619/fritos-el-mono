import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS BASE
// ==========================================
const productosBase = [/* TU MISMO ARRAY */];
const extrasArrozBase = [/* TU MISMO ARRAY */];

const MONO_NARANJA = "#f97316";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

// ==========================================
// 🧠 FUNCIONES CLAVE (NUEVO)
// ==========================================
const fusionar = (base, fb) => {
  const mapa = {};
  base.forEach(p => mapa[p.id] = p);
  fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
  return Object.values(mapa);
};

const calcularSubtotal = (producto, seleccion, extrasDisponibles) => {
  let total = producto.precio || 0;

  // Tamaño
  if (seleccion?.tamano) {
    total = seleccion.tamano.precio;
  }

  // Extras arroz
  if (seleccion?.extras?.length) {
    total += seleccion.extras.reduce((acc, id) => {
      const extra = extrasDisponibles.find(e => e.id === id);
      return acc + (extra?.precio || 0);
    }, 0);
  }

  return total;
};

// ==========================================
// 🚀 APP
// ==========================================
export default function App() {

  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");

  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);

  const [pedido, setPedido] = useState([]);
  const [selecciones, setSelecciones] = useState({});

  // Cliente
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  // ==========================================
  // 🔄 FIREBASE
  // ==========================================
  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) =>
      setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) =>
      setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => {
      if (s.exists()) setTiendaAbierta(s.data().abierta);
    });

    return () => { unsubProd(); unsubExtras(); unsubTienda(); };
  }, []);

  // ==========================================
  // 💾 LOCAL STORAGE (NUEVO)
  // ==========================================
  useEffect(() => {
    const saved = localStorage.getItem("pedido");
    if (saved) setPedido(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("pedido", JSON.stringify(pedido));
  }, [pedido]);

  // ==========================================
  const productosMostrar = fusionar(productosBase, productosFB);
  const extrasMostrar = fusionar(extrasArrozBase, extrasFB);

  // ==========================================
  // 🛒 AGREGAR PRODUCTO (MEJORADO)
  // ==========================================
  const agregarProducto = (p) => {

    const seleccion = selecciones[p.id] || {};

    // Validaciones
    if (p.opciones && !seleccion.sabor) {
      return alert("Elige un sabor");
    }

    const subtotal = calcularSubtotal(p, seleccion, extrasMostrar);

    const existente = pedido.find(item =>
      item.id === p.id &&
      JSON.stringify(item.seleccion) === JSON.stringify(seleccion)
    );

    if (existente) {
      setPedido(pedido.map(item =>
        item === existente
          ? { ...item, cantidad: item.cantidad + 1, subtotal: item.subtotal + subtotal }
          : item
      ));
    } else {
      setPedido([
        ...pedido,
        {
          id: p.id,
          nombre: p.nombre,
          cantidad: 1,
          subtotal,
          seleccion
        }
      ]);
    }
  };

  // ==========================================
  const cambiarCantidad = (index, delta) => {
    const nuevo = [...pedido];
    nuevo[index].cantidad += delta;

    if (nuevo[index].cantidad <= 0) {
      nuevo.splice(index, 1);
    }

    setPedido(nuevo);
  };

  // ==========================================
  const total = pedido.reduce((acc, i) => acc + i.subtotal, 0);

  // ==========================================
  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos");

    const lista = pedido.map(i =>
      `-${i.cantidad}x ${i.nombre}`
    ).join('\n');

    const msg = `Pedido 🐒:\n\n${lista}\n\nTotal: $${total}\n${nombre}\n${direccion}\n${metodoPago}`;

    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  // ==========================================
  // 🎯 UI
  // ==========================================
  return (
    <div style={{padding:'20px'}}>

      <h1 onDoubleClick={() => {
        const pin = prompt("PIN");
        if (pin === "mono2026") setIsAdmin(true);
      }}>
        Fritos El Mono 🐒
      </h1>

      {/* CATEGORÍAS */}
      {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
        <button key={cat} onClick={() => setCategoriaActiva(cat)}>
          {cat}
        </button>
      ))}

      {/* PRODUCTOS */}
      {productosMostrar
        .filter(p => p.categoria === categoriaActiva)
        .map(p => {

          const sel = selecciones[p.id] || {};

          return (
            <div key={p.id} style={{border:'1px solid #ccc', margin:'10px', padding:'10px'}}>

              <h3>{p.nombre}</h3>

              {/* SABORES */}
              {p.opciones && (
                <select onChange={(e) =>
                  setSelecciones({
                    ...selecciones,
                    [p.id]: { ...sel, sabor: e.target.value }
                  })
                }>
                  <option value="">Sabor</option>
                  {p.opciones.map(o => (
                    <option key={o.nombre}>{o.nombre}</option>
                  ))}
                </select>
              )}

              {/* TAMAÑOS */}
              {p.tamanos && (
                <select onChange={(e) => {
                  const tam = p.tamanos.find(t => t.nombre === e.target.value);
                  setSelecciones({
                    ...selecciones,
                    [p.id]: { ...sel, tamano: tam }
                  });
                }}>
                  <option>Tamaño</option>
                  {p.tamanos.map(t => (
                    <option key={t.nombre}>{t.nombre}</option>
                  ))}
                </select>
              )}

              {/* EXTRAS */}
              {p.categoria === "Arroces" && (
                <>
                  {extrasMostrar.map(e => (
                    <label key={e.id}>
                      <input
                        type="checkbox"
                        onChange={(ev) => {
                          const extras = sel.extras || [];
                          const nuevos = ev.target.checked
                            ? [...extras, e.id]
                            : extras.filter(x => x !== e.id);

                          setSelecciones({
                            ...selecciones,
                            [p.id]: { ...sel, extras: nuevos }
                          });
                        }}
                      />
                      {e.nombre}
                    </label>
                  ))}
                </>
              )}

              <button onClick={() => agregarProducto(p)}>
                Añadir
              </button>

            </div>
          );
        })}

      {/* 🛒 CARRITO */}
      <h2>Pedido</h2>

      {pedido.map((item, i) => (
        <div key={i}>
          {item.nombre} x{item.cantidad}
          <button onClick={() => cambiarCantidad(i, -1)}>-</button>
          <button onClick={() => cambiarCantidad(i, 1)}>+</button>
        </div>
      ))}

      <h2>Total: ${total}</h2>

      <input placeholder="Nombre" onChange={e => setNombre(e.target.value)} />
      <input placeholder="Dirección" onChange={e => setDireccion(e.target.value)} />

      <select onChange={e => setMetodoPago(e.target.value)}>
        <option>Pago</option>
        <option>Efectivo</option>
        <option>Nequi</option>
      </select>

      <button onClick={enviarWhatsApp}>
        Pedir por WhatsApp
      </button>

    </div>
  );
}