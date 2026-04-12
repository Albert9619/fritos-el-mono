import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (PLAN B)
// ==========================================
const productosBase = [
  { id: "empanada", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "arepa", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.jpg", disponible: true },
  { id: "papas", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "pastel", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "palito", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "buñuelo", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.jpg", disponible: true },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", disponible: true },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", disponible: true },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", disponible: true },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", disponible: true }
];

const extrasArrozBase = [
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 },
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 }
];

const MONO_NARANJA = "#f97316";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);
  const [pedido, setPedido] = useState([]);

  // Estados de inputs
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [sabores, setSabores] = useState({});
  const [tamanosBebida, setTamanosBebida] = useState({});

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubExtras(); unsubTienda(); };
  }, []);

  const fusionar = (base, fb) => {
    const mapa = {};
    base.forEach(p => mapa[p.id] = p);
    fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
    return Object.values(mapa);
  };

  const productosMostrar = fusionar(productosBase, productosFB);
  const extrasMostrar = fusionar(extrasArrozBase, extrasFB);

  const guardarCambio = async (col, id, datos) => {
    try { await setDoc(doc(db, col, id), datos, { merge: true }); } 
    catch (e) { console.error(e); }
  };

  const accesoSecreto = () => {
    const pin = window.prompt("🔐 PIN de Administrador:");
    if (pin === "mono2026") setIsAdmin(true);
    else if (pin !== null) alert("PIN Incorrecto");
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{width: '50px', height: '26px', backgroundColor: activo ? MONO_VERDE : '#cbd5e1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
      <div style={{width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '27px' : '3px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}/>
    </div>
  );

  // 🟢 PANEL DE ADMINISTRADOR ORDENADO
  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', color: MONO_TEXTO}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
            <h1 style={{margin:0, color: MONO_NARANJA}}>Gestión Menú 🐒</h1>
            <button onClick={() => setIsAdmin(false)} style={{background: MONO_TEXTO, color:'white', border:'none', padding:'10px 20px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer'}}>Cerrar Admin</button>
          </div>

          <div style={{background: tiendaAbierta ? '#dcfce7' : '#fee2e2', padding:'20px', borderRadius:'20px', marginBottom:'30px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #eee'}}>
            <strong>Estado de la Tienda: {tiendaAbierta ? '🟢 ABIERTO' : '🔴 CERRADO'}</strong>
            <MiniSwitch activo={tiendaAbierta} onClick={() => guardarCambio("ajuste", "tienda", { abierta: !tiendaAbierta })} />
          </div>

          {["Fritos", "Arroces", "Desayunos", "Bebidas"].map(cat => (
            <div key={cat} style={{marginBottom:'40px'}}>
              <h2 style={{borderLeft:`5px solid ${MONO_NARANJA}`, paddingLeft:'15px', color: MONO_TEXTO, marginBottom:'20px'}}>{cat}</h2>
              <div style={{display:'grid', gap:'15px'}}>
                {productosMostrar.filter(p => (p.categoria || (p.id === 'lzEcQicq9WUrxw7FEaq7' ? 'Arroces' : 'Fritos')) === cat).map(p => (
                  <div key={p.id} style={{background:'white', padding:'20px', borderRadius:'20px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:'bold', fontSize:'16px'}}>{p.nombre}</div>
                      <small style={{color:'gray'}}>ID: {p.id}</small>
                    </div>

                    <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                      {!p.tamanos && (
                        <div style={{display:'flex', alignItems:'center', background:'#f1f5f9', padding:'5px 10px', borderRadius:'12px'}}>
                          <span style={{marginRight:'5px', fontWeight:'bold'}}>$</span>
                          <input 
                            type="number" 
                            defaultValue={p.precio} 
                            onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })}
                            style={{width:'80px', border:'none', background:'transparent', fontWeight:'bold', fontSize:'16px', outline:'none'}}
                          />
                        </div>
                      )}
                      <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* EXTRAS PRECIOS */}
          <div style={{background:'white', padding:'25px', borderRadius:'25px', marginBottom:'50px', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}}>
            <h2 style={{marginTop:0}}>Precios de Extras</h2>
            {extrasMostrar.filter(e => e.precio !== undefined).map(e => (
              <div key={e.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #f1f5f9'}}>
                <span>{e.nombre}</span>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                  <div style={{background:'#f1f5f9', padding:'5px 10px', borderRadius:'10px'}}>
                    $ <input type="number" defaultValue={e.precio} onBlur={(ev) => guardarCambio("extrasArroz", e.id, { precio: Number(ev.target.value) })} style={{width:'70px', border:'none', background:'transparent'}} />
                  </div>
                  <MiniSwitch activo={e.disponible} onClick={() => guardarCambio("extrasArroz", e.id, { disponible: !e.disponible })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 🔵 VISTA CLIENTE
  return (
    <div style={{fontFamily: 'system-ui, sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px'}}>
      
      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '100%', height: '200px', objectFit: 'cover'}} />
        <h1 onDoubleClick={accesoSecreto} style={{color: MONO_NARANJA, margin: '15px 0', cursor:'pointer', fontSize:'28px'}}>Fritos El Mono 🐒</h1>
        <div style={{paddingBottom:'20px', fontWeight:'bold'}}>Arroz de Hoy: <span style={{color:MONO_NARANJA}}>{tipoArrozHoy}</span></div>
      </header>

      {/* CATEGORÍAS CLIENTE */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX:'auto', padding:'0 10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 20px', borderRadius: '20px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', boxShadow:'0 4px 6px rgba(0,0,0,0.05)', cursor:'pointer' }}>{cat}</button>
        ))}
      </div>

      {/* GRILLA PRODUCTOS */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '0 20px', maxWidth:'1200px', margin:'0 auto'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.id === 'lzEcQicq9WUrxw7FEaq7' ? 'Arroces' : 'Fritos')) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '30px', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9'}}>
              <h3 style={{margin: '0 0 10px 0', fontSize:'20px'}}>{p.nombre}</h3>
              <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', margin:'0 0 15px 0'}}>${(p.precio || (p.tamanos ? p.tamanos[0].precio : 0)).toLocaleString()}</p>

              {p.categoria === "Fritos" && p.opciones && (
                <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{width:'100%', padding:'12px', borderRadius:'15px', border:'1px solid #e2e8f0', marginBottom:'15px', background:'#f8fafc'}}>
                  <option value="">-- Elige Sabor --</option>
                  {p.opciones.map(opt => <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option>)}
                </select>
              )}

              {p.categoria === "Arroces" && (
                <div style={{background: '#fef3c7', padding: '15px', borderRadius: '20px', marginBottom: '15px'}}>
                   <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'10px', border:'none', marginBottom:'10px'}}>
                     <option value="">¿Tajada o Yuca?</option>
                     <option value="Tajadas">Tajadas</option><option value="Yuca">Yuca</option>
                   </select>
                   <label style={{display:'block'}}><input type="checkbox" onChange={(e)=>setConHuevo(e.target.checked)}/> + Huevo Extra</label>
                   <label style={{display:'block'}}><input type="checkbox" onChange={(e)=>setConQueso(e.target.checked)}/> + Queso Extra</label>
                </div>
              )}

              <button 
                onClick={() => {
                   const cant = 1;
                   let finalP = p.precio;
                   setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, subtotal: finalP * cant, cantidad: cant }]);
                }} 
                disabled={!p.disponible || !tiendaAbierta} 
                style={{marginTop:'auto', background: p.disponible ? MONO_NARANJA : '#cbd5e1', color:'white', border:'none', padding:'15px', borderRadius:'18px', fontWeight:'bold', cursor:'pointer'}}
              >
                {p.disponible ? 'Añadir al Pedido 🥟' : 'Agotado'}
              </button>
            </div>
          ))}
      </div>

      {/* CARRITO */}
      {pedido.length > 0 && (
        <div style={{maxWidth: '600px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '35px', border: `4px solid ${MONO_NARANJA}`, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop:0}}>Tu Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
              <span>{item.cantidad}x {item.nombre}</span>
              <strong>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{textAlign:'right', color: MONO_NARANJA, fontSize:'32px', marginTop:'20px'}}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <button style={{width:'100%', background:MONO_VERDE, color:'white', border:'none', padding:'18px', borderRadius:'15px', fontSize:'18px', fontWeight:'bold', marginTop:'20px', cursor:'pointer'}}>Confirmar por WhatsApp 📲</button>
        </div>
      )}
    </div>
  );
}