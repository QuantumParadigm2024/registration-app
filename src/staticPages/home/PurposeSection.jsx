import { motion } from "framer-motion";
import { fadeIn, textVariant } from "../../utils/motion";

const PurposeSection = () => {
    const features = [
        {
            icon: "🟣", // Replace with your actual icon component or image
            title: "Event Management with Intelligent Precision",
            description: "Our platform harnesses the power of intelligent digital systems to deliver structured registrations, real-time attendee insights, and seamless access control. With an intuitive registration and verification workflow"
        },
        {
            icon: "🔴", // Replace with your actual icon component or image
            title: "In sync with your events",
            description: "we ensure smooth coordination, instant confirmations, and efficient on-site check-ins enhancing both organizer control and attendee experience."
        }
    ];

    return (
        <section id="about" className="w-full bg-gray-50 py-16 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    variants={fadeIn('right', 0.2)}
                    initial="hidden"
                    whileInView="show"
                    className="grid md:grid-cols-3 grid-cols-1 gap-8"
                >
                    <motion.div variants={fadeIn('right', 0.3)}>
                        <motion.div
                            variants={fadeIn('up', 0.4)}
                            className="text-sm text-purple-600 font-medium mb-2"
                        >
                            WHO WE ARE
                        </motion.div>
                        <motion.h2
                            variants={textVariant(0.5)}
                            className="text-1xl md:w-4/4 md:text-1xl font-bold text-gray-900"
                        >
                            We are a technology-driven event registration platform focused on simplifying how events are planned, managed, and executed. Our system is built to handle everything from attendee registrations to real-time check-ins using QR codes.
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        variants={fadeIn('left', 0.3)}
                        className="col-span-2 grid grid-cols-1 md:grid-cols-2 justify-between gap-8"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={fadeIn('up', 0.3 * (index + 1))}
                                className="flex items-start space-x-4"
                            >
                                <motion.div
                                    variants={fadeIn('right', 0.4 * (index + 1))}
                                    className="w-12 h-12 flex items-center justify-center rounded-lg"
                                >
                                    {feature.icon}
                                </motion.div>
                                <motion.div variants={fadeIn('left', 0.4 * (index + 1))}>
                                    <motion.h3
                                        variants={textVariant(0.3)}
                                        className="text-xl font-semibold text-gray-900 mb-2"
                                    >
                                        {feature.title}
                                    </motion.h3>
                                    <motion.p
                                        variants={fadeIn('up', 0.4)}
                                        className="text-gray-600"
                                    >
                                        {feature.description}
                                    </motion.p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default PurposeSection;