import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Note: We are creating the context here, but not exporting the hook from this file.
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (loggedInUser) {
            setUser(loggedInUser);
        }
        setLoading(false);
    }, []);

    const login = async (userData) => {
        const response = await authService.login(userData);
        setUser(response);
        navigate('/');
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        setUser(response);
        navigate('/');
    };
    
    const logout = () => {
        authService.logout();
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// The useAuth custom hook has been moved to its own file.