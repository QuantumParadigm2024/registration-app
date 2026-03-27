import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../helper/AxiosInstance";
import Cookies from "js-cookie";
import { encryptToken } from "../helper/TokenCrypto";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { CircularProgress } from "@mui/material";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("/user/login", null, {
                params: { email, password }
            });

            const { token, refreshToken } = response.data;

            // Encrypt tokens
            const encryptedAccessToken = encryptToken(token);
            const encryptedRefreshToken = encryptToken(refreshToken);

            // Store access token in sessionStorage (tab-specific)
            sessionStorage.setItem("00y", encryptedAccessToken);

            // Store refresh token in cookie (shared across tabs)
            Cookies.set("00x", encryptedRefreshToken, {
                secure: true,
                sameSite: "strict",
                path: "/"
            });

            // Fetch logged-in user
            const meRes = await axiosInstance.get("/user/auth/me");
            dispatch(setUser(meRes.data));

            // Role-based Redirect
            const EVENT_ADMIN_ROLES = [
                "ROLE_EVENT_ADMIN",
                "ROLE_ADMIN",
                "ROLE_COORDINATOR",
                "ROLE_USER"
            ];

            const user = meRes.data;
            const hasEventAdminRole =
                EVENT_ADMIN_ROLES.includes(user.platformRole) ||
                EVENT_ADMIN_ROLES.includes(user.highestEventRole);

            if (hasEventAdminRole) {
                navigate("/eventAdminDashboard", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }

        } catch (error) {
            console.error("Login failed:", error);
            const apiMessage = error.response?.data?.message;
            setErrorMsg(apiMessage === "Invalid username or password"
                ? apiMessage
                : "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-6xl bg-gradient-to-br from-blue-400 to-white-600 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* LEFT – LOGIN FORM */}
                <div className="p-8 md:p-12 text-white">
                    <h2 className="text-3xl font-semibold mb-6">Welcome Back</h2>
                    <p className="text-sm mb-8">
                        Login to continue to your account
                    </p>

                    <form className="space-y-5" onSubmit={handleLogin}>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrorMsg("");
                            }}
                            placeholder="Email *"
                            required
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrorMsg("");
                                }}
                                placeholder="Password *"
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span
                                className={`absolute right-3 top-3 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !isLoading && setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </span>
                        </div>

                        {/* ERROR MESSAGE */}
                        {errorMsg && (
                            <div className="bg-red-500/20 border border-red-400/40 text-red-700 px-4 py-2 rounded-md text-sm">
                                {errorMsg}
                            </div>
                        )}

                        <div className="text-right mt-1 mb-2">
                            <Link
                                to="/forgot-password"
                                className={`text-sm text-blue-600 hover:text-blue-800 font-medium no-underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-purple-600 font-bold py-3 rounded-full hover:bg-gray-100 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <CircularProgress size={20} color="inherit" />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>

                        <p className="text-center text-base mt-4">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className={`text-blue-600 hover:text-blue-800 font-medium no-underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                Create account
                            </Link>
                        </p>
                    </form>
                </div>

                {/* RIGHT – IMAGE */}
                <div className="hidden md:flex items-center justify-center relative">
                    <img
                        src="https://cdni.iconscout.com/illustration/premium/thumb/register-illustration-svg-download-png-2918388.png"
                        alt="login"
                        className="w-[85%] max-w-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;