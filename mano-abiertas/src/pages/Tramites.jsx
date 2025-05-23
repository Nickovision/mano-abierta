import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardActionArea, // To make the whole card clickable
    CardContent,
    Grid,
    Chip,
    Divider,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Link as MuiLink,
    Paper,
    CardActions,
    Dialog, // For the modal
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton // For close button in modal
} from '@mui/material';
import {
    Description as DescriptionIcon, // For general description
    Category as CategoryIcon,       // For category
    Link as LinkIcon,               // For external links
    Source as SourceIcon,           // For source of information
    ListAlt as RequisitosIcon,      // For requirements
    InfoOutlined as InfoIcon,       // Fallback or general info
    Close as CloseIcon              // For modal close button
} from '@mui/icons-material';
import { obtenerTramitesConFiltros } from '../services/tramiteService';
import { CATEGORIAS_TRAMITE_FILTRO } from '../constants/tramitesConstants'; // Ensure this path is correct

const Tramites = () => {
    const [tramites, setTramites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        categoria: 'Todas',
    });

    // State for modal
    const [openModal, setOpenModal] = useState(false);
    const [selectedTramite, setSelectedTramite] = useState(null);

    const fetchTramites = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const serviceFiltros = {
                categoria: filtros.categoria === 'Todas' ? null : filtros.categoria,
            };
            // Remove null/undefined filters before sending to service
            Object.keys(serviceFiltros).forEach(key => serviceFiltros[key] == null && delete serviceFiltros[key]);

            const data = await obtenerTramitesConFiltros(serviceFiltros);
            setTramites(data);
        } catch (err) {
            console.error("Error al obtener trámites:", err);
            setError("Error al cargar los trámites. Por favor, intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    useEffect(() => {
        fetchTramites();
    }, [fetchTramites]);

    const handleFiltroChange = (event) => {
        const { name, value } = event.target;
        setFiltros(prevFiltros => ({
            ...prevFiltros,
            [name]: value,
        }));
    };

    const handleOpenModal = (tramite) => {
        setSelectedTramite(tramite);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedTramite(null); // Clear selected tramite
    };

    const commonSmallTextProps = {
        variant: "body2",
        color: "text.secondary",
        sx: { display: 'flex', alignItems: 'flex-start', mb: 0.8, fontSize: '0.85rem' } // Changed to flex-start for better alignment with multi-line text
    };
    const iconProps = {
        fontSize: "small",
        sx: { mr: 1, color: 'primary.main', mt: '3px' } // Added slight margin-top for better alignment with text
    };

    const scrollableTextStyle = {
        fontSize: '0.9rem',
        whiteSpace: 'pre-wrap',
        maxHeight: '80px', // Adjust as needed for card preview
        overflowY: 'auto',
        mb: 1, // Add some margin bottom
        // Styling for scrollbar (optional, for webkit browsers)
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            // background: '#f1f1f1', // Or transparent
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#ccc',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#aaa',
        }
    };

    return (
        <Box sx={{ mt: 2, mb: 8, p: { xs: 1, sm: 2 } }}>
            <Typography variant="h5" component="h1" sx={{ textAlign: 'center', mb: 2, fontSize: '1.5rem' }}>
                Información sobre Trámites
            </Typography>

            <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem' }}>Filtros</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}> {/* Adjust sm breakpoint as needed */}
                        <FormControl fullWidth size="small">
                            <InputLabel shrink sx={{ fontSize: '0.9rem' }}>Categoría</InputLabel>
                            <Select
                                name="categoria"
                                value={filtros.categoria}
                                onChange={handleFiltroChange}
                                label="Categoría"
                                displayEmpty
                                inputProps={{ style: { fontSize: '0.9rem' } }}
                                MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                                {CATEGORIAS_TRAMITE_FILTRO.map((cat) => (
                                    <MenuItem key={cat} value={cat} sx={{ fontSize: '0.9rem' }}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }} variant="filled">{error}</Alert>
            ) : tramites.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }} variant="outlined">
                    No se encontraron trámites que coincidan con los filtros seleccionados.
                </Alert>
            ) : (
                <Grid container spacing={2.5}>
                    {tramites.map((tramite) => (
                        <Grid item xs={12} sm={6} md={4} key={tramite.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 2 }}>
                                <CardActionArea onClick={() => handleOpenModal(tramite)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1, p: 2, width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                            <Typography variant="h6" component="h2" sx={{ fontSize: '1.1rem', fontWeight: 500, flexGrow: 1, mr: 1 }}>
                                                {tramite.titulo || 'Trámite sin título'}
                                            </Typography>
                                            <Chip
                                                label={tramite.categoria || 'Sin categoría'}
                                                color="secondary" // Use secondary or another color to differentiate from Lugares
                                                size="small"
                                                icon={<CategoryIcon fontSize="small" sx={{ ml: '6px !important', mr: '-2px !important' }} />}
                                                sx={{ fontSize: '0.75rem', height: '20px', flexShrink: 0 }}
                                            />
                                        </Box>

                                        <Box sx={{ ...commonSmallTextProps, mb: 1.5 }}>
                                            <DescriptionIcon {...iconProps} />
                                            <Typography component="div" sx={scrollableTextStyle}>
                                                {tramite.descripcion || 'No hay descripción disponible.'}
                                            </Typography>
                                        </Box>

                                        {tramite.requisitos && (
                                            <>
                                                <Divider sx={{ my: 1 }} light />
                                                <Box sx={{ ...commonSmallTextProps, alignItems: 'flex-start' }}>
                                                    <RequisitosIcon {...iconProps} />
                                                    <Box>
                                                        <strong>Requisitos:</strong>
                                                        <Typography component="div" sx={{ ...scrollableTextStyle, fontSize: '0.8rem', color: 'text.secondary' }}>
                                                            {tramite.requisitos}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </>
                                        )}

                                        <Divider sx={{ my: 1.5 }} light />

                                        {tramite.fuente && (
                                            <Typography {...commonSmallTextProps} sx={{ ...commonSmallTextProps.sx, fontSize: '0.75rem', color: 'text.disabled', alignItems: 'center' }}>
                                                <SourceIcon {...iconProps} sx={{ ...iconProps.sx, color: 'text.disabled' }} /> Fuente: {tramite.fuente}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </CardActionArea>
                                {tramite.enlace && (
                                    <CardActions sx={{ justifyContent: 'flex-start', p: 1.5, pt: 0 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            href={tramite.enlace.startsWith('http') ? tramite.enlace : `https://${tramite.enlace}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            startIcon={<LinkIcon />}
                                            sx={{ fontSize: '0.8rem' }}
                                            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking button
                                        >
                                            Más Información
                                        </Button>
                                    </CardActions>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Modal for Trámite Details */}
            {selectedTramite && (
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth scroll="paper">
                    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {selectedTramite.titulo}
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseModal}
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{ whiteSpace: 'pre-wrap' }}> {/* dividers add top/bottom borders */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CategoryIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" color="text.secondary">
                                Categoría: {selectedTramite.categoria || 'No especificada'}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography gutterBottom variant="h6" component="div">Descripción</Typography>
                        <Typography paragraph sx={{ color: 'text.secondary' }}>
                            {selectedTramite.descripcion || 'No hay descripción disponible.'}
                        </Typography>

                        {selectedTramite.requisitos && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography gutterBottom variant="h6" component="div">Requisitos</Typography>
                                <Typography paragraph sx={{ color: 'text.secondary' }}>
                                    {selectedTramite.requisitos}
                                </Typography>
                            </>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <SourceIcon color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Fuente: {selectedTramite.fuente || 'No especificada'}
                            </Typography>
                        </Box>

                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        {selectedTramite.enlace && (
                            <Button
                                variant="contained"
                                href={selectedTramite.enlace.startsWith('http') ? selectedTramite.enlace : `https://${selectedTramite.enlace}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<LinkIcon />}
                            >
                                Ir al sitio
                            </Button>
                        )}
                        <Button onClick={handleCloseModal} variant="outlined">
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default Tramites;