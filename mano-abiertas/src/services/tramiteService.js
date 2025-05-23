import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Colección de trámites
const tramitesCollection = collection(db, 'tramites');

// Crear un nuevo trámite
export const crearTramite = async (tramiteData) => {
    try {
        const tramiteConMetadata = {
            ...tramiteData,
            activo: true,
            fechaCreacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp()
        };

        const docRef = await addDoc(tramitesCollection, tramiteConMetadata);
        return { id: docRef.id, ...tramiteConMetadata };
    } catch (error) {
        console.error("Error al crear trámite:", error);
        throw error;
    }
};

// Obtener todos los trámites activos (similar a lugarService, for future use if needed)
export const obtenerTramitesActivos = async () => {
    try {
        const q = query(tramitesCollection, where("activo", "==", true));
        const querySnapshot = await getDocs(q);

        const tramites = [];
        querySnapshot.forEach((doc) => {
            tramites.push({ id: doc.id, ...doc.data() });
        });

        return tramites;
    } catch (error) {
        console.error("Error al obtener trámites:", error);
        throw error;
    }
};

// Actualizar un trámite existente (for future use if needed)
export const actualizarTramite = async (id, tramiteData) => {
    try {
        const tramiteRef = doc(db, 'tramites', id);
        const tramiteActualizado = {
            ...tramiteData,
            fechaActualizacion: serverTimestamp()
        };
        await updateDoc(tramiteRef, tramiteActualizado);
        return { id, ...tramiteActualizado };
    } catch (error) {
        console.error("Error al actualizar trámite:", error);
        throw error;
    }
};

// Desactivar un trámite (eliminación lógica) (for future use if needed)
export const desactivarTramite = async (id) => {
    try {
        const tramiteRef = doc(db, 'tramites', id);
        await updateDoc(tramiteRef, {
            activo: false,
            fechaActualizacion: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error al desactivar trámite:", error);
        throw error;
    }
};