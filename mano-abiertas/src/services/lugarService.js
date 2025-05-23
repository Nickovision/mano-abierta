import { 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Colección de lugares
const lugaresCollection = collection(db, 'lugares');

// Crear un nuevo lugar
export const crearLugar = async (lugarData) => {
    try {
        const dataToSave = {
            ...lugarData,
            activo: true,
            fechaCreacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp()
        };
        // Ensure aQuienAyuda is an object, even if empty, to prevent Firestore errors with undefined
        if (typeof dataToSave.aQuienAyuda !== 'object' || dataToSave.aQuienAyuda === null) {
            dataToSave.aQuienAyuda = {};
        }

        const docRef = await addDoc(lugaresCollection, dataToSave);
        return { id: docRef.id, ...dataToSave };
    } catch (error) {
        console.error("Error al crear lugar:", error);
        throw error;
    }
};

// Actualizar un lugar existente
export const actualizarLugar = async (id, lugarData) => {
    try {
        const lugarRef = doc(db, 'lugares', id);
        const dataToUpdate = {
            ...lugarData,
            fechaActualizacion: serverTimestamp()
        };
        // Ensure aQuienAyuda is an object
        if (typeof dataToUpdate.aQuienAyuda !== 'object' || dataToUpdate.aQuienAyuda === null) {
            dataToUpdate.aQuienAyuda = {};
        }
        await updateDoc(lugarRef, dataToUpdate);
        return { id, ...dataToUpdate };
    } catch (error) {
        console.error("Error al actualizar lugar:", error);
        throw error;
    }
};

// Desactivar un lugar (eliminación lógica)
export const desactivarLugar = async (id) => {
    try {
        const lugarRef = doc(db, 'lugares', id);
        await updateDoc(lugarRef, { 
            activo: false,
            fechaActualizacion: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error al desactivar lugar:", error);
        throw error;
    }
};

// Eliminar un lugar físicamente de la base de datos
export const eliminarLugarFisico = async (id) => {
    try {
        const lugarRef = doc(db, 'lugares', id);
        await deleteDoc(lugarRef);
        return true;
    } catch (error) {
        console.error("Error al eliminar lugar físicamente:", error);
        throw error;
    }
};

// Obtener lugares activos con filtros opcionales
export const obtenerLugaresConFiltros = async (filtros = {}) => {
    try {
        let q = query(lugaresCollection, where("activo", "==", true));

        if (filtros.tipoRecurso && filtros.tipoRecurso !== 'Todos') {
            q = query(q, where("tipoRecurso", "==", filtros.tipoRecurso));
        }
        if (filtros.provincia && filtros.provincia !== 'Todas') {
            q = query(q, where("provincia", "==", filtros.provincia));
        }
        if (filtros.barrio && filtros.barrio !== 'Todos' && filtros.provincia && filtros.provincia !== 'Todas') {
            // Solo aplicar filtro de barrio si hay una provincia específica seleccionada
            q = query(q, where("barrio", "==", filtros.barrio));
        }
        // Add order by if needed, e.g., orderBy("nombreLugar")

        const querySnapshot = await getDocs(q);
        const lugares = [];
        querySnapshot.forEach((doc) => {
            lugares.push({ id: doc.id, ...doc.data() });
        });
        return lugares;
    } catch (error) {
        console.error("Error al obtener lugares con filtros:", error);
        throw error;
    }
};

// Obtener todos los lugares activos (can be deprecated in favor of obtenerLugaresConFiltros)
export const obtenerLugaresActivos = async () => {
    return obtenerLugaresConFiltros({}); // Calls the new function with no filters
};

// Obtener lugares por tipo (can be deprecated in favor of obtenerLugaresConFiltros)
export const obtenerLugaresPorTipo = async (tipo) => {
    return obtenerLugaresConFiltros({ tipoRecurso: tipo });
};

// Obtener un lugar por ID
export const obtenerLugarPorId = async (id) => {
    try {
        const lugarDoc = await getDoc(doc(db, 'lugares', id));
        
        if (lugarDoc.exists()) {
            return { id: lugarDoc.id, ...lugarDoc.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al obtener lugar por ID:", error);
        throw error;
    }
};