const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const USER_API = `${BASE_URL}/user`;
export const ADMIN_API = `${BASE_URL}/admin`;
export const SUPER_ADMIN_API = `${BASE_URL}/superadmin`;
