import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Checkbox,
    FormGroup,
    FormControlLabel,
    FormLabel,
    CircularProgress,
    Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import {
    TIPOS_RECURSO,
    PROVINCIAS_ARGENTINAS,
    BARRIOS_CABA,
    PARTIDOS_AMBA_BSAS,
    A_QUIEN_AYUDA_OPCIONES
} from '../constants/lugaresConstants';

const initialFormData = {
    tipoRecurso: '',
    nombreLugar: '',
    direccionLugar: '',
    googleMapsLink: '',
    provincia: '',
    barrio: '',
    horarios: '',
    aQuienAyuda: A_QUIEN_AYUDA_OPCIONES.reduce((acc, opt) => ({ ...acc, [opt.id]: false }), {}),
    telefono: '',
    mail: '',
    sitioWeb: '',
    informacionAdicional: '',
    fuente: '',
    fechaVerificacion: new Date()
};


const LugarForm = ({ lugar, onSubmit, isLoading, formId, hideSubmitButton = false, isModalVersion = false }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [barriosDisponibles, setBarriosDisponibles] = useState([]);

    useEffect(() => {
        if (lugar) {
            const mappedData = {
                ...initialFormData,
                tipoRecurso: lugar.tipoRecurso || lugar.tipo || '',
                nombreLugar: lugar.nombreLugar || lugar.nombre || '',
                direccionLugar: lugar.direccionLugar || (typeof lugar.direccion === 'string' ? lugar.direccion :
                    (lugar.direccion ? `${lugar.direccion.calle || ''} ${lugar.direccion.numero || ''}`.trim() : '')),
                googleMapsLink: lugar.googleMapsLink || '',
                provincia: lugar.provincia || '',
                barrio: lugar.barrio || '',
                horarios: lugar.horarios || '',
                aQuienAyuda: lugar.aQuienAyuda ?
                    { ...initialFormData.aQuienAyuda, ...lugar.aQuienAyuda } :
                    initialFormData.aQuienAyuda,
                telefono: lugar.telefono || lugar.contacto?.telefono || '',
                mail: lugar.mail || lugar.contacto?.email || '',
                sitioWeb: lugar.sitioWeb || lugar.contacto?.web || '',
                informacionAdicional: lugar.informacionAdicional || lugar.observaciones || lugar.descripcion || '',
                fuente: lugar.fuente || '',
                fechaVerificacion: lugar.fechaVerificacion?.seconds ? new Date(lugar.fechaVerificacion.seconds * 1000) : (lugar.fechaVerificacion ? new Date(lugar.fechaVerificacion) : new Date())
            };
            setFormData(mappedData);
            if (mappedData.provincia) {
                handleProvinciaChange({ target: { name: 'provincia', value: mappedData.provincia } }, mappedData.barrio);
            }
        } else {
            setFormData(initialFormData);
            setBarriosDisponibles([]);
        }
    }, [lugar]);

    const handleProvinciaChange = (e, initialBarrio = '') => {
        const { name, value } = e.target;
        let selectedBarrio = initialBarrio;

        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            let newBarriosDisponibles = [];

            if (value === 'Ciudad Autónoma de Buenos Aires') {
                newBarriosDisponibles = BARRIOS_CABA;
            } else if (value === 'Buenos Aires') {
                newBarriosDisponibles = PARTIDOS_AMBA_BSAS;
            }
            setBarriosDisponibles(newBarriosDisponibles);

            if (newBarriosDisponibles.length > 0 && newBarriosDisponibles.includes(selectedBarrio)) {
                newState.barrio = selectedBarrio;
            } else {
                newState.barrio = '';
            }
            return newState;
        });
    };


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'aQuienAyuda') {
            const fieldName = e.target.value;
            setFormData(prev => {
                const newAQH = { ...prev.aQuienAyuda, [fieldName]: checked };
                if (fieldName === 'todos' && checked) {
                    A_QUIEN_AYUDA_OPCIONES.forEach(opt => {
                        if (opt.id !== 'todos') newAQH[opt.id] = false;
                    });
                } else if (fieldName !== 'todos' && checked && newAQH.todos) {
                    newAQH.todos = false;
                }
                return { ...prev, aQuienAyuda: newAQH };
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            fechaVerificacion: date
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.tipoRecurso) newErrors.tipoRecurso = 'El tipo de recurso es obligatorio';
        if (!formData.nombreLugar) newErrors.nombreLugar = 'El nombre del lugar es obligatorio';
        if (!formData.direccionLugar) newErrors.direccionLugar = 'La dirección es obligatoria';
        if (!formData.provincia) newErrors.provincia = 'La provincia es obligatoria';
        if ((formData.provincia === 'Ciudad Autónoma de Buenos Aires' || formData.provincia === 'Buenos Aires') && !formData.barrio && barriosDisponibles.length > 0) {
            newErrors.barrio = 'El barrio/partido es obligatorio para esta provincia';
        }
        if (!formData.horarios) newErrors.horarios = 'Los horarios son obligatorios';
        if (formData.googleMapsLink) {
            try { new URL(formData.googleMapsLink); }
            catch (_) { newErrors.googleMapsLink = 'El link de Google Maps no es una URL válida'; }
        }
        if (formData.mail && !/\S+@\S+\.\S+/.test(formData.mail)) {
            newErrors.mail = 'El email no es válido';
        }
        if (formData.sitioWeb) {
            try { new URL(formData.sitioWeb.startsWith('http') ? formData.sitioWeb : `https://${formData.sitioWeb}`); }
            catch (_) { newErrors.sitioWeb = 'El sitio web no es una URL válida'; }
        }
        if (!formData.fuente) newErrors.fuente = 'La fuente de información es obligatoria';
        if (!formData.fechaVerificacion) newErrors.fechaVerificacion = 'La fecha de verificación es obligatoria';

        const ayudaSeleccionada = Object.values(formData.aQuienAyuda).some(val => val === true);
        if (!ayudaSeleccionada) newErrors.aQuienAyuda = 'Debe seleccionar al menos una opción para "A quién ayuda"';


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const commonTextFieldProps = {
        variant: "outlined",
        size: "small",
        fullWidth: true,
        InputLabelProps: { shrink: true, style: { fontSize: '0.9rem' } },
        inputProps: { style: { fontSize: '0.9rem' } },
        disabled: isLoading,
    };

    const FormWrapper = ({ children }) => (
        isModalVersion ? (
            <Box component="form" id={formId} onSubmit={handleSubmit} sx={{ pt: 1 }}>
                {children}
            </Box>
        ) : (
            <Box component="form" id={formId} onSubmit={handleSubmit} sx={{ mt: 2, mb: hideSubmitButton ? 0 : 8 }}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                    {children}
                </Paper>
            </Box>
        )
    );

    return (
        <FormWrapper>
            <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.tipoRecurso} size="small">
                        <InputLabel shrink sx={{ fontSize: '0.9rem' }}>Tipo de Recurso</InputLabel>
                        <Select
                            name="tipoRecurso"
                            value={formData.tipoRecurso}
                            onChange={handleChange}
                            label="Tipo de Recurso"
                            displayEmpty
                            inputProps={{ style: { fontSize: '0.9rem' } }}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: '0.9rem' }}><em>Seleccione uno</em></MenuItem>
                            {TIPOS_RECURSO.map((tipo) => (
                                <MenuItem key={tipo} value={tipo} sx={{ fontSize: '0.9rem' }}>{tipo}</MenuItem>
                            ))}
                        </Select>
                        {errors.tipoRecurso && <FormHelperText>{errors.tipoRecurso}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        name="nombreLugar"
                        label="Nombre del Lugar/Organización"
                        value={formData.nombreLugar}
                        onChange={handleChange}
                        error={!!errors.nombreLugar}
                        helperText={errors.nombreLugar}
                        {...commonTextFieldProps}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        name="direccionLugar"
                        label="Dirección (Calle, Número, Localidad)"
                        value={formData.direccionLugar}
                        onChange={handleChange}
                        error={!!errors.direccionLugar}
                        helperText={errors.direccionLugar}
                        {...commonTextFieldProps}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.provincia} size="small">
                        <InputLabel shrink sx={{ fontSize: '0.9rem' }}>Provincia</InputLabel>
                        <Select
                            name="provincia"
                            value={formData.provincia}
                            onChange={handleProvinciaChange}
                            label="Provincia"
                            displayEmpty
                            inputProps={{ style: { fontSize: '0.9rem' } }}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: '0.9rem' }}><em>Seleccione una</em></MenuItem>
                            {PROVINCIAS_ARGENTINAS.map((prov) => (
                                <MenuItem key={prov} value={prov} sx={{ fontSize: '0.9rem' }}>{prov}</MenuItem>
                            ))}
                        </Select>
                        {errors.provincia && <FormHelperText>{errors.provincia}</FormHelperText>}
                    </FormControl>
                </Grid>

                {(formData.provincia === 'Ciudad Autónoma de Buenos Aires' || formData.provincia === 'Buenos Aires') && (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.barrio} size="small">
                            <InputLabel shrink sx={{ fontSize: '0.9rem' }}>
                                {formData.provincia === 'Ciudad Autónoma de Buenos Aires' ? 'Barrio/Comuna (CABA)' : 'Partido/Localidad (AMBA)'}
                            </InputLabel>
                            <Select
                                name="barrio"
                                value={formData.barrio}
                                onChange={handleChange}
                                label={formData.provincia === 'Ciudad Autónoma de Buenos Aires' ? 'Barrio/Comuna (CABA)' : 'Partido/Localidad (AMBA)'}
                                disabled={barriosDisponibles.length === 0 || isLoading}
                                displayEmpty
                                inputProps={{ style: { fontSize: '0.9rem' } }}
                                MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                            >
                                <MenuItem value="" disabled sx={{ fontSize: '0.9rem' }}><em>Seleccione uno</em></MenuItem>
                                {barriosDisponibles.map((barrioOpt) => (
                                    <MenuItem key={barrioOpt} value={barrioOpt} sx={{ fontSize: '0.9rem' }}>{barrioOpt}</MenuItem>
                                ))}
                            </Select>
                            {errors.barrio && <FormHelperText>{errors.barrio}</FormHelperText>}
                        </FormControl>
                    </Grid>
                )}


                <Grid item xs={12} sm={formData.provincia === 'Ciudad Autónoma de Buenos Aires' || formData.provincia === 'Buenos Aires' ? 12 : 6}>
                    <TextField
                        name="googleMapsLink"
                        label="Link de Google Maps (opcional)"
                        value={formData.googleMapsLink}
                        onChange={handleChange}
                        error={!!errors.googleMapsLink}
                        helperText={errors.googleMapsLink}
                        {...commonTextFieldProps}
                    />
                </Grid>


                <Grid item xs={12} sm={6}>
                    <TextField
                        name="horarios"
                        label="Horarios de Atención"
                        value={formData.horarios}
                        onChange={handleChange}
                        error={!!errors.horarios}
                        helperText={errors.horarios}
                        {...commonTextFieldProps}
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControl component="fieldset" error={!!errors.aQuienAyuda} disabled={isLoading} sx={{ width: '100%' }}>
                        <FormLabel component="legend" sx={{ fontSize: '0.85rem', mb: 0.5, color: errors.aQuienAyuda ? 'error.main' : 'text.secondary' }}>A quién ayuda</FormLabel>
                        <FormGroup row sx={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                            {A_QUIEN_AYUDA_OPCIONES.map(opt => (
                                <FormControlLabel
                                    key={opt.id}
                                    control={
                                        <Checkbox
                                            checked={Boolean(formData.aQuienAyuda[opt.id])}
                                            onChange={handleChange}
                                            name="aQuienAyuda"
                                            value={opt.id}
                                            size="small"
                                            disabled={isLoading || (formData.aQuienAyuda.todos && opt.id !== 'todos')}
                                        />
                                    }
                                    label={<Typography sx={{ fontSize: '0.85rem' }}>{opt.label}</Typography>}
                                    sx={{ minWidth: '120px', flexGrow: { xs: 1, sm: 0 } }}
                                />
                            ))}
                        </FormGroup>
                        {errors.aQuienAyuda && <FormHelperText>{errors.aQuienAyuda}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <TextField
                        name="telefono"
                        label="Teléfono (opcional)"
                        value={formData.telefono}
                        onChange={handleChange}
                        {...commonTextFieldProps}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        name="mail"
                        label="Mail de Contacto (opcional)"
                        value={formData.mail}
                        onChange={handleChange}
                        error={!!errors.mail}
                        helperText={errors.mail}
                        {...commonTextFieldProps}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        name="sitioWeb"
                        label="Sitio Web/Red Social (opcional)"
                        value={formData.sitioWeb}
                        onChange={handleChange}
                        error={!!errors.sitioWeb}
                        helperText={errors.sitioWeb}
                        {...commonTextFieldProps}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        name="informacionAdicional"
                        label="Información Adicional (opcional)"
                        value={formData.informacionAdicional}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        {...commonTextFieldProps}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="fuente"
                        label="Fuente de la Información"
                        value={formData.fuente}
                        onChange={handleChange}
                        error={!!errors.fuente}
                        helperText={errors.fuente}
                        {...commonTextFieldProps}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                            label="Fecha de Verificación"
                            value={formData.fechaVerificacion}
                            onChange={handleDateChange}
                            disabled={isLoading}
                            slotProps={{ textField: { ...commonTextFieldProps, size: 'small', error: !!errors.fechaVerificacion, helperText: errors.fechaVerificacion } }}
                        />
                    </LocalizationProvider>
                </Grid>

                {!hideSubmitButton && (
                    <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isLoading}
                            sx={{ minWidth: 200 }}
                        >
                            {isLoading ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} /> : lugar ? 'Actualizar Lugar' : 'Crear Lugar'}
                        </Button>
                    </Grid>
                )}
            </Grid>
        </FormWrapper>
    );
};

export default LugarForm;