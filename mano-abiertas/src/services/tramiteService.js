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

// Obtener trámites con filtros opcionales
export const obtenerTramitesConFiltros = async (filtros = {}) => {
    try {
        let q;
        // Admin might want to see inactive ones too
        if (filtros.includeInactive) {
            q = query(tramitesCollection);
        } else {
            // Public view only shows active trámites
            q = query(tramitesCollection, where("activo", "==", true));
        }

        if (filtros.categoria && filtros.categoria !== 'Todas') {
            q = query(q, where("categoria", "==", filtros.categoria));
        }
        // Add order by if needed, e.g., orderBy("titulo")

        const querySnapshot = await getDocs(q);
        const tramites = [];
        querySnapshot.forEach((doc) => {
            tramites.push({ id: doc.id, ...doc.data() });
        });
        return tramites;
    } catch (error) {
        console.error("Error al obtener trámites con filtros:", error);
        throw error;
    }
};


// Obtener un trámite por ID (useful for an edit page later)
export const obtenerTramitePorId = async (id) => {
    try {
        const tramiteDoc = await getDoc(doc(db, 'tramites', id));
        if (tramiteDoc.exists()) {
            return { id: tramiteDoc.id, ...tramiteDoc.data() };
        } else {
            console.log("No such tramite!");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener trámite por ID:", error);
        throw error;
    }
};

// Actualizar un trámite existente
export const actualizarTramite = async (id, tramiteData) => {
    try {
        const tramiteRef = doc(db, 'tramites', id);
        const tramiteActualizado = {
            ...tramiteData,
            fechaActualizacion: serverTimestamp()
        };
        // Ensure 'activo' field is preserved or explicitly set if it's part of tramiteData
        if (typeof tramiteData.activo === 'undefined' && tramiteRef.activo) {
             tramiteActualizado.activo = tramiteRef.activo; // Preserve existing
        } else if (typeof tramiteData.activo !== 'undefined') {
            tramiteActualizado.activo = tramiteData.activo; // Use new value
        }


        await updateDoc(tramiteRef, tramiteActualizado);
        return { id, ...tramiteActualizado };
    } catch (error) {
        console.error("Error al actualizar trámite:", error);
        throw error;
    }
};

// Desactivar un trámite (eliminación lógica)
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

// Activar un trámite
export const activarTramite = async (id) => {
    try {
        const tramiteRef = doc(db, 'tramites', id);
        await updateDoc(tramiteRef, {
            activo: true,
            fechaActualizacion: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error al activar trámite:", error);
        throw error;
    }
};

// Eliminar un trámite físicamente (use with caution)
export const eliminarTramiteFisico = async (id) => {
    try {
        const tramiteRef = doc(db, 'tramites', id);
        await deleteDoc(tramiteRef);
        return true;
    } catch (error) {
        console.error("Error al eliminar trámite físicamente:", error);
        throw error;
    }
};