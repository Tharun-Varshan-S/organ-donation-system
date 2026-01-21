import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import Button from '../components/Button';

const About = () => {
  const sections = [
    {
      title: 'Mission',
      description: 'To increase the number of donor pledges in India through large-scale information dissemination via various media and creating awareness about the importance of organ donation. We aim to bridge the gap between donors and recipients, making the process seamless and transparent.',
      hasButton: true
    },
    {
      title: 'Vision',
      description: 'To save lives through an increase in organ donations in India and instil a culture in which the act of organ donation is deeply valued and widely practiced. We envision a future where no one waits for a life-saving organ transplant.',
      hasButton: true
    },
    {
      title: 'History',
      description: 'LifeBridge was launched in March 2023 as an initiative to revolutionize organ donation in India. Starting as a small platform, we have grown to become a trusted network connecting thousands of donors with hospitals and recipients across the country.',
      hasButton: true
    },
    {
      title: 'Team',
      description: 'Meet our team of dedicated volunteers. Each team member of LifeBridge is committed to spreading awareness and a holistic understanding of organ donation. Our diverse team includes medical professionals, technologists, and advocates working together to save lives.',
      hasButton: true
    },
    {
      title: 'Trustees',
      description: 'LifeBridge is fully supported by a board of trustees who bring decades of experience in healthcare, technology, and social impact. Our trustees guide our strategic direction and ensure we remain true to our mission of saving lives through organ donation.',
      hasButton: true
    },
    {
      title: 'Ambassadors',
      description: 'We are immensely thankful to our Ambassadors for Organ Donation who have taken up this cause because of their personal commitment to saving lives. These influential voices help us reach millions and inspire others to become donors.',
      hasButton: true
    },
    {
      title: 'Advisors',
      description: 'We are immensely grateful to our Advisors who have been supporting and advising us through the past few years since our inception. Their expertise in medicine, law, and ethics ensures we maintain the highest standards in all our operations.',
      hasButton: false
    },
    {
      title: 'Legal & Financial',
      description: 'LifeBridge is actively involved in advocacy and lobbying with the Government authorities as well as with other stakeholders to improve organ donation policies. We maintain complete transparency in our financial operations and comply with all regulatory requirements.',
      hasButton: false
    },
    {
      title: 'Accreditations',
      description: 'LifeBridge took the lead and organised the First Conclave for Organ Donation in December 2023 in collaboration with leading medical institutions. We are recognized by major healthcare organizations and maintain partnerships with hospitals nationwide.',
      hasButton: false
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E44] mb-12 text-center">
          About LifeBridge
        </h1>

        {/* Hero Image Section */}
        <div className="mb-16 relative w-full h-[400px] rounded-2xl overflow-hidden shadow-xl">
          <img
            src="/images/about-hero.jpg"
            alt="Compassionate medical care"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E44]/80 to-transparent flex items-end justify-center pb-8">
            <p className="text-white text-xl md:text-2xl font-light italic text-center px-4">
              "Connecting lives, creating hope, and building a future where every organ finds a home."
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <Card key={index} className="bg-white border-2 border-[#798E93]/20">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">
                {section.title}
              </h2>
              <p className="text-[#556B73] leading-relaxed mb-6">
                {section.description}
              </p>
              {section.hasButton && (
                <button
                  className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 px-6 py-2 rounded-lg transition shadow-sm font-medium"
                >
                  Click here
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;

