// resources/js/services/api.js
import axios from 'axios';

const api = axios.create({
    // baseURL: 'https://erp.compliantretrofits.co.uk/api',          // Laravel API prefix
    baseURL: 'http://erp.test/api',          // Laravel API prefix
    withCredentials: true,    // Important for Sanctum cookie auth
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
});

window.axios = api;

export default api;