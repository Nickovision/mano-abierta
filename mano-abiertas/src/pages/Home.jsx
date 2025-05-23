import React from 'react';
import CategoryGrid from '../components/CategoryGrid';
import { Box, Typography } from '@mui/material';

const Home = () => {
    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h5" component="h1" sx={{ textAlign: 'center', mb: 2 }}>
                ¿Qué necesitas?
            </Typography>
            <CategoryGrid />
        </Box>
    );
};

export default Home;