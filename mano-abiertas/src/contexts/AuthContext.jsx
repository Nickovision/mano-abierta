import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/config';

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}

// Proveedor del contexto
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para iniciar sesión
    async function signIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Función para cerrar sesión
    async function signOut() {
        return firebaseSignOut(auth);
    }

    // Efecto para escuchar cambios en la autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("Auth state changed:", user ? user.email : "No user");
            setCurrentUser(user);
            setLoading(false);
        });

        // Limpiar la suscripción cuando el componente se desmonte
        return unsubscribe;
    }, []);

    // Valor del contexto
    const value = {
        currentUser,
        loading,
        signIn,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}