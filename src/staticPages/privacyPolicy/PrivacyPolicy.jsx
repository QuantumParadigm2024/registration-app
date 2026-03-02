import Navbar from "../Navbar";
import Footer from "../Footer";

const sections = [
    {
        title: "Information We Collect",
        points: [
            "Name",
            "Email address",
            "Phone number",
            "Username and password",
            "Any information you voluntarily provide",
        ],
    },
    {
        title: "How We Use Your Information",
        points: [
            "Create and manage user accounts",
            "Provide access to our services",
            "Send important updates",
            "Improve user experience",
            "Prevent fraud and ensure security",
        ],
    },
    {
        title: "Data Protection & Security",
        description:
            "We apply appropriate technical and organizational safeguards to protect your personal data from unauthorized access or misuse.",
    },
    {
        title: "Sharing of Information",
        description:
            "We do not sell or rent your data. Information is shared only when legally required or to protect our rights.",
    },
    {
        title: "Cookies",
        points: [
            "Maintain user sessions",
            "Improve website performance",
            "Analyze usage patterns",
        ],
    },
    {
        title: "User Rights",
        points: [
            "Access your personal data",
            "Update or correct your information",
            "Request deletion of your account",
        ],
    },
];

const PrivacyPolicy = () => {
    return (
        <main className="flex-grow pt-5 px-4 sm:px-6 lg:px-8">
            <div className="absolute -top-28 -left-28 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-full blur-[80px] -z-10"></div>
            <div className="relative flex flex-col min-h-screen">
                <Navbar />

                <section className=" pt-24 px-4 max-w-6xl mx-auto px-4 mb-20 text-center">

                    <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full border border-indigo-200">
                        <span className="text-indigo-600 font-semibold text-sm">🔒 Privacy & Trust</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
                        Your Privacy,
                        <span className="block sm:inline bg-gradient-to-r from-indigo-500 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                            {" "}Our Responsibility
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed">
                        This Privacy Policy explains how{" "}
                        <strong>Planotech Registration Software</strong> collects,
                        uses, and protects your personal information.
                    </p>

                    <p className="mt-5 text-sm text-slate-500">
                        Last updated: 03-02-2026
                    </p>
                </section>

                <section className="max-w-6xl mx-auto px-4 grid gap-10 mb-20">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="relative bg-white border border-slate-200 rounded-2xl p-7 sm:p-9 shadow-sm hover:shadow-lg transition-all"
                        >
                            <div className="absolute left-0 top-8 h-[65%] w-1.5 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500" />

                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 pl-5">
                                {index + 1}. {section.title}
                            </h2>

                            {section.description && (
                                <p className="text-slate-700 leading-relaxed pl-5">
                                    {section.description}
                                </p>
                            )}

                            {section.points && (
                                <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-slate-700 pl-5">
                                    {section.points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="mt-2.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}

                    <div className="relative overflow-hidden bg-indigo-50 border border-indigo-200 rounded-3xl p-10 text-center">
                        <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 bg-indigo-200/40 rounded-full blur-3xl" />

                        <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
                            Questions About Your Privacy?
                        </h2>

                        <p className="text-slate-700 max-w-xl mx-auto mb-6">
                            We’re here to help. Reach out to us if you need clarification
                            or support regarding this Privacy Policy.
                        </p>

                        <p className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold shadow-sm">
                            📧 info@planotechevents.com
                        </p>
                    </div>
                </section>

                <Footer />
            </div>
        </main >
    );
};

export default PrivacyPolicy;