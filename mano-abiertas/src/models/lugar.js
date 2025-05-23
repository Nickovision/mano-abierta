// Modelo de datos para un lugar (actualizado)
const lugarModel = {
    tipoRecurso: "", // Obligatorio
    nombreLugar: "", // Obligatorio
    direccionLugar: "", // Obligatorio
    googleMapsLink: "", // Opcional - URL
    provincia: "", // Obligatorio
    barrio: "", // Obligatorio si CABA o AMBA, opcional en otros casos
    horarios: "", // Obligatorio
    aQuienAyuda: {}, // Objeto con booleanos: { todos: false, hombres: false, ... }
    telefono: "", // Opcional
    mail: "", // Opcional - Email
    sitioWeb: "", // Opcional - URL
    informacionAdicional: "", // Opcional
    fuente: "", // Obligatorio
    fechaVerificacion: new Date(), // Obligatorio - Fecha de Última Verificación

    // Campos de auditoría (se mantienen)
    activo: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
};

export default lugarModel;