import React from 'react';
import { Box, Typography } from '@mui/material';

const Tramites = () => {
    return (
        <Box sx={{ mt: 2, mb: 8, p: 2 }}>
            <Typography variant="h5" component="h1" sx={{ textAlign: 'center', mb: 2 }}>
                Trámites
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
                Información sobre trámites importantes.
            </Typography>
        </Box>
    );
};

export default Tramites;