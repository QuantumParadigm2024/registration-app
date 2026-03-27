import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  User, 
  MessageSquare, 
  Briefcase,
  Clock,
  CheckCircle,
  Shield,
  Users
} from 'lucide-react';
import Navbar from './Navbar';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const eventTypes = [
    'Corporate Conference',
    'Sales Kick-off',
    'Exhibition & Trade Show',
    'Workshop & Training',
    'Private Gathering',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventType: '',
        message: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '+91 8431404729',
      link: 'tel:+918431404729',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'info@planetechervents.com',
      link: 'mailto:info@planetechervents.com',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: 'Planotech Events & Marketing (OPC) Pvt Ltd 49 2nd Floor, Ravish Gardenia, Post, near Rainbow Layout, Vidyaranyapura, Vaderahalli, Bengaluru, Karnataka 560097',
      link: null,
      color: 'bg-red-100 text-red-600'
    }
  ];

  const stats = [
    { number: '500+', label: 'Events Managed', icon: Briefcase },
    { number: '50K+', label: 'Happy Attendees', icon: Users },
    { number: '24/7', label: 'Support Available', icon: Clock },
    { number: '100%', label: 'Data Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar/>
        {/* Hero Section */}
        <motion.div
          variants={fadeIn('down', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600">
            Ready to transform your event management experience? Our team is here to help you create seamless, 
            intelligent registration solutions tailored to your needs.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={fadeIn('up', 0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mb-4">
                <stat.icon size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols gap-12">
          
         
          {/* <motion.div
            variants={fadeIn('right', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book a Demo</h2>
            <p className="text-gray-500 mb-6">
              Schedule a personalized demo to see how RegisterPro can transform your events.
            </p>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-green-700">Thank you! Our team will get back to you shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white"
                  >
                    <option value="">Select event type</option>
                    {eventTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Tell us about your event requirements..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting this form, you agree to our privacy policy. We'll never share your information.
              </p>
            </form>
          </motion.div> */}

          {/* Contact Information */}
          <motion.div
            variants={fadeIn('left', 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${info.color}`}>
                      <info.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.title}</h3>
                      {info.link ? (
                        <a href={info.link} className="text-red-600 hover:text-red-700 mt-1 inline-block">
                          {info.details}
                        </a>
                      ) : (
                        <p className="text-gray-600 mt-1">{info.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features Highlight */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose RegisterPro?</h3>
              <ul className="space-y-3">
                {[
                  'Smart event registration & check-in platform',
                  'Real-time QR code confirmation system',
                  'Contactless verification with badge printing',
                  'Enterprise-grade security & data privacy',
                  'Dedicated 24/7 customer support'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Response Note */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
              <Clock className="mx-auto text-red-600 mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 mb-1">Quick Response</h3>
              <p className="text-sm text-gray-500">
                Our team typically responds within 24 hours. For urgent inquiries, please call us directly.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Office Location Section */}
        <motion.div
          variants={fadeIn('up', 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Global Presence</h2>
              <p className="text-gray-600 mb-6">
                With headquarters in Mumbai and support teams ready to assist you worldwide, 
                we're always close to help you deliver exceptional events.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-red-600" />
                  <span className="text-gray-700">Planotech Group, Bengaluru, Karnataka India</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-red-600" />
                  <span className="text-gray-700">Monday - Friday: 9:00 AM - 7:00 PM IST</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 md:p-10 text-white">
              <h3 className="text-xl font-bold mb-3">Ready to streamline your events?</h3>
              <p className="text-red-100 mb-6">
                Join hundreds of organizations that trust RegisterPro for seamless event registration and check-in.
              </p>
              <a
                href="tel:+918431404729"
                className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-2.5 rounded-lg font-medium hover:bg-red-50 transition"
              >
                <Phone size={18} />
                Call Us Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;