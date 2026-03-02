import React, { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { motion } from "framer-motion";
import { fadeIn } from "../utils/motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import QPBigLogo from '/src/assets/QP_Big.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/about", label: "About Us" },
        { path: "/privacyPolicy", label: "Privacy Policy" },
    ];

    return (
        <motion.nav
            variants={fadeIn("down", 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200 shadow-sm"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">

                {/* LOGO */}
                <motion.div
                    variants={fadeIn("right", 0.3)}
                    className="cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <img
                        src={QPBigLogo}
                        alt="AI Lume"
                        className="h-12 object-contain"
                    />
                </motion.div>

                {/* DESKTOP LINKS */}
                <motion.div
                    variants={fadeIn("down", 0.3)}
                    className="hidden md:flex items-center gap-10"
                >
                    {navLinks.map((link, index) => (
                        <motion.div
                            key={index}
                            variants={fadeIn("down", 0.1 * (index + 1))}
                        >
                            <Link
                                to={link.path}
                                className={`text-sm font-medium relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-red-600 after:transition-all
                                ${location.pathname === link.path
                                        ? "text-red-600 after:w-full"
                                        : "text-gray-600 after:w-0 hover:text-gray-900 hover:after:w-full"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* DESKTOP CTA */}
                <motion.button
                    variants={fadeIn("left", 0.3)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/login")}
                    className="hidden md:block bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                >
                    Get Started
                </motion.button>

                {/* MOBILE MENU BUTTON */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                </button>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <motion.div
                    variants={fadeIn("down", 0.2)}
                    initial="hidden"
                    animate="show"
                    className="md:hidden bg-white border-t border-gray-200"
                >
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        {navLinks.map((link, index) => (
                            <motion.div
                                key={index}
                                variants={fadeIn("right", 0.1 * (index + 1))}
                            >
                                <Link
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block text-sm font-medium
                                    ${location.pathname === link.path
                                            ? "text-red-600"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}

                        <motion.button
                            variants={fadeIn("up", 0.3)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                setIsMenuOpen(false);
                                navigate("/login");
                            }}
                            className="w-full bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
                        >
                            Get Started
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;