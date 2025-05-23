import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home as HomeIcon, Place as PlaceIcon, Assignment as AssignmentIcon, Person as PersonIcon } from '@mui/icons-material';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(() => {
        const path = location.pathname;
        if (path === '/lugares') return 1;
        if (path === '/tramites') return 2;
        if (path === '/login') return 3;
        return 0;
    });

    const handleChange = (event, newValue) => {
        setValue(newValue);
        switch (newValue) {
            case 0:
                navigate('/');
                break;
            case 1:
                navigate('/lugares');
                break;
            case 2:
                navigate('/tramites');
                break;
            case 3:
                navigate('/login');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <MuiBottomNavigation
                showLabels
                value={value}
                onChange={handleChange}
            >
                <BottomNavigationAction label="Inicio" icon={<HomeIcon />} />
                <BottomNavigationAction label="Lugares" icon={<PlaceIcon />} />
                <BottomNavigationAction label="Trámites" icon={<AssignmentIcon />} />
                <BottomNavigationAction label="Login" icon={<PersonIcon />} />
            </MuiBottomNavigation>
        </Paper>
    );
};

export default BottomNav;