import axios from 'axios';

const api = axios.create({
    // O Render vai injetar a URL aqui se você configurou o REACT_APP_API_URL no painel
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001'
});

export default api;