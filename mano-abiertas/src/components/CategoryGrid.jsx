import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid'; // Importación directa de Grid
import { useNavigate } from 'react-router-dom';
import {
    Restaurant as FoodIcon,
    Soap as HygieneIcon,
    Hotel as SleepIcon,
    LocalHospital as HealthIcon,
    School as EducationIcon,
    Work as JobIcon,
    Wc as BathroomIcon,
    LocalLaundryService as LaundryIcon
} from '@mui/icons-material';

const categories = [
    { name: 'Comida', icon: <FoodIcon fontSize="large" />, type: 'Comida' },
    { name: 'Higiene', icon: <HygieneIcon fontSize="large" />, type: 'Higiene' },
    { name: 'Dormir', icon: <SleepIcon fontSize="large" />, type: 'Dormir' },
    { name: 'Salud', icon: <HealthIcon fontSize="large" />, type: 'Salud' },
    { name: 'Educación', icon: <EducationIcon fontSize="large" />, type: 'Educación' },
    { name: 'Trabajo', icon: <JobIcon fontSize="large" />, type: 'Trabajo' },
    { name: 'Baños', icon: <BathroomIcon fontSize="large" />, type: 'Baños' },
    { name: 'Lavandería', icon: <LaundryIcon fontSize="large" />, type: 'Lavandería' }
];

const CategoryGrid = () => {
    const navigate = useNavigate();

    const handleCategoryClick = (type) => {
        // Navegar a la página de lugares con el tipo seleccionado como parámetro de consulta
        navigate(`/lugares?tipo=${type}`);
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