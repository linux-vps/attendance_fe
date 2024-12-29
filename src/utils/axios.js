import axios from 'axios';
import { Toast } from '../components/Toast';

// Create axios instance
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx
    return response;
  },
  (error) => {
    // Handle validation errors
    function handleValidationErrors(errors) {
      const messages = Object.values(errors).flat();
      messages.forEach((message) => Toast.error(message));
    }

    // Any status codes that falls outside the range of 2xx
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 401: {
          // Unauthorized - clear token and redirect to login
          Toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        }
        case 403:
          Toast.error('Bạn không có quyền thực hiện thao tác này');
          break;
        case 404:
          Toast.error('Không tìm thấy tài nguyên yêu cầu');
          break;
        case 422: {
          // Validation error - handle outside of case block
          if (response.data && response.data.errors) {
            handleValidationErrors(response.data.errors);
          }
          break;
        }
        case 500:
          Toast.error('Lỗi hệ thống. Vui lòng thử lại sau');
          break;
        default:
          Toast.error(response.data.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      Toast.error('Không thể kết nối đến máy chủ');
    } else {
      // Something happened in setting up the request that triggered an Error
      Toast.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
    return Promise.reject(error);
  }
);

export default instance;
