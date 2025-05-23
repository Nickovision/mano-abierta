import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    CircularProgress
} from '@mui/material';
import { CATEGORIAS_TRAMITE } from '../constants/tramitesConstants';

const initialFormData = {
    titulo: '',
    descripcion: '',
    requisitos: '',
    categoria: '',
    enlace: '',
    fuente: ''
};

const TramiteForm = ({ tramite, onSubmit, isLoading, formId, hideSubmitButton = false, isModalVersion = false }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (tramite) {
            setFormData({
                titulo: tramite.titulo || '',
                descripcion: tramite.descripcion || '',
                requisitos: tramite.requisitos || '',
                categoria: tramite.categoria || '',
                enlace: tramite.enlace || '',
                fuente: tramite.fuente || ''
            });
        } else {
            setFormData(initialFormData);
        }
    }, [tramite]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.titulo.trim()) newErrors.titulo = 'El título es obligatorio';
        if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
        if (!formData.categoria) newErrors.categoria = 'La categoría es obligatoria';
        if (!formData.fuente.trim()) newErrors.fuente = 'La fuente es obligatoria';

        if (formData.enlace.trim()) {
            try {
                const url = new URL(formData.enlace.startsWith('http') ? formData.enlace : `https://${formData.enlace}`);
                if (url.protocol !== "http:" && url.protocol !== "https:") {
                    throw new Error("Invalid protocol");
                }
            } catch (_) {
                newErrors.enlace = 'El enlace no es una URL válida (ej: https://ejemplo.com)';
            }
        }

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

    const formGridContent = (
        <Grid container spacing={2.5} sx={{ width: '100%' }}>
            <Grid item xs={12}>
                <TextField
                    name="titulo"
                    label="Título del Trámite"
                    value={formData.titulo}
                    onChange={handleChange}
                    error={!!errors.titulo}
                    helperText={errors.titulo}
                    {...commonTextFieldProps}
                    required
                />
            </Grid>

            <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.categoria} size="small">
                    <InputLabel shrink sx={{ fontSize: '0.9rem' }}>Categoría</InputLabel>
                    <Select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        label="Categoría"
                        displayEmpty
                        inputProps={{ style: { fontSize: '0.9rem' } }}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
                        disabled={isLoading}
                        required
                    >
                        <MenuItem value="" disabled sx={{ fontSize: '0.9rem' }}><em>Seleccione una</em></MenuItem>
                        {categoriasTramite.map((cat) => (
                            <MenuItem key={cat} value={cat} sx={{ fontSize: '0.9rem' }}>{cat}</MenuItem>
                        ))}
                    </Select>
                    {errors.categoria && <FormHelperText>{errors.categoria}</FormHelperText>}
                </FormControl>
            </Grid>

            <Grid item xs={12}>
                <TextField
                    name="descripcion"
                    label="Descripción Detallada"
                    value={formData.descripcion}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion}
                    {...commonTextFieldProps}
                    required
                />
            </Grid>

            <Grid item xs={12}>
                <TextField
                    name="requisitos"
                    label="Requisitos (opcional)"
                    value={formData.requisitos}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    {...commonTextFieldProps}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    name="enlace"
                    label="Enlace a más información (opcional)"
                    value={formData.enlace}
                    onChange={handleChange}
                    error={!!errors.enlace}
                    helperText={errors.enlace}
                    {...commonTextFieldProps}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    name="fuente"
                    label="Fuente de la información"
                    value={formData.fuente}
                    onChange={handleChange}
                    error={!!errors.fuente}
                    helperText={errors.fuente}
                    {...commonTextFieldProps}
                    required
                />
            </Grid>
        </Grid>
    );

    if (isModalVersion) {
        return (
            <Box component="form" id={formId} onSubmit={handleSubmit} sx={{ pt: 1, width: '100%' }}>
                {formGridContent}
            </Box>
        );
    }

    return (
        <Box component="form" id={formId} onSubmit={handleSubmit} sx={{ mt: 2, mb: hideSubmitButton ? 0 : 8, width: '100%' }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                {formGridContent}
                {!hideSubmitButton && (
                    <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isLoading}
                            sx={{ minWidth: 200 }}
                        >
                            {isLoading ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} /> : (tramite ? 'Actualizar Trámite' : 'Crear Trámite')}
                        </Button>
                    </Grid>
                )}
            </Paper>
        </Box>
    );
};

export default TramiteForm;