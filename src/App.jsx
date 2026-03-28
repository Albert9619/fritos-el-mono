// ... (Importar AdminPanel arriba del todo)

  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin}
        tiendaAbierta={tiendaAbierta}
        setTiendaAbierta={setTiendaAbierta}
        productos={productos}
        toggleProducto={toggleProducto}
        cambiarPrecioProducto={cambiarPrecioProducto}
        toggleSabor={toggleSabor}
        toggleTamano={toggleTamano}
        cambiarPrecioTamano={cambiarPrecioTamano}
        extrasArroz={extrasArroz}
        toggleExtraArroz={toggleExtraArroz}
        cambiarPrecioExtraArroz={cambiarPrecioExtraArroz}
        salsas={salsas}
        toggleSalsa={toggleSalsa}
      />
    );
  }