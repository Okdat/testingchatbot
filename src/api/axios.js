import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

instance.interceptors.response.use(
  response => response, // Xử lý response
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = JSON.parse(localStorage.getItem('user'))?.refresh_token;

      if (!refreshToken) {
        // Nếu không có refresh token, logout
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = res.data;

        // Lưu token mới
        const user = JSON.parse(localStorage.getItem('user'));
        user.access_token = access_token;
        localStorage.setItem('user', JSON.stringify(user));

        // Cập nhật header Authorization
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

        // Thử lại request gốc
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
