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
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { TIPOS_RECURSO } from '../constants/lugaresConstants';

const AdminLugares = () => {
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentLugar, setCurrentLugar] = useState({
        nombreLugar: '',
        direccionLugar: '',
        telefono: '',
        horario: '',
        descripcion: '',
        tipoRecurso: '',
        activo: true
    });
    const [isEditing, setIsEditing] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const navigate = useNavigate();

    // Verificar autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Cargar lugares
    useEffect(() => {
        const fetchLugares = async () => {
            setLoading(true); // Ensure loading is true at the start
            try {
                const lugaresCollectionRef = collection(db, 'lugares');
                console.log('[AdminLugares] Fetching all documents from "lugares" collection...');
                const lugaresSnapshot = await getDocs(lugaresCollectionRef);
                console.log(`[AdminLugares] Firestore snapshot size: ${lugaresSnapshot.size}`);

                const lugaresData = lugaresSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (lugaresSnapshot.size > 0 && lugaresData.length === 0) {
                    console.warn('[AdminLugares] Firestore snapshot had documents, but lugaresData is empty. Check mapping.');
                } else if (lugaresSnapshot.size === 0) {
                    console.log('[AdminLugares] No documents found in "lugares" collection.');
                } else {
                    console.log('[AdminLugares] Fetched lugaresData:', lugaresData);
                }

                setLugares(lugaresData);
            } catch (error) {
                console.error("[AdminLugares] Error al cargar lugares:", error);
                setSnackbar({
                    open: true,
                    message: 'Error al cargar los lugares',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchLugares();
    }, []); // Empty dependency array means this runs once on mount

    const handleOpenDialog = (lugar = null) => {
        if (lugar) {
            setCurrentLugar({
                id: lugar.id,
                nombreLugar: lugar.nombreLugar || '',
                direccionLugar: lugar.direccionLugar || '',
                telefono: lugar.telefono || '',
                horario: lugar.horarios || lugar.horario || '',
                descripcion: lugar.informacionAdicional || lugar.descripcion || '',
                tipoRecurso: lugar.tipoRecurso || '',
                activo: lugar.activo !== undefined ? lugar.activo : true
            });
            setIsEditing(true);
        } else {
            setCurrentLugar({
                nombreLugar: '',
                direccionLugar: '',
                telefono: '',
                horario: '',
                descripcion: '',
                tipoRecurso: '',
                activo: true
            });
            setIsEditing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentLugar(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        const originalLoadingState = loading;
        setLoading(true); // Indicate form submission is in progress

        try {
            const lugarDataToSave = {
                nombreLugar: currentLugar.nombreLugar,
                direccionLugar: currentLugar.direccionLugar,
                telefono: currentLugar.telefono,
                horarios: currentLugar.horario,
                informacionAdicional: currentLugar.descripcion,
                tipoRecurso: currentLugar.tipoRecurso,
                activo: currentLugar.activo,
                fechaActualizacion: serverTimestamp()
            };

            if (isEditing) {
                const lugarRef = doc(db, 'lugares', currentLugar.id);
                await updateDoc(lugarRef, lugarDataToSave);
                setSnackbar({ open: true, message: 'Lugar actualizado correctamente', severity: 'success' });
                setLugares(prev => prev.map(l => l.id === currentLugar.id ? { id: currentLugar.id, ...lugarDataToSave } : l));
            } else {
                const newLugarData = { ...lugarDataToSave, fechaCreacion: serverTimestamp() };
                const docRef = await addDoc(collection(db, 'lugares'), newLugarData);
                setSnackbar({ open: true, message: 'Lugar creado correctamente', severity: 'success' });
                setLugares(prev => [...prev, { id: docRef.id, ...newLugarData }]);
            }
            handleCloseDialog();
        } catch (error) {
            console.error("Error al guardar lugar:", error);
            setSnackbar({ open: true, message: `Error al ${isEditing ? 'actualizar' : 'crear'} el lugar`, severity: 'error' });
        } finally {
            setLoading(originalLoadingState); // Restore original page loading state or set to false if appropriate
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas marcar este lugar como inactivo?')) {
            const originalLoadingState = loading;
            setLoading(true);
            try {
                const lugarRef = doc(db, 'lugares', id);
                await updateDoc(lugarRef, { activo: false, fechaActualizacion: serverTimestamp() });
                setSnackbar({ open: true, message: 'Lugar marcado como inactivo correctamente', severity: 'success' });
                setLugares(prev => prev.map(lugar => lugar.id === id ? { ...lugar, activo: false } : lugar));
            } catch (error) {
                console.error("Error al marcar como inactivo:", error);
                setSnackbar({ open: true, message: 'Error al marcar el lugar como inactivo', severity: 'error' });
            } finally {
                setLoading(originalLoadingState);
            }
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ mt: 2, mb: 8, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                        Administrar Lugares (Simple)
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                >
                    Agregar Nuevo Lugar
                </Button>
            </Box>

            {loading && !openDialog ? ( // Show main loading only if not interacting with dialog
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Dirección</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lugares.map((lugar) => (
                                <TableRow key={lugar.id}>
                                    <TableCell>{lugar.nombreLugar || lugar.nombre || 'N/A'}</TableCell>
                                    <TableCell>{lugar.direccionLugar || lugar.direccion || 'N/A'}</TableCell>
                                    <TableCell>{lugar.tipoRecurso || lugar.tipo || 'N/A'}</TableCell>
                                    <TableCell>
                                        {lugar.activo ? 'Activo' : 'Inactivo'}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(lugar)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(lugar.id)}
                                            title={lugar.activo ? "Marcar como Inactivo" : "Ya está Inactivo"}
                                            disabled={!lugar.activo}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {lugares.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No hay lugares registrados o que coincidan con los filtros.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Diálogo para crear/editar lugar */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {isEditing ? 'Editar Lugar' : 'Agregar Nuevo Lugar'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            name="nombreLugar"
                            label="Nombre del lugar"
                            value={currentLugar.nombreLugar}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />
                        <TextField
                            name="direccionLugar"
                            label="Dirección"
                            value={currentLugar.direccionLugar}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />
                        <TextField
                            name="telefono"
                            label="Teléfono"
                            value={currentLugar.telefono}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            name="horario"
                            label="Horario"
                            value={currentLugar.horario}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                name="tipoRecurso"
                                value={currentLugar.tipoRecurso}
                                onChange={handleInputChange}
                                label="Tipo"
                            >
                                {TIPOS_RECURSO.map((tipo) => (
                                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            name="descripcion"
                            label="Descripción"
                            value={currentLugar.descripcion}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                        />
                        {isEditing && (
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    name="activo"
                                    value={currentLugar.activo}
                                    onChange={handleInputChange}
                                    label="Estado"
                                >
                                    <MenuItem value={true}>Activo</MenuItem>
                                    <MenuItem value={false}>Inactivo</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!currentLugar.nombreLugar || !currentLugar.direccionLugar || !currentLugar.tipoRecurso}
                    >
                        {isEditing ? 'Actualizar' : 'Crear'}
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
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminLugares;