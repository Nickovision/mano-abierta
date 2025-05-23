import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Home from './pages/Home';
import Lugares from './pages/Lugares';
import Tramites from './pages/Tramites';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminLugares from './pages/AdminLugares';
import AdminTramites from './pages/AdminTramites';
import { AuthProvider } from './contexts/AuthContext';

// Creamos un tema personalizado
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#f50057',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="lugares" element={<Lugares />} />
                            <Route path="tramites" element={<Tramites />} />
                            <Route path="login" element={<Login />} />
                            <Route path="admin" element={<Admin />} />
                            <Route path="admin/lugares" element={<AdminLugares />} />
                            <Route path="admin/tramites" element={<AdminTramites />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;