import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Snackbar,
    Alert,
    CircularProgress,
    Typography,
    Paper,
    IconButton,
    Button
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import LugarForm from '../components/LugarForm'; // The refactored form
import { obtenerLugarPorId, actualizarLugar } from '../services/lugarService';
import { useAuth } from '../contexts/AuthContext';

const LugarEditar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();

    const [lugar, setLugar] = useState(null);
    const [loadingData, setLoadingData] = useState(true); // For fetching data
    const [isSaving, setIsSaving] = useState(false); // For submitting data
    const [error, setError] = useState(null);
    // Snackbar state and handlers
    const [snackbar, setSnackbarState] = useState({ open: false, message: '', severity: 'info' });
    const setSnackbar = (newState) => setSnackbarState(prev => ({ ...prev, ...newState }));


    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/login');
        }
    }, [currentUser, authLoading, navigate]);

    useEffect(() => {
        if (currentUser && id) {
            const fetchLugar = async () => {
                setLoadingData(true);
                setError(null);
                try {
                    const lugarData = await obtenerLugarPorId(id);
                    if (lugarData) {
                        if (lugarData.activo) {
                            setLugar(lugarData);
                        } else {
                            setError("Este lugar ha sido marcado como inactivo y no puede ser editado desde aquí. Puede verlo en la lista de lugares inactivos (si existe tal funcionalidad) o contactar a un administrador.");
                            setLugar(null); // Clear lugar if inactive
                        }
                    } else {
                        setError("El lugar no existe o no se pudo cargar.");
                        setLugar(null);
                    }
                } catch (err) {
                    console.error("Error al obtener lugar:", err);
                    setError("Error al cargar el lugar. Intente nuevamente.");
                    setLugar(null);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchLugar();
        } else if (!id) {
            setError("No se especificó un ID de lugar para editar.");
            setLoadingData(false);
        }
    }, [id, currentUser]); // Removed navigate from dependencies here, handle navigation explicitly

    const handleSubmit = async (formData) => {
        setIsSaving(true);
        setError(null);
        try {
            await actualizarLugar(id, formData);
            setSnackbar({ open: true, message: 'Lugar actualizado exitosamente', severity: 'success' });
            setTimeout(() => {
                navigate('/admin/lugares');
            }, 1500);
        } catch (err) {
            console.error("Error al actualizar lugar:", err);
            const errorMessage = err.message || "Error al actualizar el lugar. Por favor, intente nuevamente.";
            setError(errorMessage);
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarState(prev => ({ ...prev, open: false }));
    };

    if (authLoading || loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4, textAlign: 'center', p: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom color="error">
                    Error al cargar Lugar
                </Typography>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="outlined" onClick={() => navigate('/admin/lugares')} startIcon={<ArrowBackIcon />}>
                    Volver a la lista
                </Button>
            </Box>
        );
    }

    if (!lugar) { // Should be caught by error state if lugar is null after fetch attempt
        return (
            <Box sx={{ mt: 4, textAlign: 'center', p: 2 }}>
                <Typography variant="h6">
                    No se encontró el lugar especificado o no está activo.
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/admin/lugares')} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
                    Volver a la lista
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2, mb: 8, p: { xs: 1, sm: 2 } }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/admin/lugares')} sx={{ mr: 1 }} aria-label="Volver a administrar lugares">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                        Editar Lugar: {lugar.nombreLugar}
                    </Typography>
                </Box>
                <LugarForm
                    lugar={lugar}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                    formId="lugar-edit-form"
                // hideSubmitButton={false} // Default is false, so form shows its own button
                />
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LugarEditar;