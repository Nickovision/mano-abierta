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
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, VisibilityOff as VisibilityOffIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    obtenerLugaresConFiltros, // Using this to potentially fetch all (active and inactive) if needed later
    desactivarLugar,
    activarLugar // We'll need this if we want to reactivate
} from '../services/lugarService'; // Assuming activarLugar is added to lugarService

const LugaresAdmin = () => {
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionDialog, setActionDialog] = useState({
        open: false,
        lugar: null,
        actionType: '' // 'delete', 'deactivate', 'activate'
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const navigate = useNavigate();

    // Function to fetch places, including inactive ones for admin view
    const fetchLugaresAdmin = async () => {
        try {
            setLoading(true);
            // Modify obtenerLugaresConFiltros if necessary, or create a new service for admin
            // For now, let's assume obtenerLugaresConFiltros can fetch all if no 'activo' filter is applied
            // Or, we fetch all and then filter/sort client-side, or have a toggle for active/inactive
            const data = await obtenerLugaresConFiltros({ includeInactive: true }); // Needs service update
            setLugares(data.sort((a, b) => new Date(b.fechaActualizacion?.seconds * 1000 || 0) - new Date(a.fechaActualizacion?.seconds * 1000 || 0))); // Sort by most recently updated
            setError(null);
        } catch (error) {
            console.error("Error al obtener lugares para admin:", error);
            setError("Error al cargar los lugares. Por favor, intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLugaresAdmin();
    }, []);

    const handleAddLugar = () => {
        navigate('/admin/lugares/nuevo');
    };

    const handleEditLugar = (id) => {
        navigate(`/admin/lugares/editar/${id}`);
    };

    const openActionDialog = (lugar, actionType) => {
        setActionDialog({ open: true, lugar, actionType });
    };

    const closeActionDialog = () => {
        setActionDialog({ open: false, lugar: null, actionType: '' });
    };

    const handleConfirmAction = async () => {
        if (!actionDialog.lugar || !actionDialog.actionType) return;

        const { id, nombreLugar, nombre } = actionDialog.lugar;
        const lugarName = nombreLugar || nombre || 'este lugar';

        try {
            let message = '';
            if (actionDialog.actionType === 'deactivate') {
                await desactivarLugar(id);
                message = `Lugar "${lugarName}" desactivado correctamente.`;
                // Update local state:
                setLugares(prevLugares => prevLugares.map(l => l.id === id ? { ...l, activo: false } : l));
            } else if (actionDialog.actionType === 'activate') {
                // Ensure activarLugar service exists and works similarly to desactivarLugar
                await activarLugar(id); // You'll need to create this service function
                message = `Lugar "${lugarName}" activado correctamente.`;
                setLugares(prevLugares => prevLugares.map(l => l.id === id ? { ...l, activo: true } : l));
            }
            // Add 'delete' (physical delete) logic if needed

            setSnackbar({ open: true, message, severity: 'success' });
        } catch (err) {
            console.error(`Error al ${actionDialog.actionType} lugar:`, err);
            setSnackbar({
                open: true,
                message: `Error al ${actionDialog.actionType === 'deactivate' ? 'desactivar' : 'activar'} el lugar.`,
                severity: 'error'
            });
        } finally {
            closeActionDialog();
        }
    };


    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatDisplayDireccion = (lugar) => {
        if (lugar.direccionLugar) {
            let parts = [lugar.direccionLugar];
            if (lugar.barrio) parts.push(lugar.barrio);
            if (lugar.provincia) parts.push(lugar.provincia);
            return parts.join(', ');
        }
        // Fallback for old structure (less likely if form is updated)
        if (lugar.direccion && typeof lugar.direccion === 'object') {
            return `${lugar.direccion.calle || ''} ${lugar.direccion.numero || ''}, ${lugar.direccion.barrio || ''}`.trim();
        }
        if (typeof lugar.direccion === 'string' && lugar.direccion) return lugar.direccion;
        return 'No disponible';
    };

    const getDialogText = () => {
        if (!actionDialog.lugar) return '';
        const name = actionDialog.lugar.nombreLugar || actionDialog.lugar.nombre || 'este lugar';
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
                <Typography variant="h5" component="h1">
                    Administrar Lugares
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddLugar}
                >
                    Agregar Lugar
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Horarios</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Estado</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lugares.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No hay lugares registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lugares.map((lugar) => (
                                    <TableRow key={lugar.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{lugar.nombreLugar || lugar.nombre || 'N/A'}</TableCell>
                                        <TableCell>{lugar.tipoRecurso || lugar.tipo || 'N/A'}</TableCell>
                                        <TableCell>{formatDisplayDireccion(lugar)}</TableCell>
                                        <TableCell>{lugar.horarios || 'N/A'}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={lugar.activo ? 'Activo' : 'Inactivo'}
                                                color={lugar.activo ? 'success' : 'default'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEditLugar(lugar.id)}
                                                title="Editar"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            {lugar.activo ? (
                                                <IconButton
                                                    color="warning"
                                                    size="small"
                                                    onClick={() => openActionDialog(lugar, 'deactivate')}
                                                    title="Desactivar"
                                                >
                                                    <VisibilityOffIcon />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    color="success"
                                                    size="small"
                                                    onClick={() => openActionDialog(lugar, 'activate')}
                                                    title="Activar"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            )}
                                            {/* Consider adding a physical delete option if truly needed, e.g., for admins only */}
                                            {/* <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => openActionDialog(lugar, 'delete')}
                                                title="Eliminar Permanentemente"
                                            >
                                                <DeleteIcon />
                                            </IconButton> */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={actionDialog.open}
                onClose={closeActionDialog}
            >
                <DialogTitle>Confirmar Acción</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {getDialogText()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeActionDialog}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        color={actionDialog.actionType === 'activate' ? 'success' : 'warning'}
                        variant="contained"
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
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

export default LugaresAdmin;