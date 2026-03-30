import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex bg-[#f3f3f3] items-center justify-center min-h-screen text-[14px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0000cc]"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;