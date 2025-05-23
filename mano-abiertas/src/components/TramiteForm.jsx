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
    FormHelperText
} from '@mui/material';

const categoriasTramite = [
    'Documentación',
    'Salud',
    'Educación',
    'Trabajo',
    'Vivienda',
    'Legal',
    'Otro'
];

const TramiteForm = ({ tramite, onSubmit, isLoading, formId, hideSubmitButton = false }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        requisitos: '',
        categoria: '',
        enlace: '', // Nuevo campo para enlace
        fuente: '' // Nuevo campo para fuente
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (tramite) {
            setFormData(tramite);
        }
    }, [tramite]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.titulo) newErrors.titulo = 'El título es obligatorio';
        if (!formData.descripcion) newErrors.descripcion = 'La descripción es obligatoria';
        if (!formData.categoria) newErrors.categoria = 'La categoría es obligatoria';
        if (!formData.fuente) newErrors.fuente = 'La fuente es obligatoria';

        if (formData.enlace) {
            try {
                new URL(formData.enlace);
            } catch (_) {
                newErrors.enlace = 'El enlace no es una URL válida';
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

    return (
        <Box component="form" id={formId} onSubmit={handleSubmit} sx={{ mt: 1, mb: hideSubmitButton ? 0 : 8 }}>
            {/* No Paper or main title here, as it's meant for a Dialog */}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        name="titulo"
                        label="Título del Trámite"
                        value={formData.titulo}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.titulo}
                        helperText={errors.titulo}
                        disabled={isLoading}
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth required error={!!errors.categoria}>
                        <InputLabel>Categoría</InputLabel>
                        <Select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            label="Categoría"
                            disabled={isLoading}
                        >
                            {categoriasTramite.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
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
                        fullWidth
                        required
                        multiline
                        rows={3}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion}
                        disabled={isLoading}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        name="requisitos"
                        label="Requisitos (opcional)"
                        value={formData.requisitos}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        disabled={isLoading}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name="enlace"
                        label="Enlace a más información (opcional)"
                        value={formData.enlace}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.enlace}
                        helperText={errors.enlace}
                        disabled={isLoading}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name="fuente"
                        label="Fuente de la información"
                        value={formData.fuente}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.fuente}
                        helperText={errors.fuente}
                        disabled={isLoading}
                    />
                </Grid>

                {/* Submit button will be in the Dialog */}
            </Grid>
        </Box>
    );
};

export default TramiteForm;