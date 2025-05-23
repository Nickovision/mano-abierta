import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Snackbar, Alert } from '@mui/material';
import LugarForm from '../components/LugarForm';
import { crearLugar } from '../services/lugarService';

const LugarNuevo = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            setError(null);
            await crearLugar(formData);
            setSuccess(true);

            // Redirigir después de un breve retraso para que el usuario vea el mensaje de éxito
            setTimeout(() => {
                navigate('/admin/lugares');
            }, 2000);
        } catch (error) {
            console.error("Error al crear lugar:", error);
            setError("Error al crear el lugar. Por favor, intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSuccess(false);
        setError(null);
    };

    return (
        <Box sx={{ mt: 2, mb: 8, p: 2 }}>
            <LugarForm
                onSubmit={handleSubmit}
                isLoading={loading}
            />

            {/* Snackbar para mostrar mensajes de éxito */}
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Lugar creado exitosamente
                </Alert>
            </Snackbar>

            {/* Snackbar para mostrar mensajes de error */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LugarNuevo;