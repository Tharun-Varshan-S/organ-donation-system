import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';

const Mission = () => {
  const objectives = [
    {
      title: 'To increase the number of donor pledges in India',
      description: 'through large-scale information dissemination via various media and platforms such as social media, radio, television, awareness sessions in schools, colleges, hospitals and other institutions, and training others to carry out the programme.'
    },
    {
      title: 'To educate those suffering from organ failure',
      description: 'about their various options, and to help them in their ordeal by offering information, advice, counselling, and offering monetary help, if possible, preventing the illness and death of those with organ failure.'
    },
    {
      title: 'To influence public policy on organ donation',
      description: 'through advocacy in India by becoming leaders in public awareness and the collaborative effort of all NGOs in this field.'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E44] mb-12 text-center">
          Our Mission
        </h1>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/images/mission-hands.jpg"
                alt="Teamwork and unity - hands together"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image doesn't exist - show a placeholder
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93] items-center justify-center">
                <div className="text-center text-[#2C3E44]">
                  <div className="text-6xl mb-4">🤝</div>
                  <p className="text-lg font-semibold">Place image here</p>
                  <p className="text-sm mt-2">Save as: public/images/mission-hands.jpg</p>
                </div>
              </div>
            </div>
          </div>

          {/* Objectives Section */}
          <div className="space-y-8">
            {objectives.map((objective, index) => (
              <Card key={index} className="bg-white border-2 border-[#798E93]/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#2C3E44] mb-2">
                      {objective.title}
                    </h3>
                    <p className="text-[#556B73] leading-relaxed">
                      {objective.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Mission;

