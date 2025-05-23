import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
    IconButton,
    Snackbar,
    Alert,
    useTheme
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon, VisibilityOff as VisibilityOffIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'; // Service functions will handle this
// import { db } from '../firebase/config'; // Service functions will handle this
import { auth } from '../firebase/config'; // Still needed for auth check
import { onAuthStateChanged } from 'firebase/auth';

import LugarForm from '../components/LugarForm'; // Import LugarForm
import {
    obtenerLugaresConFiltros, // To fetch all places including inactive
    crearLugar,
    actualizarLugar,
    desactivarLugar,
    activarLugar
} from '../services/lugarService'; // Import service functions

const AdminLugares = () => {
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(true); // Page loading
    const [openDialog, setOpenDialog] = useState(false);

    // This state will hold the lugar object to be passed to LugarForm
    const [lugarDataForForm, setLugarDataForForm] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Form submission loading
    const [actionDialog, setActionDialog] = useState({ open: false, lugarId: null, actionType: '' }); // For activate/deactivate

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchLugaresAdmin = async () => {
        setLoading(true);
        try {
            // Fetch all places, including inactive ones
            const data = await obtenerLugaresConFiltros({ includeInactive: true });
            // Sort by most recently updated, or by creation date as a fallback
            setLugares(data.sort((a, b) =>
                new Date(b.fechaActualizacion?.seconds * 1000 || b.fechaCreacion?.seconds * 1000 || 0) -
                new Date(a.fechaActualizacion?.seconds * 1000 || a.fechaCreacion?.seconds * 1000 || 0)
            ));
            console.log('[AdminLugares] Fetched lugaresData:', data);
        } catch (error) {
            console.error("[AdminLugares] Error al cargar lugares:", error);
            setSnackbar({ open: true, message: 'Error al cargar los lugares', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLugaresAdmin();
    }, []);

    const handleOpenFormDialog = (lugar = null) => {
        if (lugar) {
            // For editing, pass the existing lugar data to the form
            // LugarForm's internal useEffect will map this data correctly
            setLugarDataForForm(lugar);
            setIsEditing(true);
        } else {
            // For adding, LugarForm will use its own initialFormData if 'lugar' prop is null
            setLugarDataForForm(null);
            setIsEditing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseFormDialog = () => {
        if (isSubmittingForm) return; // Prevent closing while submitting
        setOpenDialog(false);
        setLugarDataForForm(null); // Clear data when dialog closes
    };

    const handleLugarFormSubmit = async (formData) => {
        setIsSubmittingForm(true);
        try {
            if (isEditing && lugarDataForForm && lugarDataForForm.id) {
                await actualizarLugar(lugarDataForForm.id, formData);
                setSnackbar({ open: true, message: 'Lugar actualizado correctamente', severity: 'success' });
            } else {
                await crearLugar(formData);
                setSnackbar({ open: true, message: 'Lugar creado correctamente', severity: 'success' });
            }
            fetchLugaresAdmin(); // Re-fetch all places to update the table
            handleCloseFormDialog();
        } catch (error) {
            console.error("Error al guardar lugar:", error);
            setSnackbar({ open: true, message: `Error al ${isEditing ? 'actualizar' : 'crear'} el lugar`, severity: 'error' });
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const openActionConfirmDialog = (lugarId, type) => {
        setActionDialog({ open: true, lugarId, actionType: type });
    };

    const closeActionConfirmDialog = () => {
        setActionDialog({ open: false, lugarId: null, actionType: '' });
    };

    const handleConfirmAction = async () => {
        if (!actionDialog.lugarId || !actionDialog.actionType) return;

        const { lugarId, actionType } = actionDialog;
        const lugarName = lugares.find(l => l.id === lugarId)?.nombreLugar || 'este lugar';

        setIsSubmittingForm(true); // Use general submitting state for actions too
        try {
            let message = '';
            if (actionType === 'deactivate') {
                await desactivarLugar(lugarId);
                message = `Lugar "${lugarName}" desactivado correctamente.`;
            } else if (actionType === 'activate') {
                await activarLugar(lugarId);
                message = `Lugar "${lugarName}" activado correctamente.`;
            }
            setSnackbar({ open: true, message, severity: 'success' });
            fetchLugaresAdmin(); // Re-fetch to update status in table
        } catch (err) {
            console.error(`Error al ${actionType} lugar:`, err);
            setSnackbar({ open: true, message: `Error al ${actionType === 'deactivate' ? 'desactivar' : 'activar'} el lugar.`, severity: 'error' });
        } finally {
            setIsSubmittingForm(false);
            closeActionConfirmDialog();
        }
    };


    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const getActionDialogText = () => {
        if (!actionDialog.lugarId) return '';
        const name = lugares.find(l => l.id === actionDialog.lugarId)?.nombreLugar || 'este lugar';
        if (actionDialog.actionType === 'deactivate') {
            return `¿Estás seguro de que deseas desactivar el lugar "${name}"? No se mostrará públicamente.`;
        }
        if (actionDialog.actionType === 'activate') {
            return `¿Estás seguro de que deseas activar el lugar "${name}"? Se mostrará públicamente.`;
        }
        return '¿Estás seguro?';
    };


    return (
        <Box sx={{ mt: 2, mb: 8, p: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate('/admin')} sx={{ mr: 1 }} aria-label="Volver al panel de admin">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                        Administrar Lugares
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenFormDialog()} // Opens the comprehensive form
                >
                    Agregar Nuevo Lugar
                </Button>
            </Box>

            {loading && !openDialog && !actionDialog.open ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Estado</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lugares.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No hay lugares registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lugares.map((lugar) => (
                                    <TableRow key={lugar.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{lugar.nombreLugar || 'N/A'}</TableCell>
                                        <TableCell>{lugar.tipoRecurso || 'N/A'}</TableCell>
                                        <TableCell>
                                            {lugar.direccionLugar}
                                            {lugar.barrio && `, ${lugar.barrio}`}
                                            {lugar.provincia && ` (${lugar.provincia})`}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: lugar.activo ? 'success.main' : 'text.secondary',
                                                    fontWeight: 'medium',
                                                    border: 1,
                                                    borderColor: lugar.activo ? 'success.light' : 'grey.400',
                                                    borderRadius: '4px',
                                                    px: 1, py: 0.5
                                                }}
                                            >
                                                {lugar.activo ? 'Activo' : 'Inactivo'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleOpenFormDialog(lugar)}
                                                title="Editar Lugar"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            {lugar.activo ? (
                                                <IconButton
                                                    color="warning"
                                                    size="small"
                                                    onClick={() => openActionConfirmDialog(lugar.id, 'deactivate')}
                                                    title="Desactivar Lugar"
                                                >
                                                    <VisibilityOffIcon />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    color="success"
                                                    size="small"
                                                    onClick={() => openActionConfirmDialog(lugar.id, 'activate')}
                                                    title="Activar Lugar"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog for Adding/Editing Lugar using LugarForm */}
            <Dialog open={openDialog} onClose={handleCloseFormDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pb: 1, fontSize: '1.25rem' }}>
                    {isEditing ? 'Editar Lugar' : 'Agregar Nuevo Lugar'}
                </DialogTitle>
                <DialogContent sx={{ pt: '10px !important' }}>
                    {/* Use a key to force re-mount and re-initialization of LugarForm when lugarDataForForm changes significantly (e.g. new vs edit) */}
                    <LugarForm
                        key={lugarDataForForm ? lugarDataForForm.id : 'new-lugar'}
                        lugar={lugarDataForForm}
                        onSubmit={handleLugarFormSubmit}
                        isLoading={isSubmittingForm}
                        formId="admin-lugar-dialog-form" // Unique ID for the form
                        hideSubmitButton={true} // Dialog will have its own submit button
                        isModalVersion={true} // Styles for modal
                    />
                </DialogContent>
                <DialogActions sx={{ p: theme.spacing(2, 3) }}>
                    <Button onClick={handleCloseFormDialog} disabled={isSubmittingForm}>Cancelar</Button>
                    <Button
                        type="submit"
                        form="admin-lugar-dialog-form" // Connects to the LugarForm
                        variant="contained"
                        color="primary"
                        disabled={isSubmittingForm}
                    >
                        {isSubmittingForm ? <CircularProgress size={24} /> : (isEditing ? 'Actualizar Lugar' : 'Crear Lugar')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog for Activate/Deactivate */}
            <Dialog
                open={actionDialog.open}
                onClose={closeActionConfirmDialog}
            >
                <DialogTitle>Confirmar Acción</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {getActionDialogText()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeActionConfirmDialog} disabled={isSubmittingForm}>Cancelar</Button>
                    <Button
                        onClick={handleConfirmAction}
                        color={actionDialog.actionType === 'activate' ? 'success' : 'warning'}
                        variant="contained"
                        disabled={isSubmittingForm}
                    >
                        {isSubmittingForm ? <CircularProgress size={24} /> : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminLugares;