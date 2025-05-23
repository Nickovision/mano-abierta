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
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const AdminTramites = () => {
    const [tramites, setTramites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentTramite, setCurrentTramite] = useState({
        titulo: '',
        descripcion: '',
        requisitos: '',
        categoria: '',
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

    // Cargar trámites
    useEffect(() => {
        const fetchTramites = async () => {
            try {
                const tramitesCollection = collection(db, 'tramites');
                const tramitesSnapshot = await getDocs(tramitesCollection);
                const tramitesData = tramitesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTramites(tramitesData);
            } catch (error) {
                console.error("Error al cargar trámites:", error);
                setSnackbar({
                    open: true,
                    message: 'Error al cargar los trámites',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTramites();
    }, []);

    const handleOpenDialog = (tramite = null) => {
        if (tramite) {
            setCurrentTramite(tramite);
            setIsEditing(true);
        } else {
            setCurrentTramite({
                titulo: '',
                descripcion: '',
                requisitos: '',
                categoria: '',
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
        const { name, value } = e.target;
        setCurrentTramite(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (isEditing) {
                // Actualizar trámite existente
                const tramiteRef = doc(db, 'tramites', currentTramite.id);
                const tramiteData = {
                    ...currentTramite,
                    fechaActualizacion: serverTimestamp()
                };
                delete tramiteData.id; // Eliminar el ID antes de actualizar

                await updateDoc(tramiteRef, tramiteData);

                setSnackbar({
                    open: true,
                    message: 'Trámite actualizado correctamente',
                    severity: 'success'
                });

                // Actualizar la lista de trámites
                setTramites(prev => prev.map(tramite =>
                    tramite.id === currentTramite.id ? { id: currentTramite.id, ...tramiteData } : tramite
                ));
            } else {
                // Crear nuevo trámite
                const tramiteData = {
                    ...currentTramite,
                    fechaCreacion: serverTimestamp(),
                    fechaActualizacion: serverTimestamp()
                };

                const docRef = await addDoc(collection(db, 'tramites'), tramiteData);

                setSnackbar({
                    open: true,
                    message: 'Trámite creado correctamente',
                    severity: 'success'
                });

                // Agregar el nuevo trámite a la lista
                setTramites(prev => [...prev, { id: docRef.id, ...tramiteData }]);
            }

            handleCloseDialog();
        } catch (error) {
            console.error("Error al guardar trámite:", error);
            setSnackbar({
                open: true,
                message: `Error al ${isEditing ? 'actualizar' : 'crear'} el trámite`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este trámite?')) {
            try {
                setLoading(true);

                // Eliminación lógica (cambiar estado a inactivo)
                const tramiteRef = doc(db, 'tramites', id);
                await updateDoc(tramiteRef, {
                    activo: false,
                    fechaActualizacion: serverTimestamp()
                });

                setSnackbar({
                    open: true,
                    message: 'Trámite eliminado correctamente',
                    severity: 'success'
                });

                // Actualizar la lista de trámites
                setTramites(prev => prev.map(tramite =>
                    tramite.id === id ? { ...tramite, activo: false } : tramite
                ));
            } catch (error) {
                console.error("Error al eliminar trámite:", error);
                setSnackbar({
                    open: true,
                    message: 'Error al eliminar el trámite',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
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
                        Administrar Trámites
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                >
                    Agregar Nuevo Trámite
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Título</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tramites.map((tramite) => (
                                <TableRow key={tramite.id}>
                                    <TableCell>{tramite.titulo}</TableCell>
                                    <TableCell>{tramite.categoria}</TableCell>
                                    <TableCell>
                                        {tramite.activo ? 'Activo' : 'Inactivo'}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(tramite)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(tramite.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tramites.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No hay trámites registrados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Diálogo para crear/editar trámite */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {isEditing ? 'Editar Trámite' : 'Agregar Nuevo Trámite'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            name="titulo"
                            label="Título del trámite"
                            value={currentTramite.titulo}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Categoría</InputLabel>
                            <Select
                                name="categoria"
                                value={currentTramite.categoria}
                                onChange={handleInputChange}
                                label="Categoría"
                            >
                                <MenuItem value="Documentación">Documentación</MenuItem>
                                <MenuItem value="Salud">Salud</MenuItem>
                                <MenuItem value="Educación">Educación</MenuItem>
                                <MenuItem value="Trabajo">Trabajo</MenuItem>
                                <MenuItem value="Vivienda">Vivienda</MenuItem>
                                <MenuItem value="Legal">Legal</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            name="descripcion"
                            label="Descripción"
                            value={currentTramite.descripcion}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                            required
                        />
                        <TextField
                            name="requisitos"
                            label="Requisitos"
                            value={currentTramite.requisitos}
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
                                    value={currentTramite.activo}
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
                        disabled={!currentTramite.titulo || !currentTramite.descripcion || !currentTramite.categoria}
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
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminTramites;