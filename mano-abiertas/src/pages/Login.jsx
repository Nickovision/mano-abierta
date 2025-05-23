import React from 'react';
import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);

            // Usar directamente Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Usuario autenticado:", userCredential.user);

            // Redirigir a la página de administración
            navigate('/admin');

        } catch (error) {
            console.error("Error de inicio de sesión:", error);

            // Mensajes de error más específicos
            if (error.code === 'auth/invalid-credential') {
                setError('Credenciales inválidas. Verifica tu email y contraseña.');
            } else if (error.code === 'auth/user-not-found') {
                setError('No existe una cuenta con este email.');
            } else if (error.code === 'auth/wrong-password') {
                setError('Contraseña incorrecta.');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Demasiados intentos fallidos. Intenta más tarde.');
            } else {
                setError('Error al iniciar sesión. Por favor, intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 2, mb: 8, p: 2, display: 'flex', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ p: 3, maxWidth: 400, width: '100%' }}>
                <Typography variant="h5" component="h1" sx={{ textAlign: 'center', mb: 3 }}>
                    Acceso para colaboradores
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                                Iniciando sesión...
                            </>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Login;