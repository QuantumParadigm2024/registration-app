// ForgotPassword.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../helper/AxiosInstance";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            await axiosInstance.post("/user/forgot/password/request", null, {
                params: { email }
            });

            setSuccessMsg("OTP sent successfully to your email!");
            
            // Navigate to OTP verification page after 2 seconds
            setTimeout(() => {
                navigate("/verify-otp", { state: { email } });
            }, 2000);

        } catch (error) {
            if (error.response?.data?.message?.includes("Duplicate entry") || 
            error.response?.data?.message?.includes("constraint")) {
            setErrorMsg("An OTP has already been sent to this email. Please check your inbox or try again later.");
        } else {
            const apiMessage = error.response?.data?.message;
            setErrorMsg(apiMessage || "Failed to send OTP. Please try again.");
        }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-6xl bg-gradient-to-br from-blue-400 to-white-600 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* LEFT – FORGOT PASSWORD FORM */}
                <div className="p-8 md:p-12 text-white">
                    <h2 className="text-3xl font-semibold mb-6">Forgot Password?</h2>
                    <p className="text-sm mb-8">
                        Enter your email address and we'll send you an OTP to reset your password.
                    </p>

                    <form className="space-y-5" onSubmit={handleRequestOTP}>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrorMsg("");
                            }}
                            placeholder="Email *"
                            required
                            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                        />

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
                            disabled={isLoading}
                            className="w-full bg-white text-purple-600 font-bold py-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Sending..." : "Send OTP"}
                        </button>

                        <div className="text-center text-base mt-4 space-y-2">
                            <p>
                                Remember your password?{" "}
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-800 font-medium no-underline"
                                >
                                    Login
                                </Link>
                            </p>
                            <p>
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="text-blue-600 hover:text-blue-800 font-medium no-underline"
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* RIGHT – IMAGE */}
                <div className="hidden md:flex items-center justify-center relative">
                    <img
                        src="https://cdni.iconscout.com/illustration/premium/thumb/register-illustration-svg-download-png-2918388.png"
                        alt="forgot password"
                        className="w-[85%] max-w-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;