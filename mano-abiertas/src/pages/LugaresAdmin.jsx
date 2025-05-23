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
    CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    obtenerLugaresActivos,
    eliminarLugarFisico
} from '../services/lugarService';
import { useAuth } from '../contexts/AuthContext';
import {
    TIPOS_RECURSO,
    PROVINCIAS_ARGENTINAS,
    BARRIOS_CABA,
    PARTIDOS_AMBA_BSAS,
    A_QUIEN_AYUDA_OPCIONES // If needed directly
} from '../constants/lugaresConstants';

const LugaresAdmin = () => {
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [lugarToDelete, setLugarToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/login');
        }
    }, [currentUser, authLoading, navigate]);

    useEffect(() => {
        if (currentUser) {
            fetchLugares();
        }
    }, [currentUser]);

    const fetchLugares = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await obtenerLugaresActivos();
            setLugares(data);
        } catch (err) {
            console.error("Error al obtener lugares:", err);
            setError("Error al cargar los lugares. Por favor, intenta nuevamente.");
            setSnackbar({ open: true, message: 'Error al cargar los lugares', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddLugarRedirect = () => {
        navigate('/admin'); // Navigate to main admin page for modal
    };

    const handleEditLugar = (id) => {
        navigate(`/admin/lugares/editar/${id}`);
    };

    const handleDeleteClick = (lugar) => {
        setLugarToDelete(lugar);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!lugarToDelete || !lugarToDelete.id) return;
        setLoading(true); // Show loading indicator on button
        try {
            await eliminarLugarFisico(lugarToDelete.id);
            setLugares(prevLugares => prevLugares.filter(lugar => lugar.id !== lugarToDelete.id));
            setSnackbar({
                open: true,
                message: 'Lugar eliminado permanentemente',
                severity: 'success'
            });
        } catch (err) {
            console.error("Error al eliminar lugar:", err);
            setSnackbar({
                open: true,
                message: 'Error al eliminar el lugar',
                severity: 'error'
            });
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setLugarToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setLugarToDelete(null);
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (authLoading || (!currentUser && !authLoading)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2, mb: 8, p: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate('/admin')} sx={{ mr: 1 }} aria-label="Volver al panel de administración">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                        Administrar Lugares
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddLugarRedirect}
                >
                    Cargar Nuevo Lugar
                </Button>
            </Box>

            {loading && !lugares.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }} variant="filled">{error}</Alert>
            ) : (
                <TableContainer component={Paper} elevation={2}>
                    <Table stickyHeader aria-label="tabla de lugares activos">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Provincia</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Horarios</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lugares.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        No hay lugares activos registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lugares.map((lugar) => (
                                    <TableRow key={lugar.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{lugar.nombreLugar || 'N/A'}</TableCell>
                                        <TableCell>{lugar.tipoRecurso || 'N/A'}</TableCell>
                                        <TableCell>{lugar.direccionLugar || 'N/A'}</TableCell>
                                        <TableCell>{lugar.provincia || 'N/A'}</TableCell>
                                        <TableCell>{lugar.horarios || 'N/A'}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleEditLugar(lugar.id)}
                                                title="Editar Lugar"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(lugar)}
                                                title="Eliminar Lugar Permanentemente"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title-permanent-delete"
                aria-describedby="alert-dialog-description-permanent-delete"
            >
                <DialogTitle id="alert-dialog-title-permanent-delete">Confirmar eliminación permanente</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-permanent-delete">
                        ¿Estás seguro de que deseas eliminar el lugar "{lugarToDelete?.nombreLugar}"?
                        Esta acción **eliminará el registro de la base de datos** y no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus disabled={loading}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Eliminar Permanentemente"}
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