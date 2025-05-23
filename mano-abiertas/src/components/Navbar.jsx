import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Navbar = () => {
    return (
        <AppBar position="static" color="primary" sx={{ boxShadow: 0 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                    Mano Abierta
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;