// ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axiosInstance from "../helper/AxiosInstance";

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [passwordStrength, setPasswordStrength] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const { email, otp } = location.state || {};

    useEffect(() => {
        // Redirect if no email or otp in state
        if (!email || !otp) {
            navigate("/forgot-password");
        }
    }, [email, otp, navigate]);

    // Password strength checker
    const checkPasswordStrength = (password) => {
        if (password.length < 8) return "weak";
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
        
        if (strength < 2) return "weak";
        if (strength < 4) return "medium";
        return "strong";
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);
        setPasswordStrength(checkPasswordStrength(password));
        setErrorMsg("");
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        // Validation
        if (newPassword !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        if (passwordStrength === "weak") {
            setErrorMsg("Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and special characters.");
            return;
        }

        setIsLoading(true);

        try {
            await axiosInstance.post("/user/auth/reset-password", null, {
                params: { 
                    otp, 
                    newPassword, 
                    email 
                }
            });

            setSuccessMsg("Password reset successfully! Redirecting to login...");
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (error) {
            const apiMessage = error.response?.data?.message;
            setErrorMsg(apiMessage || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        switch(passwordStrength) {
            case "weak": return "bg-red-500";
            case "medium": return "bg-yellow-500";
            case "strong": return "bg-green-500";
            default: return "bg-gray-300";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-6xl bg-gradient-to-br from-blue-400 to-white-600 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* LEFT – RESET PASSWORD FORM */}
                <div className="p-8 md:p-12 text-white">
                    <h2 className="text-3xl font-semibold mb-6">Reset Password</h2>
                    <p className="text-sm mb-8">
                        Enter your new password for {email || "your account"}
                    </p>

                    <form className="space-y-5" onSubmit={handleResetPassword}>

                        {/* New Password */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={handlePasswordChange}
                                placeholder="New Password *"
                                required
                                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <span
                                className="absolute right-3 top-3 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </span>
                        </div>

                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="space-y-1">
                                <div className="flex gap-1 h-1">
                                    <div className={`flex-1 rounded-full ${passwordStrength === "weak" ? getStrengthColor() : "bg-gray-300"}`}></div>
                                    <div className={`flex-1 rounded-full ${passwordStrength === "medium" || passwordStrength === "strong" ? getStrengthColor() : "bg-gray-300"}`}></div>
                                    <div className={`flex-1 rounded-full ${passwordStrength === "strong" ? getStrengthColor() : "bg-gray-300"}`}></div>
                                </div>
                                <p className="text-xs capitalize">{passwordStrength} password</p>
                            </div>
                        )}

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrorMsg("");
                                }}
                                placeholder="Confirm Password *"
                                required
                                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <span
                                className="absolute right-3 top-3 cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </span>
                        </div>

                        {/* Password Match Indicator */}
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-red-300 text-xs">Passwords do not match</p>
                        )}

                        {/* ERROR MESSAGE */}
                        {errorMsg && (
                            <div className="bg-red-500/20 border border-red-400/40 text-red-700 px-4 py-2 rounded-md text-sm">
                                {errorMsg}
                            </div>
                        )}

                        {/* SUCCESS MESSAGE */}
                        {successMsg && (
                            <div className="bg-green-500/20 border border-green-400/40 text-green-700 px-4 py-2 rounded-md text-sm">
                                {successMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                            className="w-full bg-white text-purple-600 font-bold py-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>

                        <div className="text-center text-base mt-4">
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-800 font-medium no-underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>

                {/* RIGHT – IMAGE */}
                <div className="hidden md:flex items-center justify-center relative">
                    <img
                        src="https://cdni.iconscout.com/illustration/premium/thumb/register-illustration-svg-download-png-2918388.png"
                        alt="reset password"
                        className="w-[85%] max-w-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;