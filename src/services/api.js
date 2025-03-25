import config from '../config/config';

const BASE_URL = config.API_URL;

// Auth APIs
const login = async (credentials) => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    return response.json();
};

const register = async (userData) => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response.json();
};

// Jobs APIs
const getAllJobs = async (token) => {
    const response = await fetch(`${BASE_URL}/api/jobs`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
};

// Government Schemes APIs
const getAllSchemes = async (token) => {
    const response = await fetch(`${BASE_URL}/api/govt-schemes`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
};

// Subsidies APIs
const getAllSubsidies = async (token) => {
    const response = await fetch(`${BASE_URL}/api/subsidies`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
};

// Payment APIs
const createOrder = async (amount, token) => {
    const response = await fetch(`${BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
    });
    return response.json();
};

const verifyPayment = async (paymentData, token) => {
    const response = await fetch(`${BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    });
    return response.json();
};

// Admin APIs
const getAdminStats = async (token) => {
    const response = await fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
};

export {
    login,
    register,
    getAllJobs,
    getAllSchemes,
    getAllSubsidies,
    createOrder,
    verifyPayment,
    getAdminStats
};