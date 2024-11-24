import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:3000';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    is_admin: boolean;
  };
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post('/api/login', { username, password });
  const { token, user } = response.data;
  
  // Store the token and user info
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Set default authorization header for future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

export const isAdmin = (): boolean => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  const user = JSON.parse(userStr);
  return user.is_admin === true;
};

export const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
