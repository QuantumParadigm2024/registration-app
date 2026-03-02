import { motion } from "framer-motion";
import { fadeIn, textVariant } from "../../utils/motion";
import 'swiper/css';
import 'swiper/css/navigation';
import monitorCardBg from '../../assets/monitor-card.webp';

const MonitorSection = () => {
    return (
        <motion.section
            variants={fadeIn('up', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 py-16 md:py-24"
        >
            <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Left side - Content */}
                <motion.div
                    variants={fadeIn('right', 0.3)}
                    className="w-full md:w-1/2"
                >
                    <motion.span
                        variants={fadeIn('up', 0.4)}
                        className="text-emerald-500 font-semibold"
                    >
                        Smarter Management
                    </motion.span>
                    <motion.h2
                        variants={textVariant(0.5)}
                        className="text-3xl md:text-4xl font-bold text-navy-900 mt-4 mb-6 md:w-4/5"
                    >
                        Admin-Controlled Registration Workflow
                    </motion.h2>
                    <motion.p
                        variants={fadeIn('up', 0.6)}
                        className="text-gray-600 mb-8 md:w-4/5"
                    >
                        The platform provides administrators with complete control over the event registration process. Organizers can define how registrations are handled, including whether participants are automatically approved or require manual review before confirmation.<br /><br />
                        The workflow also enables organizers to monitor registration activity in real time, take action on pending or incomplete registrations, and maintain full oversight throughout the event lifecycle. By centralizing control with administrators, the system ensures accuracy, compliance, and operational efficiency.
                    </motion.p>
                    <motion.a
                        variants={fadeIn('up', 0.7)}
                        href="#"
                        className="text-blue-500 font-semibold flex items-center gap-2 hover:gap-4 transition-all"
                    >
                        Learn more
                        <motion.svg
                            variants={fadeIn('left', 0.8)}
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </motion.svg>
                    </motion.a>
                </motion.div>

                {/* Right side - Swiper with background */}
                <motion.div
                    variants={fadeIn('left', 0.3)}
                    className="w-full md:w-1/2 relative"
                >
                    <motion.div
                        variants={fadeIn('up', 0.4)}
                        className="p-4"
                    >
                        <motion.img
                            variants={fadeIn('up', 0.5)}
                            src="https://www.bizzabo.com/wp-content/uploads/2018/10/12-Registration-Pages-for-Events-That-Convert_16x9.png"
                            alt="Dashboard statistics"
                            className="w-full h-auto rounded-lg"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    )
}

export default MonitorSection 