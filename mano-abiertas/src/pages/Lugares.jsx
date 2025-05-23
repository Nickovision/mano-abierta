import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
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
    Paper
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as WebIcon,
    AccessTime as TimeIcon,
    LocationOn as LocationOnIcon, // Crucial import
    InfoOutlined as InfoIcon,
    PeopleAlt as PeopleAltIcon,
    VerifiedUser as VerifiedUserIcon,
    Source as SourceIcon
} from '@mui/icons-material';
import { obtenerLugaresConFiltros } from '../services/lugarService';
import {
    TIPOS_RECURSO,
    PROVINCIAS_ARGENTINAS,
    BARRIOS_CABA,
    PARTIDOS_AMBA_BSAS,
    A_QUIEN_AYUDA_OPCIONES // Ensure this is exported from your constants file
} from '../constants/lugaresConstants'; // Adjust path if necessary

// Define filter options using imported constants
const TIPOS_RECURSO_FILTRO = ['Todos', ...TIPOS_RECURSO.filter(t => t && t !== 'Otro')];
const PROVINCIAS_FILTRO = ['Todas', ...PROVINCIAS_ARGENTINAS.filter(p => p)];

const Lugares = () => {
    const location = useLocation(); // Get location object
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filtros, setFiltros] = useState(() => {
        const params = new URLSearchParams(location.search);
        const tipoRecursoFromQuery = params.get('tipoRecurso');
        return {
            tipoRecurso: tipoRecursoFromQuery && TIPOS_RECURSO_FILTRO.includes(tipoRecursoFromQuery) ? tipoRecursoFromQuery : 'Todos',
            provincia: 'Todas',
            barrio: 'Todos'
        };
    });
    const [barriosDisponiblesFiltro, setBarriosDisponiblesFiltro] = useState([]);

    // Effect to update available barrios when provincia filter changes
    useEffect(() => {
        if (filtros.provincia === 'Ciudad Autónoma de Buenos Aires') {
            setBarriosDisponiblesFiltro(['Todos', ...BARRIOS_CABA]);
        } else if (filtros.provincia === 'Buenos Aires') {
            setBarriosDisponiblesFiltro(['Todos', ...PARTIDOS_AMBA_BSAS]);
        } else {
            setBarriosDisponiblesFiltro([]); // Ensure it's an empty array for other provinces or "Todas"
        }
    }, [filtros.provincia]); // Only depends on filtros.provincia

    const fetchLugares = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const serviceFiltros = {
                tipoRecurso: filtros.tipoRecurso === 'Todos' ? null : filtros.tipoRecurso,
                provincia: filtros.provincia === 'Todas' ? null : filtros.provincia, // Corrected from 'Todos' to 'Todas'
                barrio: filtros.barrio === 'Todos' || !barriosDisponiblesFiltro.includes(filtros.barrio) ? null : filtros.barrio,
            };
            Object.keys(serviceFiltros).forEach(key => serviceFiltros[key] == null && delete serviceFiltros[key]);

            const data = await obtenerLugaresConFiltros(serviceFiltros);
            setLugares(data);
        } catch (err) {
            console.error("Error al obtener lugares:", err);
            setError("Error al cargar los lugares. Por favor, intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    }, [filtros, barriosDisponiblesFiltro]); // Depends on the actual filter values

    // Effect to fetch places when fetchLugares (itself dependent on filters) changes
    useEffect(() => {
        fetchLugares();
    }, [fetchLugares]); // Depends on the memoized fetchLugares function

    const handleFiltroChange = (event) => {
        const { name, value } = event.target;
        setFiltros(prevFiltros => {
            const newFiltros = { ...prevFiltros, [name]: value };
            if (name === 'provincia') {
                newFiltros.barrio = 'Todos'; // Reset barrio when provincia changes
                // The logic to update barriosDisponiblesFiltro is now handled by its own useEffect
            }
            return newFiltros;
        });
    };

    const formatAQuienAyuda = (aQuienAyudaObj) => {
        if (!aQuienAyudaObj || typeof aQuienAyudaObj !== 'object' || Object.keys(aQuienAyudaObj).length === 0) return 'No especificado';
        if (aQuienAyudaObj.todos) return 'Todos';
        const ayudados = Object.entries(aQuienAyudaObj)
            .filter(([key, value]) => value && key !== 'todos')
            .map(([key]) => {
                const option = A_QUIEN_AYUDA_OPCIONES.find(opt => opt.id === key);
                return option ? option.label : key.charAt(0).toUpperCase() + key.slice(1);
            });
        return ayudados.length > 0 ? ayudados.join(', ') : 'No especificado';
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
                Lugares de Ayuda
            </Typography>

            <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem' }}>Filtros</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel shrink sx={{ fontSize: '0.9rem' }}>Tipo de Recurso</InputLabel>
                            <Select
                                name="tipoRecurso"
                                value={filtros.tipoRecurso}
                                onChange={handleFiltroChange}
                                label="Tipo de Recurso"
                                displayEmpty
                                inputProps={{ style: { fontSize: '0.9rem' } }}
                                MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                                {TIPOS_RECURSO_FILTRO.map((tipo) => (
                                    <MenuItem key={tipo} value={tipo} sx={{ fontSize: '0.9rem' }}>{tipo}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel shrink sx={{ fontSize: '0.9rem' }}>Provincia</InputLabel>
                            <Select
                                name="provincia"
                                value={filtros.provincia}
                                onChange={handleFiltroChange}
                                label="Provincia"
                                displayEmpty
                                inputProps={{ style: { fontSize: '0.9rem' } }}
                                MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                                {PROVINCIAS_FILTRO.map((prov) => (
                                    <MenuItem key={prov} value={prov} sx={{ fontSize: '0.9rem' }}>{prov}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {(filtros.provincia === 'Ciudad Autónoma de Buenos Aires' || filtros.provincia === 'Buenos Aires') && barriosDisponiblesFiltro.length > 0 && (
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel shrink sx={{ fontSize: '0.9rem' }}>
                                    {filtros.provincia === 'Ciudad Autónoma de Buenos Aires' ? 'Barrio/Comuna' : 'Partido/Localidad'}
                                </InputLabel>
                                <Select
                                    name="barrio"
                                    value={filtros.barrio}
                                    onChange={handleFiltroChange}
                                    label={filtros.provincia === 'Ciudad Autónoma de Buenos Aires' ? 'Barrio/Comuna' : 'Partido/Localidad'}
                                    disabled={barriosDisponiblesFiltro.length <= 1 && filtros.barrio === 'Todos'} // More robust disabled check
                                    displayEmpty
                                    inputProps={{ style: { fontSize: '0.9rem' } }}
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                                >
                                    {barriosDisponiblesFiltro.map((barrioOpt) => (
                                        <MenuItem key={barrioOpt} value={barrioOpt} sx={{ fontSize: '0.9rem' }}>{barrioOpt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }} variant="filled">{error}</Alert>
            ) : lugares.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }} variant="outlined">
                    No se encontraron lugares que coincidan con los filtros seleccionados.
                </Alert>
            ) : (
                <Grid container spacing={2.5}>
                    {lugares.map((lugar) => (
                        <Grid item xs={12} sm={6} md={4} key={lugar.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 2 }}>
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                        <Typography variant="h6" component="h2" sx={{ fontSize: '1.1rem', fontWeight: 500, flexGrow: 1, mr: 1 }}>
                                            {lugar.nombreLugar || 'Sin nombre'}
                                        </Typography>
                                        <Chip
                                            label={lugar.tipoRecurso || 'Sin categoría'}
                                            color="primary"
                                            size="small"
                                            sx={{ fontSize: '0.75rem', height: '20px' }}
                                        />
                                    </Box>

                                    <Typography {...commonSmallTextProps}>
                                        <LocationOnIcon {...iconProps} /> {lugar.direccionLugar || 'Dirección no disponible'}
                                        {lugar.barrio && `, ${lugar.barrio}`}
                                        {lugar.provincia && ` (${lugar.provincia})`}
                                    </Typography>

                                    {lugar.horarios && (
                                        <Typography {...commonSmallTextProps}>
                                            <TimeIcon {...iconProps} /> {lugar.horarios}
                                        </Typography>
                                    )}

                                    {lugar.aQuienAyuda && Object.keys(lugar.aQuienAyuda).length > 0 && (
                                        <Typography {...commonSmallTextProps}>
                                            <PeopleAltIcon {...iconProps} /> {formatAQuienAyuda(lugar.aQuienAyuda)}
                                        </Typography>
                                    )}

                                    <Divider sx={{ my: 1.5 }} light />

                                    {lugar.telefono && (
                                        <Typography {...commonSmallTextProps}>
                                            <PhoneIcon {...iconProps} />
                                            <MuiLink href={`tel:${lugar.telefono}`} color="inherit" underline="hover">
                                                {lugar.telefono}
                                            </MuiLink>
                                        </Typography>
                                    )}
                                    {lugar.mail && (
                                        <Typography {...commonSmallTextProps}>
                                            <EmailIcon {...iconProps} />
                                            <MuiLink href={`mailto:${lugar.mail}`} color="inherit" underline="hover">
                                                {lugar.mail}
                                            </MuiLink>
                                        </Typography>
                                    )}
                                    {lugar.sitioWeb && (
                                        <Typography {...commonSmallTextProps}>
                                            <WebIcon {...iconProps} />
                                            <MuiLink
                                                href={lugar.sitioWeb.startsWith('http') ? lugar.sitioWeb : `https://${lugar.sitioWeb}`}
                                                target="_blank" rel="noopener noreferrer" color="inherit" underline="hover"
                                            >
                                                {lugar.sitioWeb}
                                            </MuiLink>
                                        </Typography>
                                    )}

                                    {lugar.informacionAdicional && (
                                        <Box sx={{ mt: 1.5 }}>
                                            <Typography variant="caption" color="text.primary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 500 }}>
                                                <InfoIcon {...iconProps} sx={{ ...iconProps.sx, color: 'text.secondary' }} /> Info Adicional:
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5, display: 'block', fontSize: '0.8rem' }}>
                                                {lugar.informacionAdicional}
                                            </Typography>
                                        </Box>
                                    )}
                                    {lugar.fuente && (
                                        <Typography {...commonSmallTextProps} sx={{ ...commonSmallTextProps.sx, mt: 1.5, fontSize: '0.75rem', color: 'text.disabled' }}>
                                            <SourceIcon {...iconProps} sx={{ ...iconProps.sx, color: 'text.disabled' }} /> Fuente: {lugar.fuente}
                                        </Typography>
                                    )}
                                    {lugar.fechaVerificacion?.seconds && ( // Check if it's a Firestore Timestamp
                                        <Typography {...commonSmallTextProps} sx={{ ...commonSmallTextProps.sx, fontSize: '0.75rem', color: 'text.disabled' }}>
                                            <VerifiedUserIcon {...iconProps} sx={{ ...iconProps.sx, color: 'text.disabled' }} /> Verificado: {new Date(lugar.fechaVerificacion.seconds * 1000).toLocaleDateString()}
                                        </Typography>
                                    )}


                                </CardContent>
                                <Box sx={{ p: 1.5, pt: 0, mt: 'auto' }}> {/* Push button to bottom */}
                                    {lugar.googleMapsLink ? (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            href={lugar.googleMapsLink.startsWith('http') ? lugar.googleMapsLink : `https://${lugar.googleMapsLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            startIcon={<LocationOnIcon />}
                                            sx={{ fontSize: '0.8rem' }}
                                        >
                                            Ver en Google Maps
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                `${lugar.direccionLugar || ''} ${lugar.barrio || ''} ${lugar.provincia || ''} ${lugar.nombreLugar || ''}`.trim()
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            startIcon={<LocationOnIcon />}
                                            sx={{ fontSize: '0.8rem' }}
                                        >
                                            Buscar en Mapa
                                        </Button>
                                    )}
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default Lugares;