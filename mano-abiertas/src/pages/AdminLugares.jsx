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

const AdminLugares = () => {
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentLugar, setCurrentLugar] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        horario: '',
        descripcion: '',
        tipo: '',
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
            try {
                const lugaresCollection = collection(db, 'lugares');
                const lugaresSnapshot = await getDocs(lugaresCollection);
                const lugaresData = lugaresSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setLugares(lugaresData);
            } catch (error) {
                console.error("Error al cargar lugares:", error);
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
    }, []);

    const handleOpenDialog = (lugar = null) => {
        if (lugar) {
            setCurrentLugar(lugar);
            setIsEditing(true);
        } else {
            setCurrentLugar({
                nombre: '',
                direccion: '',
                telefono: '',
                horario: '',
                descripcion: '',
                tipo: '',
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
        setCurrentLugar(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (isEditing) {
                // Actualizar lugar existente
                const lugarRef = doc(db, 'lugares', currentLugar.id);
                const lugarData = {
                    ...currentLugar,
                    fechaActualizacion: serverTimestamp()
                };
                delete lugarData.id; // Eliminar el ID antes de actualizar

                await updateDoc(lugarRef, lugarData);

                setSnackbar({
                    open: true,
                    message: 'Lugar actualizado correctamente',
                    severity: 'success'
                });

                // Actualizar la lista de lugares
                setLugares(prev => prev.map(lugar =>
                    lugar.id === currentLugar.id ? { id: currentLugar.id, ...lugarData } : lugar
                ));
            } else {
                // Crear nuevo lugar
                const lugarData = {
                    ...currentLugar,
                    fechaCreacion: serverTimestamp(),
                    fechaActualizacion: serverTimestamp()
                };

                const docRef = await addDoc(collection(db, 'lugares'), lugarData);

                setSnackbar({
                    open: true,
                    message: 'Lugar creado correctamente',
                    severity: 'success'
                });

                // Agregar el nuevo lugar a la lista
                setLugares(prev => [...prev, { id: docRef.id, ...lugarData }]);
            }

            handleCloseDialog();
        } catch (error) {
            console.error("Error al guardar lugar:", error);
            setSnackbar({
                open: true,
                message: `Error al ${isEditing ? 'actualizar' : 'crear'} el lugar`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este lugar?')) {
            try {
                setLoading(true);

                // Eliminación lógica (cambiar estado a inactivo)
                const lugarRef = doc(db, 'lugares', id);
                await updateDoc(lugarRef, {
                    activo: false,
                    fechaActualizacion: serverTimestamp()
                });

                setSnackbar({
                    open: true,
                    message: 'Lugar eliminado correctamente',
                    severity: 'success'
                });

                // Actualizar la lista de lugares
                setLugares(prev => prev.map(lugar =>
                    lugar.id === id ? { ...lugar, activo: false } : lugar
                ));
            } catch (error) {
                console.error("Error al eliminar lugar:", error);
                setSnackbar({
                    open: true,
                    message: 'Error al eliminar el lugar',
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
                        Administrar Lugares
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

            {loading ? (
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
                                    <TableCell>{lugar.nombre}</TableCell>
                                    <TableCell>{lugar.direccion}</TableCell>
                                    <TableCell>{lugar.tipo}</TableCell>
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
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {lugares.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No hay lugares registrados
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            name="nombre"
                            label="Nombre del lugar"
                            value={currentLugar.nombre}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />
                        <TextField
                            name="direccion"
                            label="Dirección"
                            value={currentLugar.direccion}
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
                                name="tipo"
                                value={currentLugar.tipo}
                                onChange={handleInputChange}
                                label="Tipo"
                            >
                                <MenuItem value="Comida">Comida</MenuItem>
                                <MenuItem value="Higiene">Higiene</MenuItem>
                                <MenuItem value="Dormir">Dormir</MenuItem>
                                <MenuItem value="Salud">Salud</MenuItem>
                                <MenuItem value="Educación">Educación</MenuItem>
                                <MenuItem value="Trabajo">Trabajo</MenuItem>
                                <MenuItem value="Baños">Baños</MenuItem>
                                <MenuItem value="Lavandería">Lavandería</MenuItem>
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
                        disabled={!currentLugar.nombre || !currentLugar.direccion || !currentLugar.tipo}
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

export default AdminLugares;