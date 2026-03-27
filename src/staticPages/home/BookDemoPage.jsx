import React, { useState, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import Navbar from '../Navbar';


emailjs.init("8vvP6E39-gZJGCo27");

const BookDemoPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    scheduleDate: "",
    scheduleTime: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ show: false, type: "", message: "" });
  const [minDate, setMinDate] = useState("");
  const [activeFeature, setActiveFeature] = useState(0);

  // EmailJS Configuration
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_6wmrxes",
    TEMPLATE_ID: "template_3co3h9b"
  };

  useEffect(() => {
    // Set minimum date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setMinDate(`${year}-${month}-${day}`);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus({ show: false, type: "", message: "" });

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.organization || !formData.scheduleDate || !formData.scheduleTime) {
      setSubmitStatus({
        show: true,
        type: "error",
        message: "Please fill in all required fields"
      });
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        show: true,
        type: "error",
        message: "Please enter a valid email address"
      });
      setLoading(false);
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setSubmitStatus({
        show: true,
        type: "error",
        message: "Please enter a valid 10-digit phone number"
      });
      setLoading(false);
      return;
    }

    try {
      const templateParams = {
        to_email: "info@quantumparadigm.in",
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        schedule_date: formData.scheduleDate,
        schedule_time: formData.scheduleTime,
        booking_id: `DEMO-${Date.now()}`,
        message: formData.message || `Demo booking request from ${formData.name} at ${formData.organization}`,
        reply_to: formData.email
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        setSubmitStatus({
          show: true,
          type: "success",
          message: "✅ Demo booked successfully! Our team will contact you within 24 hours."
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          organization: "",
          scheduleDate: "",
          scheduleTime: "",
          message: ""
        });

        setTimeout(() => {
          navigate("/");
        }, 4000);
      } else {
        throw new Error(`Failed to send: ${response.text}`);
      }
    } catch (error) {
      console.error("Email send error details:", error);

      let errorMessage = "❌ Unable to book demo. ";
      if (error.text && error.text.includes("recipients address is empty")) {
        errorMessage += "Please check your EmailJS template configuration.";
      } else if (error.text) {
        errorMessage += error.text;
      } else {
        errorMessage += "Please try again or contact us directly.";
      }

      setSubmitStatus({
        show: true,
        type: "error",
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced features data with icons and detailed descriptions
  const features = [
    {
      icon: "fas fa-chalkboard-user",
      title: "Unified Dashboard",
      description: "Streamlines the creation and oversight of all events from a single, intuitive interface.",
      stats: "100+ events managed daily",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: "fas fa-people-arrows",
      title: "Structured Collaboration",
      description: "Enables seamless teamwork by allowing multiple team members to work within the same environment.",
      stats: "10+ team members per event",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "fas fa-chart-line",
      title: "Operational Efficiency",
      description: "Reduces friction in workflows by organizing event tasks and data in one location.",
      stats: "60% faster setup time",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "fas fa-chart-simple",
      title: "Measurable Insights",
      description: "Delivers data-driven analytics to evaluate event success and ROI with precision.",
      stats: "Real-time reporting",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "fas fa-shield-alt",
      title: "Execution Confidence",
      description: "Empowers teams to manage high-stakes environments through reliable, stress-tested tools.",
      stats: "99.9% uptime guaranteed",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: "fas fa-robot",
      title: "AI-Powered Automation",
      description: "Smart triggers and automated workflows reduce manual tasks by up to 70%.",
      stats: "24/7 automated processes",
      color: "from-yellow-500 to-red-500"
    }
  ];

  const targetVerticals = [
    { name: "Corporate Conferences", icon: "fas fa-building", count: "500+ events", desc: "High-level summits requiring professional management" },
    { name: "Sales Kick-offs", icon: "fas fa-chart-simple", count: "300+ events", desc: "Internal teams and stakeholder alignment" },
    { name: "Exhibitions & Trade Shows", icon: "fas fa-store", count: "200+ events", desc: "Complex logistics and high-volume attendee flow" },
    { name: "Enterprise Events", icon: "fas fa-crown", count: "150+ events", desc: "Security and scalability for large organizations" },
    { name: "Virtual Summits", icon: "fas fa-video", count: "400+ events", desc: "Seamless hybrid and virtual event experiences" },
    { name: "Workshops & Training", icon: "fas fa-chalkboard", count: "600+ sessions", desc: "Interactive learning and certification events" }
  ];

  const workflowSteps = [
    {
      icon: "fas fa-mouse-pointer",
      title: "Smart Registration",
      description: "Attendees register via branded forms with custom fields",
      time: "30 seconds"
    },
    {
      icon: "fas fa-envelope",
      title: "Instant Confirmation",
      description: "Automated email with event details and QR code",
      time: "Real-time"
    },
    {
      icon: "fas fa-qrcode",
      title: "Digital Badge",
      description: "Unique QR code for secure check-in and tracking",
      time: "Secure"
    },
    {
      icon: "fas fa-mobile-alt",
      title: "Contactless Check-in",
      description: "Rapid scan using mobile devices for fast entry",
      time: "< 2 seconds"
    },
    {
      icon: "fas fa-print",
      title: "Automated Badge Print",
      description: "Instant professional badge printing on check-in",
      time: "5 seconds"
    }
  ];


  const stats = [
    { value: "50K+", label: "Events Managed", icon: "fas fa-calendar-check" },
    { value: "2M+", label: "Attendees Served", icon: "fas fa-users" },
    { value: "98%", label: "Satisfaction Rate", icon: "fas fa-smile" },
    { value: "24/7", label: "Support Available", icon: "fas fa-headset" }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section with Enhanced Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 pt-32 pb-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Live Demo Available</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Smart Event Registration.
                <span className="block text-yellow-200">Seamless Execution.</span>
              </h1>

              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                The intelligent event registration and check-in platform trusted by industry leaders.
                Transform your events with automation, real-time analytics, and unparalleled attendee experience.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-yellow-300"></i>
                  <span className="text-sm">Unified Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-yellow-300"></i>
                  <span className="text-sm">AI-Powered Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-yellow-300"></i>
                  <span className="text-sm">Real-time Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-yellow-300"></i>
                  <span className="text-sm">Enterprise Security</span>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2">
                      <i className={`${stat.icon} text-yellow-300`}></i>
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-xs text-white/80">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Demo</h2>
                <p className="text-gray-600">Experience RegisterPro in action with a personalized walkthrough</p>
                {/* <div className="flex items-center justify-center gap-2 mt-3">
                  <i className="fas fa-clock text-gray-400 text-sm"></i>
                  <span className="text-xs text-gray-500">30-min interactive session</span>
                  <i className="fas fa-users text-gray-400 text-sm ml-2"></i>
                  <span className="text-xs text-gray-500">Team up to 5 members</span>
                </div> */}
              </div>

              {submitStatus.show && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg ${submitStatus.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                  {submitStatus.message}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="scheduleDate"
                      value={formData.scheduleDate}
                      onChange={handleChange}
                      min={minDate}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="scheduleTime"
                      value={formData.scheduleTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="Tell us about your event needs, attendee count, or specific requirements..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Booking Demo...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calendar-check"></i>
                      Schedule Your Free Demo
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                <i className="fas fa-lock mr-1"></i> Your information is secure. No spam, ever.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
                  
      {/* Core Platform Pillars - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Platform Pillars
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built to support enterprise-grade events with operational clarity and execution confidence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 shadow-md`}>
                  <i className={`${feature.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-3">{feature.description}</p>
                <div className="text-xs text-red-500 font-medium">
                  <i className="fas fa-chart-line mr-1"></i> {feature.stats}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Event Verticals - Enhanced */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powering events across diverse industries and scales
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {targetVerticals.map((vertical, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className={`${vertical.icon} text-red-500 text-xl`}></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{vertical.name}</h3>
                <p className="text-xs text-gray-500">{vertical.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Process - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamless Event Workflow
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From registration to check-in, everything automated for maximum efficiency
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-red-200 via-red-400 to-red-200 transform -translate-y-1/2"></div>
            <div className="grid md:grid-cols-5 gap-6 relative">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center relative z-10"
                >
                  <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-red-100 relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <i className={`${step.icon} text-white text-xl`}></i>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{step.description}</p>
                  <p className="text-xs text-red-500 font-medium">
                    <i className="fas fa-clock mr-1"></i> {step.time}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Security Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                <i className="fas fa-shield-alt text-yellow-400"></i>
                <span className="text-sm">Enterprise-Grade Security</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Data Security & Privacy</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                At RegisterPro, we prioritize the security and privacy of your event and attendee data.
                Our platform is built with robust measures to ensure your information remains protected at every stage.
              </p>
              <ul className="space-y-3">
                {[
                  "Secure cloud-based storage with controlled access",
                  "No data sharing or selling to third parties",
                  "Role-based access control for team members",
                  "Regular backups and system safeguards",
                  "Globally hosted servers with high availability",
                  "GDPR and CCPA compliant"
                ].map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-2"
                  >
                    <i className="fas fa-check-circle text-green-400 mt-1"></i>
                    <span className="text-gray-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <i className="fas fa-certificate text-4xl text-yellow-400 mb-3"></i>
                  <h3 className="text-xl font-semibold mb-2">Security Certifications</h3>
                  <p className="text-sm text-gray-300">ISO 27001 Certified • SOC 2 Type II</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <i className="fas fa-lock text-2xl text-green-400 mb-2"></i>
                    <p className="text-xs">256-bit Encryption</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <i className="fas fa-database text-2xl text-blue-400 mb-2"></i>
                    <p className="text-xs">Automated Backups</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <i className="fas fa-user-shield text-2xl text-purple-400 mb-2"></i>
                    <p className="text-xs">Access Control</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <i className="fas fa-chart-line text-2xl text-orange-400 mb-2"></i>
                    <p className="text-xs">Audit Logs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action - Enhanced */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Events?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations using RegisterPro for seamless event management and unforgettable experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <i className="fas fa-calendar-alt"></i>
                Book Your Demo Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = "tel:+918431404729"}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-phone-alt"></i>
                +91 8431404729
              </motion.button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span><i className="fas fa-headset mr-1"></i> 24/7 Support</span>
              <span><i className="fas fa-chart-line mr-1"></i> Free Consultation</span>
              <span><i className="fas fa-rocket mr-1"></i> Quick Setup</span>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              or email us at <a href="mailto:info@planetechervents.com" className="text-red-600 hover:underline">info@planetechervents.com</a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BookDemoPage;


