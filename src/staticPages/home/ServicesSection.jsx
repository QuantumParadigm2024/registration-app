import { motion } from "framer-motion";
import { fadeIn, textVariant } from "../../utils/motion";
import EventIcon from '@mui/icons-material/Event';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DomainVerificationIcon from '@mui/icons-material/DomainVerification';

const ServicesSection = () => {
    const services = [
        {
            icon: <EventIcon className="w-8 h-8 text-indigo-600" />,
            title: "Event Enablement",
            description: "We deliver a structured digital framework that enables organizations to plan, manage, and execute event registrations with precision and consistency.",
            link: "#learn-more"
        },
        {
            icon: <DirectionsWalkIcon className="w-8 h-8 text-amber-400" />,
            title: "Attendee Identity & Access Management",
            description: "Our service ensures secure attendee identification and controlled access through digital verification and real-time validation mechanisms.",
            link: "#learn-more"
        },
        {
            icon: <AdminPanelSettingsIcon className="w-8 h-8 text-red-400" />,
            title: "Operational Oversight & Governance",
            description: "We provide administrators with centralized visibility and control over registration activity, attendance flow, and event operations.",
            link: "#learn-more"
        },
        {
            icon: <DomainVerificationIcon className="w-8 h-8 text-cyan-400" />,
            title: "Scalable Event Technology Platform",
            description: "Our technology is designed to support evolving event requirements, ensuring reliability, performance, and security across events of varying scale.",
            link: "#learn-more"
        }
    ]

    return (
        <section id="services" className="py-16">
            <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
                <motion.div
                    variants={fadeIn('up', 0.3)}
                    className='flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12'
                >
                    {/* Left Content */}
                    <motion.div
                        variants={fadeIn('right', 0.4)}
                        className="lg:w-2/5"
                    >
                        <motion.h2
                            variants={textVariant(0.2)}
                            className="text-3xl font-bold mb-4 leading-tight"
                        >
                            We offer a secure and scalable event registration service that simplifies registration.
                        </motion.h2>
                        <motion.p
                            variants={fadeIn('up', 0.5)}
                            className="text-gray-600 text-lg mb-6"
                        >
                            Our services cover online registration, QR-based confirmation, and real-time check-in
                        </motion.p>

                        {/* Features List */}
                        <motion.div
                            variants={fadeIn('up', 0.6)}
                            className="space-y-2 mb-8"
                        >
                            {[
                                "Secure Online Registration",
                                "Optional Payment Gateway Integration",
                                "Instant Confirmation & QR Code",
                                "Fast On-Spot Check-In",
                                "Real-Time Attendee Dashboard",
                                "Admin-Controlled Registration Flow"
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeIn('right', 0.7 + index * 0.1)}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                                    </div>
                                    <span className="text-gray-600">{feature}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.button
                            variants={fadeIn('up', 0.9)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-red-600 text-white px-8 py-3 cursor-pointer rounded-full hover:bg-red-700 transition-colors"
                        >
                            Get started
                        </motion.button>
                    </motion.div>

                    {/* Right Content - Service Cards */}
                    <motion.div
                        variants={fadeIn('left', 0.4)}
                        className="lg:w-3/5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {services.map((service, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeIn('up', 0.3 * (index + 1))}
                                    whileHover={{
                                        scale: 1.02,
                                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)"
                                    }}
                                    className="bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-gray-100"
                                >
                                    <motion.div
                                        variants={fadeIn('down', 0.4 * (index + 1))}
                                        className="mb-3"
                                    >
                                        {service.icon}
                                    </motion.div>
                                    <motion.h3
                                        variants={textVariant(0.3)}
                                        className="text-lg font-semibold mb-2 line-clamp-2"
                                    >
                                        {service.title}
                                    </motion.h3>
                                    <motion.p
                                        variants={fadeIn('up', 0.5 * (index + 1))}
                                        className="text-gray-600 text-sm mb-3 line-clamp-3"
                                    >
                                        {service.description}
                                    </motion.p>
                                    <motion.a
                                        variants={fadeIn('up', 0.6 * (index + 1))}
                                        href={service.link}
                                        className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors inline-flex items-center gap-1"
                                    >
                                        LEARN MORE →
                                    </motion.a>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default ServicesSection