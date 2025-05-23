import { 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

// Iniciar sesión con email y contraseña
export const loginWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error en login:", error);
        throw error;
    }
};

// Cerrar sesión
export const logout = async () => {
    try {
        await firebaseSignOut(auth);
        return true;
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        throw error;
    }
};

// Obtener el usuario actual
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, 
            (user) => {
                unsubscribe();
                resolve(user);
            },
            (error) => {
                reject(error);
            }
        );
    });
};