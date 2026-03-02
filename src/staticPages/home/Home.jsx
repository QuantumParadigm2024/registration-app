import React from 'react'
import Navbar from '../Navbar'
import Hero from './Hero'
import CompanyLogo from './CompanyLogo'
import PurposeSection from './PurposeSection'
import FeaturesSection from './FeaturesSection'
import ScheduleSection from './ScheduleSection'
import MonitorSection from './MonitorSection'
import PricingSection from './PricingSection'
import ServicesSection from './ServicesSection'
import TestimonialsSection from './TestimonialsSection'
import NewsletterSection from './NewsletterSection'
import Footer from '../Footer'
import ScheduleSection1 from './ScheduleSection1'

const Home = () => {

    return (
        <main className="relative min-h-screen overflow-x-hidden">
            <div className="absolute -top-28 -left-28 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-full blur-[80px] -z-10"></div>
            <div className="overflow-hidden">
                <Navbar />
                <Hero />
                {/* <CompanyLogo /> */}
                <PurposeSection />
                <FeaturesSection />
                <ScheduleSection />
                <MonitorSection />
                <ScheduleSection1 />
                {/* <PricingSection /> */}
                <ServicesSection />
                {/* <TestimonialsSection /> */}
                {/* <NewsletterSection /> */}
                <Footer />
            </div>
        </main>
    )
}

export default Home