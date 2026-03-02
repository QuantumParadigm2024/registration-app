import Navbar from "../Navbar";
import Footer from "../Footer";

const AboutUs = () => {
    return (
        <main className="flex-grow pt-10 px-4 sm:px-6 lg:px-8">
            <div className="absolute -top-28 -left-28 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-full blur-[80px] -z-10"></div>
            <div className="relative ">
                <Navbar />
                
                <section className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full border border-indigo-200">
                            <span className="text-indigo-600 font-semibold text-sm">✨ Revolutionizing Event Management</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Smart Event Registration Platform
                            </span>
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                            Professional registration solutions for companies managing multiple events or organizers hosting individual events with complete control.
                        </p>
                    </div>

                    <div className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                            Choose Your <span className="text-indigo-600">Management Style</span>
                        </h2>

                        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            <div className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                                <div className="p-8">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl shadow-lg">
                                            <span className="text-3xl text-white">🏢</span>
                                        </div>
                                        <div className="ml-6">
                                            <h3 className="text-2xl font-bold text-gray-900">Company Login</h3>
                                            <p className="text-indigo-600 font-medium">For organizations & corporations</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5 mb-8">
                                        <div className="flex items-start">
                                            <div className="bg-green-100 p-2 rounded-lg mr-4">
                                                <span className="text-green-600 text-xl">✓</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Centralized Dashboard</h4>
                                                <p className="text-gray-600">Manage all events from one unified interface</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="bg-green-100 p-2 rounded-lg mr-4">
                                                <span className="text-green-600 text-xl">✓</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Team Collaboration</h4>
                                                <p className="text-gray-600">Assign different admins to different events</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="bg-green-100 p-2 rounded-lg mr-4">
                                                <span className="text-green-600 text-xl">✓</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Cross-Event Analytics</h4>
                                                <p className="text-gray-600">Compare performance across all your events</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5">
                                        <p className="text-gray-700 font-medium">
                                            <span className="text-indigo-600">Perfect for:</span> Large organizations, educational institutions, event management companies
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
                                <div className="p-8">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-xl shadow-lg">
                                            <span className="text-3xl text-white">📅</span>
                                        </div>
                                        <div className="ml-6">
                                            <h3 className="text-2xl font-bold text-gray-900">Event Login</h3>
                                            <p className="text-blue-600 font-medium">For individual event organizers</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5 mb-8">
                                        <div className="flex items-start">
                                            <div className="bg-green-100 p-2 rounded-lg mr-4">
                                                <span className="text-green-600 text-xl">✓</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Focused Interface</h4>
                                                <p className="text-gray-600">Dedicated tools for single event management</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="bg-green-100 p-2 rounded-lg mr-4">
                                                <span className="text-green-600 text-xl">✓</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Full Feature Access</h4>
                                                <p className="text-gray-600">All premium features available for single events</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="bg-green-100 p-2 rounded-lg mr-4">
                                                <span className="text-green-600 text-xl">✓</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Quick Setup</h4>
                                                <p className="text-gray-600">Get started immediately without company setup</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5">
                                        <p className="text-gray-700 font-medium">
                                            <span className="text-blue-600">Perfect for:</span> Conferences, workshops, seminars, individual event planners
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Everything You Need For <span className="text-purple-600">Successful Events</span>
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Powerful tools designed to simplify event management from registration to reporting
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-7 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                                <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">📝</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Registration Forms</h3>
                                <p className="text-gray-600 mb-4">Create multiple custom forms for different attendee types with conditional logic and validation.</p>
                                <div className="inline-flex items-center text-indigo-600 font-medium">
                                    <span>Learn more</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-7 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                                <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">💳</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
                                <p className="text-gray-600 mb-4">Integrated payment gateways with real-time transaction tracking and automated receipts.</p>
                                <div className="inline-flex items-center text-blue-600 font-medium">
                                    <span>Learn more</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-7 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                                <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">🎫</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Digital E-Badges</h3>
                                <p className="text-gray-600 mb-4">Professional e-badges with custom templates, instant email delivery, and QR codes.</p>
                                <div className="inline-flex items-center text-emerald-600 font-medium">
                                    <span>Learn more</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-7 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                                <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">📱</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Check-in App</h3>
                                <p className="text-gray-600 mb-4">Dedicated scanning app with role-based access for smooth attendee check-in.</p>
                                <div className="inline-flex items-center text-purple-600 font-medium">
                                    <span>Learn more</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-7 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                                <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">📊</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Live Analytics Dashboard</h3>
                                <p className="text-gray-600 mb-4">Real-time insights on registrations, attendance, and event performance metrics.</p>
                                <div className="inline-flex items-center text-amber-600 font-medium">
                                    <span>Learn more</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-7 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                                <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-pink-100 to-rose-100 mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">⚡</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Spot Registration</h3>
                                <p className="text-gray-600 mb-4">On-the-spot registration with instant e-badge generation and immediate access.</p>
                                <div className="inline-flex items-center text-pink-600 font-medium">
                                    <span>Learn more</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                How It <span className="text-gradient bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Works</span>
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Simple steps to organize your perfect event
                            </p>
                        </div>

                        <div className="relative">
                            <div className="hidden lg:block absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 -translate-y-1/2"></div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    { number: "01", title: "Sign Up", desc: "Choose between Company or Event login based on your needs", icon: "👤", color: "from-indigo-500 to-purple-500" },
                                    { number: "02", title: "Create Event", desc: "Setup event details, dates, and registration parameters", icon: "📅", color: "from-blue-500 to-cyan-500" },
                                    { number: "03", title: "Customize", desc: "Design forms, add payment options, and create e-badges", icon: "🎨", color: "from-emerald-500 to-green-500" },
                                    { number: "04", title: "Go Live", desc: "Share registration links and start managing attendees", icon: "🚀", color: "from-amber-500 to-orange-500" }
                                ].map((step, index) => (
                                    <div key={index} className="relative">
                                        <div className="bg-white rounded-2xl p-7 shadow-xl border border-gray-100 relative z-10 hover:shadow-2xl transition-all duration-300">
                                            <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${step.color} text-white font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg`}>
                                                {step.number}
                                            </div>
                                            <div className="text-center pt-4">
                                                <div className="text-4xl mb-4">{step.icon}</div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                                <p className="text-gray-600">{step.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-20">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 shadow-2xl overflow-hidden relative">
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 text-center">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                    Why Choose Our Platform?
                                </h2>
                                <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
                                    Experience the difference with our comprehensive event management solution
                                </p>

                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                        <div className="text-3xl mb-4">⚡</div>
                                        <h4 className="text-white font-bold text-xl mb-3">Real-time Sync</h4>
                                        <p className="text-white/80">Registration data instantly syncs between web platform and mobile app</p>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                        <div className="text-3xl mb-4">🛡️</div>
                                        <h4 className="text-white font-bold text-xl mb-3">Secure & Reliable</h4>
                                        <p className="text-white/80">Enterprise-grade security with 99.9% uptime and data protection</p>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                        <div className="text-3xl mb-4">🎯</div>
                                        <h4 className="text-white font-bold text-xl mb-3">Easy to Use</h4>
                                        <p className="text-white/80">Intuitive interface that requires minimal training for your team</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center py-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Ready to Transform Your <span className="text-gradient bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Event Experience</span>?
                        </h2>
                        <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of successful event organizers who trust our platform for seamless registration and management.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <span className="relative z-10">Start Free Trial</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>

                            <button className="group relative bg-white text-gray-800 font-bold py-4 px-8 rounded-xl border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <span className="relative z-10">Book a Demo</span>
                                <div className="absolute inset-0 bg-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm mt-8">
                            No credit card required • 14-day free trial • Cancel anytime
                        </p>
                    </div>
                </section>

                <Footer />
            </div>
        </main>
    );
};

export default AboutUs;