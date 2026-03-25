import axios from 'axios';

const api = axios.create({
    // Se estiver no localhost, usa 3001. Se estiver no Render, usa a própria URL do site.
    baseURL: process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '')
});

export default api; 