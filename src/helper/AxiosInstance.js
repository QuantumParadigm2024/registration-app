import Cookies from "js-cookie";
import { decryptToken, encryptToken } from "./TokenCrypto";
import axios from "axios";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:9090",
  // baseURL:"https://registration.planotechevents.com:9090",
  withCredentials: true,
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

// Logout function - shows session expired notification
const logoutUser = (showNotification = true) => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });

  // Broadcast logout to other tabs
  try {
    broadcastChannel.postMessage({ type: 'LOGOUT' });
    console.log("📢 Logout broadcast sent from interceptor");
  } catch (e) {
    console.log("Broadcast failed:", e);
  }

  if (showNotification && notificationFunction) {
    notificationFunction();
  } else if (navigateFunction) {
    navigateFunction("/");
  }else{
        window.location.href = "/";
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
        // List of endpoints that DON'T need authentication
    const publicEndpoints = [
      '/user/login',
      '/user/refresh',
    ];

    // Check if current URL is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url === endpoint || config.url?.includes('/public/')
    );

    // Skip token for public endpoints
    if (isPublicEndpoint) {
      console.log(`📡 Public endpoint ${config.url} - no token added`);

    }

    const encryptedToken = sessionStorage.getItem("00y");
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

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message = error.response.data?.message;

    console.log(`🔴 Error ${status}: ${message}`, originalRequest?.url);

  // SPECIAL CASE: If refresh token itself is expired, logout with notification

    if (status === 401 && (message === "Refresh token expired" || message?.includes("Refresh token expired"))) {

      console.log("⏰ Refresh token expired - logging out with notification");

      logoutUser(true);
      return Promise.reject(error);
    }
    // IMPORTANT: Don't refresh for logout endpoint

    if (status === 401 &&

      !originalRequest?._retry &&

      !originalRequest.url.includes('/user/login') &&

      !originalRequest.url.includes('/user/refresh') &&

      !originalRequest.url.includes('/user/logout')) {  // ← Add this
      
      // If already refreshing, queue this request
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
        
          // Get refresh token from cookie (SHARED ACROSS TABS)
        const encryptedRefreshToken = Cookies.get(REFRESH_TOKEN_KEY);
        
        if (!encryptedRefreshToken) {
          console.log("❌ No refresh token available");
                  throw new Error("No refresh token");
        }

        // Decrypt refresh token
        const refreshToken = decryptToken(encryptedRefreshToken);
        
        if (!refreshToken) {
          console.log("❌ Invalid refresh token");
                    throw new Error("Invalid refresh token");
        }

        // Call refresh endpoint
        const refreshResponse = await axiosInstance.post(
          "/user/refresh",
          { refreshToken },
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        // Get new tokens from response
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Validate we got new tokens
        if (!accessToken) {
          throw new Error("No access token in refresh response");
        }
        // Store new access token in sessionStorage (tab-specific)
        const encryptedNewAccessToken = encryptToken(accessToken);
        sessionStorage.setItem(ACCESS_TOKEN_KEY, encryptedNewAccessToken);

        // Store new refresh token in cookie (shared across tabs)

        
        if (newRefreshToken) {
                    const encryptedNewRefreshToken = encryptToken(newRefreshToken);
          Cookies.set(REFRESH_TOKEN_KEY, encryptedNewRefreshToken, {

            secure: true,
            sameSite: "strict",
            path: "/"
          });
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Process queued requests with new token
        processQueue(null, accessToken);
        
        // Retry original request
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        
        processQueue(refreshError, null);
        
        // Check if refresh token expired during refresh attempt
         if (refreshError.response?.data?.message === "Refresh token expired" ||

          refreshError.response?.data?.message?.includes("Refresh token expired")) {

          console.log("⏰ Refresh token expired during refresh");
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

// Export both the instance and the setNavigate function
export default axiosInstance;