import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid'; // Importación directa de Grid
import { useNavigate } from 'react-router-dom';
import {
    Restaurant as FoodIcon,
    Hotel as AlojamientoIcon, // Renamed for clarity, was SleepIcon
    Checkroom as RopaIcon, // New Icon
    Assignment as TramitesIcon, // Re-using, was AssignmentIcon
    AccountBalance as InstitucionIcon, // New Icon
    // Icons below are not directly used from TIPOS_RECURSO but kept for reference if needed elsewhere
    Soap as HygieneIcon,
    LocalHospital as HealthIcon,
    School as EducationIcon,
    Work as JobIcon,
    Wc as BathroomIcon,
    LocalLaundryService as LaundryIcon
} from '@mui/icons-material';
import { TIPOS_RECURSO } from '../constants/lugaresConstants'; // Import TIPOS_RECURSO

// Helper to map TIPOS_RECURSO to icons and names
const getCategoryDetails = (tipo) => {
    switch (tipo) {
        case 'Comida':
            return { name: 'Comida', icon: <FoodIcon fontSize="large" />, type: tipo };
        case 'Alojamiento':
            return { name: 'Alojamiento', icon: <AlojamientoIcon fontSize="large" />, type: tipo };
        case 'Ropa':
            return { name: 'Ropa', icon: <RopaIcon fontSize="large" />, type: tipo };
        case 'Trámites':
            return { name: 'Trámites', icon: <TramitesIcon fontSize="large" />, type: tipo };
        case 'Institución':
            return { name: 'Institución', icon: <InstitucionIcon fontSize="large" />, type: tipo };
        default:
            return null; // For 'Otro' or any other types we don't want in the grid
    }
};

const categories = TIPOS_RECURSO
    .map(tipo => getCategoryDetails(tipo))
    .filter(category => category !== null); // Filter out 'Otro' or any unmapped types

const CategoryGrid = () => {
    const navigate = useNavigate();

    const handleCategoryClick = (type) => {
        // Navigate to the places page with the type selected as a query parameter
        // Using 'tipoRecurso' to match the filter state key in Lugares.jsx
        navigate(`/lugares?tipoRecurso=${encodeURIComponent(type)}`);
    };

    return (
        <Box sx={{
            flexGrow: 1,
            p: 2,
            mb: 7,
            display: 'flex', // Center the Grid container
            justifyContent: 'center' // Center the Grid container
        }}>
            <Grid container spacing={2} sx={{ justifyContent: 'center', maxWidth: '100%' }}> {/* Center items within the grid */}
                {categories.map((category, index) => (
                    <Grid item key={index}> {/* Removed xs, sm, md props */}
                        <Card
                            sx={{
                                width: 140, // Fixed width
                                height: 140, // Fixed height
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 3,
                                    transform: 'scale(1.02)',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                            onClick={() => handleCategoryClick(category.type)}
                        >
                            <CardContent sx={{
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%', // Ensure content fills the card
                                p: 1 // Optional: adjust padding if needed for smaller card sizes
                            }}>
                                {category.icon}
                                <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                                    {category.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default CategoryGrid;