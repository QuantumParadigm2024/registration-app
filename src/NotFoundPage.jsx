import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./staticPages/Navbar";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* 404 Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 min-h-[calc(100vh-80px)] flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            {/* 404 Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <div className="text-8xl md:text-9xl font-black text-white/20 absolute inset-0 blur-xl">
                  404
                </div>
                <h1 className="text-8xl md:text-9xl font-black text-white relative">
                  404
                </h1>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl md:text-3xl font-semibold text-white mb-4"
            >
              Page Not Found
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/80 mb-8"
            >
              The page you're looking for doesn't exist or has been moved.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                <i className="fas fa-arrow-left"></i>
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;