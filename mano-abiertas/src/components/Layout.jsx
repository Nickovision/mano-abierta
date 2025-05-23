import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNavigation';
import { Box, Container } from '@mui/material';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Container component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Container>
            <BottomNav />
        </Box>
    );
};

export default Layout;