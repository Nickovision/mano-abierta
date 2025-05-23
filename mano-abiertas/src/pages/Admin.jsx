import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Alert,
    useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import LugarForm from '../components/LugarForm'; // Import LugarForm
import TramiteForm from '../components/TramiteForm'; // Import TramiteForm
import { crearLugar } from '../services/lugarService'; // Import service function
import { crearTramite } from '../services/tramiteService'; // Import service function

const Admin = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();

    const [openLugarModal, setOpenLugarModal] = useState(false);
    const [openTramiteModal, setOpenTramiteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (!currentUser) {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setSnackbar({ open: true, message: 'Error al cerrar sesión', severity: 'error' });
        }
    };

    const handleOpenLugarModal = () => setOpenLugarModal(true);
    const handleCloseLugarModal = () => {
        if (isSubmitting) return; // Prevent closing while submitting
        setOpenLugarModal(false);
    };

    const handleOpenTramiteModal = () => setOpenTramiteModal(true);
    const handleCloseTramiteModal = () => {
        if (isSubmitting) return; // Prevent closing while submitting
        setOpenTramiteModal(false);
    };

    const handleLugarSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await crearLugar(formData);
            setSnackbar({ open: true, message: 'Lugar creado exitosamente', severity: 'success' });
            handleCloseLugarModal();
        } catch (error) {
            console.error("Error al crear lugar:", error);
            setSnackbar({ open: true, message: 'Error al crear el lugar', severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTramiteSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await crearTramite(formData);
            setSnackbar({ open: true, message: 'Trámite creado exitosamente', severity: 'success' });
            handleCloseTramiteModal();
        } catch (error) {
            console.error("Error al crear trámite:", error);
            setSnackbar({ open: true, message: 'Error al crear el trámite', severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null; // El useEffect redirigirá a /login
    }

    return (
        <Box sx={{ mt: 2, mb: 8, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    Panel de Administración
                </Typography>
                <Button
                    variant="outlined"
                    color="secondary" // Changed color for distinction
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </Button>
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
                Bienvenido, {user.email}.
            </Typography>

            {/* Botones para cargar nuevos items */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenLugarModal}
                    size="large"
                >
                    Cargar Nuevo Lugar
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenTramiteModal}
                    size="large"
                >
                    Cargar Nuevo Trámite
                </Button>
            </Box>

            <Typography variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
                Gestionar existentes:
            </Typography>

            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={5}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                                Administrar Lugares
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Edita, elimina y gestiona los lugares de ayuda disponibles.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center' }}>
                            <Button
                                size="small"
                                color="primary"
                                variant="outlined"
                                onClick={() => navigate('/admin/lugares')}
                            >
                                Ir a Lugares
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={5}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                                Administrar Trámites
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Edita, elimina y gestiona la información sobre trámites.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center' }}>
                            <Button
                                size="small"
                                color="primary"
                                variant="outlined"
                                onClick={() => navigate('/admin/tramites')}
                            // disabled // Habilitar cuando la gestión de trámites esté completa
                            >
                                Ir a Trámites
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            {/* Modal para Nuevo Lugar */}
            <Dialog open={openLugarModal} onClose={handleCloseLugarModal} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pb: 1, fontSize: '1.25rem' }}>Agregar Nuevo Lugar</DialogTitle>
                <DialogContent sx={{ pt: '10px !important' }}>
                    <LugarForm
                        onSubmit={handleLugarSubmit}
                        isLoading={isSubmitting}
                        hideSubmitButton={true}
                        formId="lugar-modal-form"
                        isModalVersion={true}
                    />
                </DialogContent>
                <DialogActions sx={{ p: theme.spacing(2, 3) }}>
                    <Button onClick={handleCloseLugarModal} disabled={isSubmitting}>Cancelar</Button>
                    <Button
                        type="submit"
                        form="lugar-modal-form"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Crear Lugar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal para Nuevo Trámite */}
            <Dialog open={openTramiteModal} onClose={handleCloseTramiteModal} maxWidth="md" fullWidth>
                <DialogTitle>Agregar Nuevo Trámite</DialogTitle>
                <DialogContent>
                    <TramiteForm
                        onSubmit={handleTramiteSubmit}
                        isLoading={isSubmitting}
                        formId="tramite-modal-form"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseTramiteModal} disabled={isSubmitting}>Cancelar</Button>
                    <Button
                        type="submit"
                        form="tramite-modal-form"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Crear Trámite'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Admin;