import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaUserMd, FaStore, FaTruck, FaSearch, FaPills, FaShoppingCart, FaMapMarkerAlt, FaCheckCircle, FaRobot } from 'react-icons/fa';
import Footer from '../components/layouts/Footer';
import Layout from '../components/layouts/Layout';
import Button from '../components/ui/Button';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const profiles = [
    {
      type: 'customer',
      title: 'Customer',
      heading: 'Your Health, Our Priority',
      description: 'Order medicines online with ease. Get AI-powered health assistance and doorstep delivery.',
      bgColor: 'bg-[#A4E685]',
      icon: <FaUserMd className="text-8xl text-[#0F2B10]" />,
      features: [
        { icon: <FaSearch />, title: 'Search Medicines', desc: 'Find medicines from nearby pharmacies instantly' },
        { icon: <FaRobot />, title: 'AI Health Assistant', desc: 'Get medicine info and symptom checker powered by AI' },
        { icon: <FaMapMarkerAlt />, title: 'Nearby Pharmacies', desc: 'Discover pharmacies within your location' },
        { icon: <FaShoppingCart />, title: 'Easy Ordering', desc: 'Place orders with delivery or pickup options' }
      ]
    },
    {
      type: 'vendor',
      title: 'Pharmacy Vendor',
      heading: 'Grow Your Pharmacy Business',
      description: 'Register your pharmacy, manage inventory, and reach more customers online.',
      bgColor: 'bg-[#F8C445]',
      icon: <FaStore className="text-8xl text-[#0F2B10]" />,
      features: [
        { icon: <FaStore />, title: 'Register Pharmacy', desc: 'Easy pharmacy registration and approval process' },
        { icon: <FaPills />, title: 'Manage Inventory', desc: 'Keep track of medicines and stock levels' },
        { icon: <FaShoppingCart />, title: 'Order Management', desc: 'Handle customer orders efficiently' },
        { icon: <FaCheckCircle />, title: 'Sales Analytics', desc: 'Track revenue and business performance' }
      ]
    },
    {
      type: 'volunteer',
      title: 'Delivery Volunteer',
      heading: 'Deliver Health, Earn Income',
      description: 'Join as a delivery partner and help deliver medicines to those in need.',
      bgColor: 'bg-[#2DD4BF]',
      icon: <FaTruck className="text-8xl text-[#0F2B10]" />,
      features: [
        { icon: <FaTruck />, title: 'Flexible Delivery', desc: 'Choose orders based on your availability' },
        { icon: <FaMapMarkerAlt />, title: 'Route Optimization', desc: 'Get optimal delivery routes' },
        { icon: <FaCheckCircle />, title: 'Earn Income', desc: 'Competitive compensation for deliveries' },
        { icon: <FaUserMd />, title: 'Help Community', desc: 'Serve your community with healthcare delivery' }
      ]
    }
  ];

  const currentProfile = profiles[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % profiles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + profiles.length) % profiles.length);
  };

  const scrollToFeatures = () => {
    document.getElementById(`features-${currentProfile.type}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Hero Section with Swipe */}
      <section className={`relative ${currentProfile.bgColor} transition-colors duration-500 overflow-hidden rounded-t-[48px] mt-10 mx-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-6">
              <div className="inline-block px-4 py-2 bg-[#0F2B10]/10 backdrop-blur-sm rounded-full text-sm font-semibold text-[#0F2B10] border border-[#0F2B10]/20">
                {currentProfile.title}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-[#0F2B10] leading-tight">
                {currentProfile.heading}
              </h1>
              
              <p className="text-lg md:text-xl text-[#0F2B10] max-w-lg font-medium">
                {currentProfile.description}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={scrollToFeatures}
                  className="px-8 py-4 bg-[#0F2B10] text-white font-semibold rounded-full hover:bg-[#0F2B10]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Explore Features
                </button>
                <button
                  onClick={() => navigate(`/signup/${currentProfile.type}`)}
                  className="px-8 py-4 bg-white text-[#0F2B10] font-semibold rounded-full hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-[#0F2B10]"
                >
                  Sign Up as {currentProfile.title}
                </button>
              </div>

              {/* Info Badges */}
              <div className="flex flex-wrap gap-4 pt-6">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-md border border-white/40">
                  <div className="w-10 h-10 bg-[#0F2B10] rounded-full flex items-center justify-center">
                    <FaTruck className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#0F2B10]">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-md border border-white/40">
                  <div className="w-10 h-10 bg-[#0F2B10] rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#0F2B10]">100% Genuine</span>
                </div>
              </div>
            </div>

            {/* Right Icon/Image */}
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl"></div>
                <div className="relative bg-white/60 backdrop-blur-md p-12 md:p-16 rounded-3xl shadow-2xl border-4 border-white/50">
                  {currentProfile.icon}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-xl border-2 border-[#0F2B10]/20"
        >
          <FaChevronLeft className="text-[#0F2B10] text-xl" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-xl border-2 border-[#0F2B10]/20"
        >
          <FaChevronRight className="text-[#0F2B10] text-xl" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {profiles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-[#0F2B10]' : 'w-2 bg-[#0F2B10]/30'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Sections */}
      {profiles.map((profile, profileIndex) => (
        <section
          key={profile.type}
          id={`features-${profile.type}`}
          className={`py-20 ${profileIndex % 2 !== 0 ? 'bg-gradient-to-br from-bg-light to-white' : 'bg-white'} relative overflow-hidden
          mx-10 mt-[-17px] rounded-t-[18px]
          `}
        >
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className={`px-4 py-2 rounded-full text-xl font-semibold ${
                  profile.type === 'customer' ? 'bg-[#A4E685]/20 text-[#0F2B10]' :
                  profile.type === 'vendor' ? 'bg-[#F8C445]/20 text-[#0F2B10]' :
                  'bg-[#2DD4BF]/20 text-[#0F2B10]'
                } border ${
                  profile.type === 'customer' ? 'border-[#A4E685]/40' :
                  profile.type === 'vendor' ? 'border-[#F8C445]/40' :
                  'border-[#2DD4BF]/40'
                }`}>
                  {profile.title} Portal
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-textc-dark mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {profile.title} Features
              </h2>
              <p className="text-lg text-textc-base max-w-2xl mx-auto">
                Discover what makes {profile.title.toLowerCase()} experience exceptional on Swasthya Sarathi
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profile.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 hover:shadow-banner transition-all duration-300 group border border-gray-100 hover:border-primary/20 hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-all duration-300 ${
                    profile.type === 'customer' ? 'bg-[#A4E685]/10 text-[#0F2B10] group-hover:bg-[#A4E685]' :
                    profile.type === 'vendor' ? 'bg-[#F8C445]/10 text-[#0F2B10] group-hover:bg-[#F8C445]' :
                    'bg-[#2DD4BF]/10 text-[#0F2B10] group-hover:bg-[#2DD4BF]'
                  } group-hover:text-white group-hover:scale-110 group-hover:rotate-3`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-textc-dark mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-textc-base text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <button
                onClick={() => navigate(`/signup/${profile.type}`)}
                className={`group relative px-10 py-4 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl ${
                  profile.type === 'customer' ? 'bg-[#A4E685] text-[#0F2B10] hover:bg-[#8FD670]' :
                  profile.type === 'vendor' ? 'bg-[#F8C445] text-[#0F2B10] hover:bg-[#E5B330]' :
                  'bg-[#2DD4BF] text-[#0F2B10] hover:bg-[#1AB89F]'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started as {profile.title}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
              <p className="mt-4 text-sm text-textc-light">
                Join thousands of {profile.title.toLowerCase()}s already using Swasthya Sarathi
              </p>
            </div>
          </div>
        </section>
      ))}
    </Layout>
  );
};

export default LandingPage;

