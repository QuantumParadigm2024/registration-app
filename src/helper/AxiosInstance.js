import Cookies from "js-cookie";
import { decryptToken, encryptToken } from "./TokenCrypto";
import axios from "axios";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:9090",
  // baseURL:"https://registration.planotechevents.com:9090",
  // baseURL: " https://wrinkle-tastiness-plutonium.ngrok-free.dev",
   withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Track refresh state
let isRefreshing = false;
let failedQueue = [];

// Store navigate function for React Router navigation
let navigateFunction = null;
let notificationFunction = null;

// Token keys
const ACCESS_TOKEN_KEY = "00y";
const REFRESH_TOKEN_KEY = "00x";

// Create broadcast channel for cross-tab communication
const broadcastChannel = new BroadcastChannel('auth_channel');

// Function to set navigate from React component
export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

// Function to set notification from React component
export const setNotification = (showSessionExpired) => {
  notificationFunction = showSessionExpired;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Logout function
const logoutUser = (showNotification = true) => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });

  try {
    broadcastChannel.postMessage({ type: 'LOGOUT' });
    console.log("📢 Logout broadcast sent");
  } catch (e) {
    console.log("Broadcast failed:", e);
  }

  if (showNotification && notificationFunction) {
    notificationFunction();
  } else if (navigateFunction) {
    navigateFunction("/");
  } else {
    window.location.href = "/";
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      '/user/login',
      '/user/refresh',
      '/payment/webhook/razorpay',
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url === endpoint || config.url?.includes('/public/')
    );

    if (isPublicEndpoint) {
      console.log(`📡 Public endpoint ${config.url}`);
      return config;
    }

    const encryptedToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (encryptedToken) {
      try {
        const token = decryptToken(encryptedToken);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Token decryption failed:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message = error.response.data?.message;

    console.log(`🔴 Error ${status}: ${message}`, originalRequest?.url);

    if (status === 401 && (message === "Refresh token expired" || message?.includes("Refresh token expired"))) {
      console.log("⏰ Refresh token expired - logging out");
      logoutUser(true);
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/payment/order/verify')) {
      return Promise.reject(error);
    }

    if (status === 401 &&
      !originalRequest?._retry &&
      !originalRequest.url.includes('/user/login') &&
      !originalRequest.url.includes('/user/refresh') &&
      !originalRequest.url.includes('/user/logout')) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Attempting to refresh token...");
        
        const encryptedRefreshToken = Cookies.get(REFRESH_TOKEN_KEY);
        
        if (!encryptedRefreshToken) {
          throw new Error("No refresh token");
        }

        const refreshToken = decryptToken(encryptedRefreshToken);
        
        if (!refreshToken) {
          throw new Error("Invalid refresh token");
        }

        const refreshResponse = await axiosInstance.post(
          "/user/refresh",
          { refreshToken },
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        if (!accessToken) {
          throw new Error("No access token in refresh response");
        }
        
        const encryptedNewAccessToken = encryptToken(accessToken);
        sessionStorage.setItem(ACCESS_TOKEN_KEY, encryptedNewAccessToken);

        if (newRefreshToken) {
          const encryptedNewRefreshToken = encryptToken(newRefreshToken);
          Cookies.set(REFRESH_TOKEN_KEY, encryptedNewRefreshToken, {
            secure: true,
            sameSite: "strict",
            path: "/"
          });
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        
        if (refreshError.response?.data?.message === "Refresh token expired" ||
          refreshError.response?.data?.message?.includes("Refresh token expired")) {
          logoutUser(true);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;