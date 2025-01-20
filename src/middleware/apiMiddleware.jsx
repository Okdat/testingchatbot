import axios from 'axios';

const apiMiddleware = axios.create();

// Middleware thêm Authorization header cho mỗi yêu cầu
apiMiddleware.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.access_token) {
      config.headers['Authorization'] = `Bearer ${user.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiMiddleware;

// Hàm authMiddleware để kiểm tra xác thực
export const authMiddleware = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.access_token) {
      return false; // Không hợp lệ nếu không có user hoặc token
    }
    return validateToken(user.access_token); // Kiểm tra token
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    return false; // Trả về false nếu có lỗi
  }
};

// Hàm validateToken
const validateToken = (token) => {
  try {
    // Giả lập kiểm tra token
    return !!token; // Đảm bảo token tồn tại
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
};
