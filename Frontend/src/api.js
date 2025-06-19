import axios from 'axios';

const API = axios.create({
  baseURL: 'https://campusadmin.onrender.com', 
});

export default API;
