// VerifyOTP.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosInstance from "../helper/AxiosInstance";

const VerifyOTP = () => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        // Redirect if no email in state
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0 && !canResend) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown, canResend]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            // First verify OTP (you might need a separate endpoint for OTP verification)
            // Or directly proceed to reset password page
            navigate("/reset-password", { state: { email, otp } });

        } catch (error) {
            const apiMessage = error.response?.data?.message;
            setErrorMsg(apiMessage || "Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        setErrorMsg("");
        
        try {
            await axiosInstance.post("/user/forgot/password/request", null, {
                params: { email }
            });
            
            setSuccessMsg("OTP resent successfully!");
            setCountdown(30);
            setCanResend(false);
        } catch (error) {
            const apiMessage = error.response?.data?.message;
            setErrorMsg(apiMessage || "Failed to resend OTP.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-6xl bg-gradient-to-br from-blue-400 to-white-600 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                {/* LEFT – VERIFY OTP FORM */}
                <div className="p-8 md:p-12 text-white">
                    <h2 className="text-3xl font-semibold mb-6">Verify OTP</h2>
                    <p className="text-sm mb-8">
                        Enter the OTP sent to {email || "your email"}
                    </p>

                    <form className="space-y-5" onSubmit={handleVerifyOTP}>

                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => {
                                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                                setErrorMsg("");
                            }}
                            placeholder="Enter 6-digit OTP *"
                            maxLength="6"
                            required
                            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white text-center text-2xl tracking-widest"
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
                            disabled={isLoading || otp.length !== 6}
                            className="w-full bg-white text-purple-600 font-bold py-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={!canResend || resendLoading}
                                className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendLoading ? "Resending..." : 
                                 canResend ? "Resend OTP" : `Resend OTP in ${countdown}s`}
                            </button>
                        </div>

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
                        alt="verify otp"
                        className="w-[85%] max-w-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;