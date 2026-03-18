import { Navigate, Outlet } from "react-router-dom";
import { decryptToken } from "./TokenCrypto";

const PrivateRoute = () => {
    const encryptedToken = sessionStorage.getItem("00y");

    console.log("🔒 PrivateRoute check:", { 
        hasToken: !!encryptedToken,
        path: window.location.pathname 
    });

    // No token at all → redirect to HOME page
    if (!encryptedToken) {
        console.log("🚫 No token, redirecting to home page");
        return <Navigate to="/" replace />;
    }

    try {
        const token = decryptToken(encryptedToken);

        // Decryption failed or empty → redirect to HOME page
        if (!token) {
            console.log("🚫 Token decryption failed, redirecting to home page");
            sessionStorage.removeItem("00y");
            return <Navigate to="/" replace />;
        }

        // Token exists → allow route
        console.log("✅ Token valid, allowing access");
        return <Outlet />;
    } catch (err) {
        console.log("🚫 Token corrupted, redirecting to home page");
        sessionStorage.removeItem("00y");
        return <Navigate to="/" replace />;
    }
};

export default PrivateRoute;