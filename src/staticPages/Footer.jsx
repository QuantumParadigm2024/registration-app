import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { fadeIn, textVariant } from '../utils/motion'

const footerLinks = {
    company: [
        { name: 'Home', href: '#' },
        { name: 'About us', href: '#' },
        { name: 'Our services', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Contact Us', href: '#' },
    ],
    getHelp: [
        { name: '-----', href: '#' },
        { name: '-----', href: '#' },
        { name: '-----', href: '#' },
    ],
    // support: [
    //   { name: 'FAQ', href: '#' },
    //   { name: 'Policy', href: '#' },
    //   { name: 'Business', href: '#' },
    // ],
}

const Footer = () => {
    return (
        <motion.footer
            variants={fadeIn('up', 0.2)}
            initial="hidden"
            whileInView="show"
            className="bg-gray-50"
        >
            <div className="section-container">
                <motion.div
                    variants={fadeIn('up', 0.3)}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12"
                >
                    {/* Brand Column */}
                    <motion.div
                        variants={fadeIn('right', 0.4)}
                        className="lg:col-span-4"
                    >
                        <motion.div
                            variants={fadeIn('down', 0.5)}
                            className="flex items-center gap-2 mb-6"
                        >
                            <img
                                src="https://play-lh.googleusercontent.com/zIXM3XtuIdpqOG1QtqgcxqjVx_-AM99y50kslkXDGW0YBR880wbduOoN3BQ4GPO3Sg=w240-h480-rw"
                                alt="Logo"
                                className="w-12 h-12 rounded-full"
                            />
                            <span className="text-xl font-medium">
                                Crafting Transformative experience
                            </span>
                        </motion.div>

                        <motion.p
                            variants={fadeIn('up', 0.6)}
                            className="text-gray-600 mb-6"
                        >
                            At Planotech, we offer you a robust platform to foster the growth of your company. We handle everything from initial design and planning to executing on-site and bringing your original concept to life.
                        </motion.p>

                        <motion.div
                            variants={fadeIn('up', 0.7)}
                            className="flex gap-4"
                        >
                            <SocialIcon icon={<FaFacebookF />} />
                            <SocialIcon icon={<FaTwitter />} />
                            <SocialIcon icon={<FaLinkedinIn />} />
                        </motion.div>
                    </motion.div>

                    {/* Links + Map Column */}
                    <motion.div
                        variants={fadeIn('left', 0.4)}
                        className="lg:col-span-8"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {/* Link Sections */}
                            {Object.entries(footerLinks).map(
                                ([category, links], categoryIndex) => (
                                    <motion.div
                                        key={category}
                                        variants={fadeIn('up', 0.3 * (categoryIndex + 1))}
                                    >
                                        <motion.h3
                                            variants={textVariant(0.2)}
                                            className="text-lg font-medium mb-4 capitalize"
                                        >
                                            {category.replace(/([A-Z])/g, ' $1')}
                                        </motion.h3>

                                        <motion.ul
                                            variants={fadeIn('up', 0.4)}
                                            className="space-y-3"
                                        >
                                            {links.map((link, index) => (
                                                <motion.li
                                                    key={index}
                                                    variants={fadeIn('up', 0.1 * (index + 1))}
                                                >
                                                    <motion.a
                                                        whileHover={{ x: 5 }}
                                                        href={link.href}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        {link.name}
                                                    </motion.a>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    </motion.div>
                                )
                            )}

                            {/* Contact / Map Section */}
                            <motion.div
                                variants={fadeIn('up', 0.6)}
                            >
                                <motion.h3
                                    variants={textVariant(0.2)}
                                    className="text-lg font-medium mb-4"
                                >
                                    Contact
                                </motion.h3>

                                <div className="w-[350px] h-[250px] overflow-hidden rounded-lg">
                                    <iframe
                                        title="Google Map"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4002.392133545948!2d77.53534961071064!3d13.098292412034564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae231d86dbafa7%3A0x63169ec400345e2!2sPlanotech%20Group%20of%20Companies!5e1!3m2!1sen!2sin!4v1767618565783!5m2!1sen!2sin"
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Copyright */}
                <motion.div
                    variants={fadeIn('up', 0.8)}
                    className="border-t border-gray-200 mt-12 pt-8"
                >
                    <p className="text-gray-600 text-sm text-center">
                        © {new Date().getFullYear()} Planotech Group of Companies
                    </p>
                </motion.div>
            </div>
        </motion.footer>
    )
}

const SocialIcon = ({ icon }) => (
    <motion.a
        whileHover={{ scale: 1.1 }}
        href="#"
        className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-colors"
    >
        {icon}
    </motion.a>
)

export default Footer