import axios from 'axios';

const api = axios.create({
    // Detecta automaticamente se está no Render ou Localhost
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : window.location.origin
});

export default api; 