import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import { Link } from 'react-router-dom';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showconfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-6xl bg-gradient-to-br from-purple-500 to-white-400 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                {/* LEFT – FORM */}
                <div className="p-6 md:p-12 text-white">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-4">Create Account</h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Full name *"
                            className="w-full px-4 py-2.5 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <input
                            type="email"
                            placeholder="Email *"
                            className="w-full px-4 py-2.5 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <div className="flex">
                            <input
                                type="tel"
                                placeholder="Phone number *"
                                className="w-full px-4 py-2.5 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password *"
                                className="w-full px-4 py-2.5 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <span
                                className="absolute right-3 top-2.5 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type={showconfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password *"
                                className="w-full px-4 py-2.5 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <span
                                className="absolute right-3 top-2.5 cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showconfirmPassword)}
                            >
                                {showconfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm opacity-90">Register as *</p>
                            <div className="flex gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="registerType"
                                    value="organization"
                                    className="accent-black"
                                />
                                <span>Organization</span>
                                <input
                                    type="radio"
                                    name="registerType"
                                    value="event"
                                    className="accent-black"
                                />
                                <span>Event</span>
                            </div>
                        </div>
                        
                        <button className="w-full bg-white text-purple-600 font-bold py-2.5 rounded-full hover:bg-gray-100 transition mt-2">
                            Create
                        </button>

                        <p className="text-center text-base mt-4">
                            Already a member?{" "}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer no-underline"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
                {/* RIGHT – IMAGE */}
                <div className="hidden md:flex items-center justify-center relative">
                    <img
                        src="https://www.dreamcast.in/wp-content/uploads/2024/07/mobile-banner.png"
                        alt="register"
                        className="w-[85%] max-w-md"
                    />
                    {/* Decorative circles */}
                    <div className="absolute w-24 h-24 bg-red-400 rounded-full top-10 right-16 opacity-80"></div>
                    <div className="absolute w-26 h-26 bg-pink-500 rounded-full bottom-16 left-10 opacity-80"></div>
                    <div className="absolute w-26 h-26 bg-purple-400 rounded-full bottom-76 left-127 opacity-60"></div>
                </div>
            </div>
        </div>
    );
}

export default Register