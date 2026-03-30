import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                withCredentials: true
            });
            setUser(response.data.team);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
            teamLeaderEmail: email,
            password
        }, {
            withCredentials: true
        });

        // Wait for state to update by explicitly fetching auth again
        await checkAuth();
        return response.data;
    };

    const logout = async () => {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
            withCredentials: true
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};