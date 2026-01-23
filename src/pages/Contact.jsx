import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E8E8] via-[#A2BFC6] to-[#798E93] relative">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E44] mb-4 text-center">
            Contact Us
          </h1>
          <p className="text-[#556B73] text-center mb-8">
            Have questions about organ donation or using LifeBridge? Send us a message and our team
            will get back to you.
          </p>

          <form className="space-y-4">
            <Input label="Full Name" placeholder="Your name" />
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Input label="Subject" placeholder="How can we help?" />
            <div>
              <label className="block text-[#2C3E44] mb-2 font-medium">Message</label>
              <textarea
                rows={4}
                className="w-full bg-white/50 border border-[#556B73]/30 rounded-lg px-4 py-3 text-[#2C3E44] placeholder-[#798E93] focus:outline-none focus:border-red-600 resize-none"
                placeholder="Write your message here..."
              />
            </div>
            <div className="flex justify-center pt-2">
              <Button variant="primary" type="button">
                Send Message
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;

