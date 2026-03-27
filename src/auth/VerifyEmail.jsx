// VerifyEmail.jsx
import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../helper/AxiosInstance";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Get email from location state or localStorage
        const storedEmail = location.state?.email || localStorage.getItem('verificationEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            // If no email found, redirect to register
            navigate('/register');
        }
    }, [location, navigate]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;

        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace to go to previous input
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const pastedOtp = pastedData.replace(/\D/g, '').slice(0, 6);

        if (pastedOtp) {
            const otpArray = pastedOtp.split('');
            const newOtp = [...otp];
            for (let i = 0; i < otpArray.length && i < 6; i++) {
                newOtp[i] = otpArray[i];
            }
            setOtp(newOtp);

            // Focus on the next empty input or last filled
            const nextIndex = Math.min(otpArray.length, 5);
            const nextInput = document.getElementById(`otp-${nextIndex}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter the 6-digit verification code');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Send OTP verification with query parameters
            const response = await axiosInstance.post(
                '/user/verify-email',
                {},
                {
                    params: {
                        email: email,
                        otp: otpValue
                    }
                }
            );

            // Show success message from response
            setSuccess(response.data.message || 'Email verified successfully! Redirecting to login...');
            localStorage.removeItem('verificationEmail');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'Invalid verification code');
            } else if (error.request) {
                setError('Network error. Please check your connection.');
            } else {
                setError('Failed to verify email. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            // Resend OTP via POST request
            const response = await axiosInstance.post('/user/resend-otp', {
                email: email
            });

            setSuccess(response.data.message || 'Verification code sent successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);

            // Clear OTP inputs
            setOtp(['', '', '', '', '', '']);

            // Focus on first OTP input
            const firstInput = document.getElementById('otp-0');
            if (firstInput) firstInput.focus();

        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'Failed to resend code');
            } else if (error.request) {
                setError('Network error. Please check your connection.');
            } else {
                setError('Failed to resend verification code. Please try again.');
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
                        <p className="text-purple-100 text-sm">
                            We've sent a verification code to
                        </p>
                        <p className="text-white font-medium text-base mt-1 break-all">{email}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-shake">
                                <ErrorIcon className="text-red-500" fontSize="small" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <CheckCircleIcon className="text-green-500" fontSize="small" />
                                <p className="text-green-600 text-sm">{success}</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-3 text-center">
                                Enter 6-digit verification code
                            </label>
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            {/* OTP helper text */}
                            <p className="text-center text-gray-400 text-xs mt-3">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : 'Verify Email'}
                        </button>

                        <div className="mt-6 text-center">
                            <p className="text-gray-600 text-sm">
                                Didn't receive the code?{' '}
                                <button
                                    onClick={handleResendOtp}
                                    disabled={isResending}
                                    className="text-purple-600 font-medium hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResending ? 'Sending...' : 'Resend Code'}
                                </button>
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                            <Link
                                to="/register"
                                className="text-gray-500 text-sm hover:text-purple-600 transition flex items-center justify-center gap-1"
                            >
                                <span>←</span> Back to Registration
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-4 text-center space-y-2">
                    <p className="text-gray-500 text-xs">
                        Please check your spam folder if you don't see the email in your inbox.
                    </p>
                    <p className="text-gray-400 text-xs">
                        You can paste the code using Ctrl+V or Cmd+V
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;