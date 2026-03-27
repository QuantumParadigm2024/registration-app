import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../helper/AxiosInstance';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showconfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Format phone number to only allow digits
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length <= 10) {
                setFormData(prev => ({
                    ...prev,
                    [name]: digitsOnly
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
        validateField(field, formData[field]);
    };

    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'name':
                if (!value.trim()) {
                    error = 'Full name is required';
                } else if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters';
                } else if (value.trim().length > 50) {
                    error = 'Name must be less than 50 characters';
                }
                break;

            case 'email':
                if (!value.trim()) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address (e.g., name@example.com)';
                }
                break;

            case 'phone':
                if (!value) {
                    error = 'Phone number is required';
                } else if (!/^\d{10}$/.test(value)) {
                    error = 'Phone number must be exactly 10 digits';
                }
                break;

            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 6) {
                    error = 'Password must be at least 6 characters';
                } else if (value.length > 20) {
                    error = 'Password must be less than 20 characters';
                } else if (!/(?=.*[a-z])/.test(value)) {
                    error = 'Password must contain at least one lowercase letter';
                } else if (!/(?=.*[A-Z])/.test(value)) {
                    error = 'Password must contain at least one uppercase letter';
                } else if (!/(?=.*\d)/.test(value)) {
                    error = 'Password must contain at least one number';
                } else if (!/(?=.*[@$!%*?&])/.test(value)) {
                    error = 'Password must contain at least one special character (@$!%*?&)';
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    error = 'Please confirm your password';
                } else if (value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;

            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }));

        return error === '';
    };

    const validateForm = () => {
        const fields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
        let isValid = true;

        fields.forEach(field => {
            const isFieldValid = validateField(field, formData[field]);
            if (!isFieldValid) isValid = false;
        });

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            phone: true,
            password: true,
            confirmPassword: true
        });

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/user/signup', {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone
            });

            // Store email for verification page
            localStorage.setItem('verificationEmail', formData.email);

            // Navigate to email verification page
            navigate('/verify-email', {
                state: { email: formData.email }
            });

        } catch (error) {
            if (error.response) {
                setApiError(error.response.data.message || 'Registration failed. Please try again.');
            } else if (error.request) {
                setApiError('Network error. Please check your connection.');
            } else {
                setApiError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, text: '', color: '' };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;

        if (strength <= 2) return { strength, text: 'Weak', color: 'bg-red-500' };
        if (strength <= 4) return { strength, text: 'Medium', color: 'bg-yellow-500' };
        return { strength, text: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-6xl bg-gradient-to-br from-purple-400 to-pink-300 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                {/* LEFT – FORM */}
                <div className="p-6 md:p-12 text-white">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-4">Create Account</h2>

                    {apiError && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-sm">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full name *"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={() => handleBlur('name')}
                                className={`w-full px-4 py-2.5 rounded-md bg-white/10 border ${errors.name && touched.name ? 'border-red-400' : 'border-white/20'
                                    } focus:outline-none focus:ring-2 focus:ring-white transition`}
                            />
                            {errors.name && touched.name && (
                                <p className="text-red-300 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email *"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => handleBlur('email')}
                                className={`w-full px-4 py-2.5 rounded-md bg-white/10 border ${errors.email && touched.email ? 'border-red-400' : 'border-white/20'
                                    } focus:outline-none focus:ring-2 focus:ring-white transition`}
                            />
                            {errors.email && touched.email && (
                                <p className="text-red-300 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone number * (10 digits)"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={() => handleBlur('phone')}
                                className={`w-full px-4 py-2.5 rounded-md bg-white/10 border ${errors.phone && touched.phone ? 'border-red-400' : 'border-white/20'
                                    } focus:outline-none focus:ring-2 focus:ring-white transition`}
                            />
                            {errors.phone && touched.phone && (
                                <p className="text-red-300 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password * (min. 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('password')}
                                    className={`w-full px-4 py-2.5 rounded-md bg-white/10 border ${errors.password && touched.password ? 'border-red-400' : 'border-white/20'
                                        } focus:outline-none focus:ring-2 focus:ring-white transition pr-10`}
                                />
                                <span
                                    className="absolute right-3 top-2.5 cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </span>
                            </div>

                            {/* Password strength indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 h-1.5">
                                        {[...Array(6)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-full ${i < passwordStrength.strength ? passwordStrength.color : 'bg-white/30'
                                                    } transition-all`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs mt-1 ${passwordStrength.strength <= 2 ? 'text-red-300' :
                                            passwordStrength.strength <= 4 ? 'text-yellow-300' : 'text-green-300'
                                        }`}>
                                        Password strength: {passwordStrength.text}
                                    </p>
                                </div>
                            )}

                            {errors.password && touched.password && (
                                <p className="text-red-300 text-xs mt-1">{errors.password}</p>
                            )}

                            {/* Password requirements list */}
                            {!errors.password && formData.password && touched.password && (
                                <ul className="text-xs text-white/70 mt-1 space-y-0.5">
                                    <li className={formData.password.length >= 6 ? 'text-green-300' : ''}>
                                        ✓ At least 6 characters
                                    </li>
                                    <li className={/[a-z]/.test(formData.password) ? 'text-green-300' : ''}>
                                        ✓ Lowercase letter (a-z)
                                    </li>
                                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-300' : ''}>
                                        ✓ Uppercase letter (A-Z)
                                    </li>
                                    <li className={/[0-9]/.test(formData.password) ? 'text-green-300' : ''}>
                                        ✓ Number (0-9)
                                    </li>
                                    <li className={/[@$!%*?&]/.test(formData.password) ? 'text-green-300' : ''}>
                                        ✓ Special character (@$!%*?&)
                                    </li>
                                </ul>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <input
                                    type={showconfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password *"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    className={`w-full px-4 py-2.5 rounded-md bg-white/10 border ${errors.confirmPassword && touched.confirmPassword ? 'border-red-400' : 'border-white/20'
                                        } focus:outline-none focus:ring-2 focus:ring-white transition pr-10`}
                                />
                                <span
                                    className="absolute right-3 top-2.5 cursor-pointer"
                                    onClick={() => setShowConfirmPassword(!showconfirmPassword)}
                                >
                                    {showconfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </span>
                            </div>
                            {errors.confirmPassword && touched.confirmPassword && (
                                <p className="text-red-300 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-purple-600 font-bold py-2.5 rounded-full hover:bg-gray-100 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <p className="text-center text-base mt-4">
                            Already a member?{" "}
                            <Link
                                to="/login"
                                className="text-blue-300 hover:text-blue-200 font-medium cursor-pointer no-underline"
                            >
                                Login
                            </Link>
                        </p>
                    </form>
                </div>

                {/* RIGHT – IMAGE */}
                <div className="hidden md:flex items-center justify-center relative">
                    <img
                        src="https://www.dreamcast.in/wp-content/uploads/2024/07/mobile-banner.png"
                        alt="register"
                        className="w-[85%] max-w-md"
                    />
                    <div className="absolute w-24 h-24 bg-red-400 rounded-full top-10 right-16 opacity-80"></div>
                    <div className="absolute w-26 h-26 bg-pink-500 rounded-full bottom-16 left-10 opacity-80"></div>
                    <div className="absolute w-26 h-26 bg-purple-400 rounded-full bottom-76 left-127 opacity-60"></div>
                </div>
            </div>
        </div>
    );
}

export default Register;