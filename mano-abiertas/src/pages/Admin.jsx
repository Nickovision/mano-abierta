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
    useTheme // Import useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import LugarForm from '../components/LugarForm';
import TramiteForm from '../components/TramiteForm';
import { crearLugar } from '../services/lugarService';
import { crearTramite } from '../services/tramiteService';

const Admin = () => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true); // Renamed to avoid conflict
    const navigate = useNavigate();
    const theme = useTheme(); // Initialize useTheme

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
            setLoadingAuth(false); // Use setLoadingAuth
            if (!currentUser && !loadingAuth) { // Ensure not to redirect while auth is still loading
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate, loadingAuth]); // Added loadingAuth to dependency

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
        if (isSubmitting) return;
        setOpenLugarModal(false);
    };

    const handleOpenTramiteModal = () => setOpenTramiteModal(true);
    const handleCloseTramiteModal = () => {
        if (isSubmitting) return;
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

    if (loadingAuth) { // Use loadingAuth
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Box sx={{ mt: 2, mb: 8, p: { xs: 1, sm: 2 } }}> {/* Added responsive padding */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    Panel de Administración
                </Typography>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </Button>
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
                Bienvenido, {user.email}.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4, justifyContent: 'center' }}> {/* Responsive flex direction */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenLugarModal}
                    size="large"
                    fullWidth // Make buttons full width on small screens
                    sx={{ flexGrow: { sm: 1 } }} // Allow buttons to grow on larger screens
                >
                    Cargar Nuevo Lugar
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenTramiteModal}
                    size="large"
                    fullWidth // Make buttons full width on small screens
                    sx={{ flexGrow: { sm: 1 } }} // Allow buttons to grow on larger screens
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
                                Edita, activa/desactiva y gestiona los lugares de ayuda.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
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
                                Edita, activa/desactiva y gestiona la información sobre trámites.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                            <Button
                                size="small"
                                color="primary"
                                variant="outlined"
                                onClick={() => navigate('/admin/tramites')}
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
                <DialogContent sx={{ pt: '10px !important' }}> {/* Consistent padding */}
                    <LugarForm
                        onSubmit={handleLugarSubmit}
                        isLoading={isSubmitting}
                        hideSubmitButton={true}
                        formId="lugar-modal-form"
                        isModalVersion={true}
                    />
                </DialogContent>
                <DialogActions sx={{ p: theme.spacing(2, 3) }}> {/* Consistent padding */}
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
                <DialogTitle sx={{ pb: 1, fontSize: '1.25rem' }}>Agregar Nuevo Trámite</DialogTitle> {/* Consistent title styling */}
                <DialogContent sx={{ pt: '10px !important' }}> {/* Consistent padding */}
                    <TramiteForm
                        onSubmit={handleTramiteSubmit}
                        isLoading={isSubmitting}
                        formId="tramite-modal-form"
                        hideSubmitButton={true} // Hide internal submit button
                        isModalVersion={true} // Apply modal styling
                    />
                </DialogContent>
                <DialogActions sx={{ p: theme.spacing(2, 3) }}> {/* Consistent padding */}
                    <Button onClick={handleCloseTramiteModal} disabled={isSubmitting}>Cancelar</Button>
                    <Button
                        type="submit"
                        form="tramite-modal-form" // Links to the TramiteForm
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Crear Trámite'}
                    </Button>
                </DialogActions>
            </Dialog>

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
                    variant="filled" // Consistent variant
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Admin;