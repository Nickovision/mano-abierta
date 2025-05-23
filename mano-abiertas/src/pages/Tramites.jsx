import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
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
    CardActions
} from '@mui/material';
import {
    Description as DescriptionIcon, // For general description
    Category as CategoryIcon,       // For category
    Link as LinkIcon,               // For external links
    Source as SourceIcon,           // For source of information
    ListAlt as RequisitosIcon,      // For requirements
    InfoOutlined as InfoIcon        // Fallback or general info
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

    const commonSmallTextProps = {
        variant: "body2",
        color: "text.secondary",
        sx: { display: 'flex', alignItems: 'center', mb: 0.8, fontSize: '0.85rem' }
    };
    const iconProps = {
        fontSize: "small",
        sx: { mr: 1, color: 'primary.main' }
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
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                        <Typography variant="h6" component="h2" sx={{ fontSize: '1.1rem', fontWeight: 500, flexGrow: 1, mr: 1 }}>
                                            {tramite.titulo || 'Trámite sin título'}
                                        </Typography>
                                        <Chip
                                            label={tramite.categoria || 'Sin categoría'}
                                            color="secondary" // Use secondary or another color to differentiate from Lugares
                                            size="small"
                                            icon={<CategoryIcon fontSize="small" sx={{ ml: '6px !important', mr: '-2px !important' }} />}
                                            sx={{ fontSize: '0.75rem', height: '20px' }}
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.9rem', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>
                                        <DescriptionIcon {...iconProps} sx={{ ...iconProps.sx, verticalAlign: 'middle' }} />
                                        {tramite.descripcion || 'No hay descripción disponible.'}
                                    </Typography>

                                    {tramite.requisitos && (
                                        <>
                                            <Divider sx={{ my: 1 }} light />
                                            <Typography {...commonSmallTextProps} sx={{ ...commonSmallTextProps.sx, alignItems: 'flex-start' }}>
                                                <RequisitosIcon {...iconProps} />
                                                <Box>
                                                    <strong>Requisitos:</strong>
                                                    <Typography variant="caption" component="div" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: 'text.secondary' }}>
                                                        {tramite.requisitos}
                                                    </Typography>
                                                </Box>
                                            </Typography>
                                        </>
                                    )}

                                    <Divider sx={{ my: 1.5 }} light />

                                    {tramite.fuente && (
                                        <Typography {...commonSmallTextProps} sx={{ ...commonSmallTextProps.sx, fontSize: '0.75rem', color: 'text.disabled' }}>
                                            <SourceIcon {...iconProps} sx={{ ...iconProps.sx, color: 'text.disabled' }} /> Fuente: {tramite.fuente}
                                        </Typography>
                                    )}
                                </CardContent>
                                {tramite.enlace && (
                                    <CardActions sx={{ justifyContent: 'flex-start', p: 1.5, pt: 0, mt: 'auto' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            href={tramite.enlace.startsWith('http') ? tramite.enlace : `https://${tramite.enlace}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            startIcon={<LinkIcon />}
                                            sx={{ fontSize: '0.8rem' }}
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
        </Box>
    );
};

export default Tramites;