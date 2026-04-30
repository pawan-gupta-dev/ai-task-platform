import { getToken, removeToken } from './utils/tokenUtils';

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};
