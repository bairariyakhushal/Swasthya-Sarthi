import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { FaSearch, FaPills, FaStethoscope, FaShoppingCart, FaTruck, FaRobot, FaMapMarkerAlt, FaPhone, FaUser, FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import { customerApi } from '../../api/customerApi';
import toast from 'react-hot-toast';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState('all');
  const pharmacyScrollRef = useRef(null);

  // Dummy testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 5,
      text: "Amazing service! Got my medicines delivered within 30 minutes. The AI symptom checker is really helpful.",
      avatar: "PS",
      location: "Mumbai",
      date: "2 days ago"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      rating: 5,
      text: "Very reliable platform. The medicine information feature helped me understand my prescriptions better.",
      avatar: "RK",
      location: "Delhi",
      date: "3 days ago"
    },
    {
      id: 3,
      name: "Anita Desai",
      rating: 4,
      text: "Good experience overall. Found a pharmacy near my home that had all the medicines I needed.",
      avatar: "AD",
      location: "Bangalore",
      date: "5 days ago"
    },
    {
      id: 4,
      name: "Vikram Singh",
      rating: 5,
      text: "The AI assistant is brilliant! It gave me accurate information about drug interactions.",
      avatar: "VS",
      location: "Pune",
      date: "1 week ago"
    },
    {
      id: 5,
      name: "Meera Patel",
      rating: 5,
      text: "Excellent platform for ordering medicines. The delivery was prompt and the packaging was secure.",
      avatar: "MP",
      location: "Ahmedabad",
      date: "1 week ago"
    },
    {
      id: 6,
      name: "Arjun Reddy",
      rating: 4,
      text: "Very convenient service. Love the location-based pharmacy search feature.",
      avatar: "AR",
      location: "Hyderabad",
      date: "2 weeks ago"
    },
    {
      id: 7,
      name: "Kavita Nair",
      rating: 5,
      text: "Best medicine delivery app I've used. The symptom checker saved me a trip to the doctor!",
      avatar: "KN",
      location: "Chennai",
      date: "2 weeks ago"
    },
    {
      id: 8,
      name: "Sanjay Gupta",
      rating: 5,
      text: "Fast, reliable, and trustworthy. Got genuine medicines with proper packaging.",
      avatar: "SG",
      location: "Kolkata",
      date: "3 weeks ago"
    },
    {
      id: 9,
      name: "Neha Kapoor",
      rating: 4,
      text: "Good service. The nearby pharmacy feature is very useful for urgent medicine needs.",
      avatar: "NK",
      location: "Jaipur",
      date: "3 weeks ago"
    },
    {
      id: 10,
      name: "Rahul Mehta",
      rating: 5,
      text: "Outstanding service! The AI features make this platform stand out from others.",
      avatar: "RM",
      location: "Surat",
      date: "1 month ago"
    }
  ];

  // Fetch user's current location
  useEffect(() => {
    // Fetch location in background without blocking UI
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          fetchNearbyPharmacies(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Fetch nearby pharmacies
  const fetchNearbyPharmacies = async (location) => {
    try {
      setLoadingPharmacies(true);
      const response = await customerApi.getNearestPharmacies({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 10, // 10 km radius
      });
      
      if (response.success) {
        setNearbyPharmacies(response.pharmacies || []);
      }
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      toast.error('Failed to load nearby pharmacies');
    } finally {
      setLoadingPharmacies(false);
    }
  };

  // Filter pharmacies by distance
  const getFilteredPharmacies = () => {
    if (distanceFilter === 'all') return nearbyPharmacies;
    
    const maxDistance = {
      'under1': 1,
      '1to5': 5,
      '5to10': 10
    }[distanceFilter];

    return nearbyPharmacies.filter(pharmacy => {
      const distance = parseFloat(pharmacy.distance);
      if (distanceFilter === 'under1') return distance < 1;
      if (distanceFilter === '1to5') return distance >= 1 && distance <= 5;
      if (distanceFilter === '5to10') return distance > 5 && distance <= 10;
      return true;
    });
  };

  const filteredPharmacies = getFilteredPharmacies();

  const scrollPharmacies = (direction) => {
    if (pharmacyScrollRef.current) {
      const scrollAmount = 300;
      pharmacyScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const features = [
    {
      title: 'Smart Medicine Search',
      description: 'Discover medicines from verified pharmacies near you with intelligent filters, real-time availability, and best price comparison',
      icon: FaSearch,
      gradient: 'from-[#1B9C85] to-[#0F5132]',
      bgColor: 'bg-gradient-to-br from-[#E8F5F3] to-[#D1F2EB]',
      iconBg: 'bg-[#1B9C85]',
      iconColor: 'text-white',
      path: '/customer/search',
      highlight: 'Location-Based',
    },
    {
      title: 'AI Health Assistant',
      description: 'Advanced AI-powered platform providing instant medicine information, drug interactions, and intelligent symptom analysis',
      icon: FaRobot,
      gradient: 'from-[#8B5CF6] to-[#6D28D9]',
      bgColor: 'bg-gradient-to-br from-[#F3F0FF] to-[#E9D5FF]',
      iconBg: 'bg-[#8B5CF6]',
      iconColor: 'text-white',
      path: '/customer/ai-assistant',
      badge: 'AI Powered',
    },
    {
      title: 'Order Management',
      description: 'Seamlessly track orders, view detailed history, manage prescriptions, and reorder medicines with a single click',
      icon: FaShoppingCart,
      gradient: 'from-[#F59E0B] to-[#D97706]',
      bgColor: 'bg-gradient-to-br from-[#F9EFD7] to-[#F9EFD7]',
      iconBg: 'bg-[#F59E0B]',
      iconColor: 'text-white',
      path: '/customer/orders',
      highlight: 'Fast & Easy',
    },
    {
      title: 'Quick Delivery',
      description: 'Express delivery service ensures your medicines reach you safely within 30-60 minutes with real-time tracking',
      icon: FaTruck,
      gradient: 'from-[#10B981] to-[#059669]',
      bgColor: 'bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0]',
      iconBg: 'bg-[#10B981]',
      iconColor: 'text-white',
      path: '/customer/search',
      highlight: '30-60 mins',
    },
  ];

  return (
    <Layout>
      <div className=" mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 space-y-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-primary-light via-white to-accent-cyan-light rounded-3xl p-8 sm:p-12 overflow-hidden shadow-banner"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B9C85' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Genuine Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-card mb-6">
                <FaShieldAlt className="text-primary text-lg" />
                <span className="font-semibold text-textc-dark">100% Genuine Medicine</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#123413] mb-4 leading-tight">
                Your Health,
                <span className="text-primary block">Our Priority</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-textc-base mb-8 max-w-2xl">
                Order medicines from nearby pharmacies with AI-powered health assistance. 
                Fast, reliable, and trustworthy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/customer/search')}
                  className="px-8 py-4 border-2 text-gray-800 font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaSearch />
                  Search Medicines
                </button>
                <button
                  onClick={() => navigate('/customer/ai-assistant')}
                  className="px-8 py-4 bg-gradient-to-r from-[#f4fbf2] to-[#d0f7c0] text-gray-800 font-semibold rounded-full border-2    hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaStethoscope />
                  Check Symptoms
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-shrink-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="w-64 h-64 sm:w-80 sm:h-80 bg-white rounded-full shadow-banner flex items-center justify-center p-8">
                  <img 
                    src="/Volunteer.png" 
                    alt="Healthcare" 
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-accent-yellow p-4 rounded-2xl shadow-card"
                >
                  <FaPills className="text-3xl text-orange-400" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-secondary p-4 rounded-2xl shadow-card"
                >
                  <FaRobot className="text-3xl text-green-300" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Nearby Pharmacies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="-mt-8"
        >
          {/* niyora check */}
          <div className="  p-6 sm:p-8  ">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  Nearby Pharmacies
                </h2>
                <p className="text-sm text-gray-600">Verified partners near your location</p>
              </div>
              {nearbyPharmacies.length > 0 && (
                <span className="px-4 py-2 bg-purple-400 text-white rounded-full text-sm font-semibold shadow-md">
                  {nearbyPharmacies.length} Available
                </span>
              )}
            </div>

            {/* Distance Filters */}
            {nearbyPharmacies.length > 0 && (
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setDistanceFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    distanceFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  All ({nearbyPharmacies.length})
                </button>
                <button
                  onClick={() => setDistanceFilter('under1')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    distanceFilter === 'under1'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  &lt; 1 km ({nearbyPharmacies.filter(p => parseFloat(p.distance) < 1).length})
                </button>
                <button
                  onClick={() => setDistanceFilter('1to5')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    distanceFilter === '1to5'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  1-5 km ({nearbyPharmacies.filter(p => {
                    const d = parseFloat(p.distance);
                    return d >= 1 && d <= 5;
                  }).length})
                </button>
                <button
                  onClick={() => setDistanceFilter('5to10')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    distanceFilter === '5to10'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  5-10 km ({nearbyPharmacies.filter(p => {
                    const d = parseFloat(p.distance);
                    return d > 5 && d <= 10;
                  }).length})
                </button>
              </div>
            )}

            {loadingPharmacies ? (
              <div className="py-8">
                {/* Skeleton Loader */}
                <div className="flex gap-4 overflow-x-hidden">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex-shrink-0 w-[280px] bg-white rounded-xl p-4 animate-pulse border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-5 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                      </div>
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : locationError ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex p-5 bg-purple-100 rounded-full mb-3">
                  <FaMapMarkerAlt className="text-4xl text-purple-600" />
                </div>
                <p className="text-gray-900 font-semibold mb-2">Location Access Required</p>
                <p className="text-gray-600 mb-5 max-w-md mx-auto text-sm">{locationError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 hover:shadow-md transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPharmacies.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex p-5 bg-purple-100 rounded-full mb-3">
                  <FaMapMarkerAlt className="text-4xl text-purple-300" />
                </div>
                <p className="text-gray-900 font-semibold mb-2">No Pharmacies Found</p>
                <p className="text-gray-600 mb-5 text-sm">
                  {distanceFilter !== 'all' 
                    ? 'Try adjusting the distance filter or search for medicines instead'
                    : 'No pharmacies found nearby. Try searching for medicines instead'}
                </p>
                <button
                  onClick={() => navigate('/customer/search')}
                  className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 hover:shadow-md transition-all duration-200"
                >
                  Search Medicines
                </button>
              </div>
            ) : (
              <>
                {/* Horizontal Scrolling Container */}
                <div className="relative overflow-hidden ">
                  {/* Gradient overlays for smooth edge effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

                  {/* Left Scroll Arrow */}
                  <button
                    onClick={() => scrollPharmacies('left')}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 hover:bg-purple-50 border-2 border-purple-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:border-purple-400"
                    aria-label="Scroll left"
                  >
                    <FaChevronLeft className="text-purple-600" />
                  </button>

                  {/* Right Scroll Arrow */}
                  <button
                    onClick={() => scrollPharmacies('right')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10  border-2 border-purple-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:border-purple-400"
                    aria-label="Scroll right"
                  >
                    <FaChevronRight className="text-purple-600" />
                  </button>

                  <div className="flex gap-x-10 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x snap-mandatory" ref={pharmacyScrollRef}>
                    {filteredPharmacies.map((pharmacy, index) => (
                      <motion.div
                        key={pharmacy.pharmacyId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => navigate(`/customer/search?pharmacyId=${pharmacy.pharmacyId}`)}
                        className="flex-shrink-0 w-[280px] bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all duration-200 cursor-pointer group snap-start"
                      >
                        {/* Header */}
                        <div className="bg-gradient-to-br from-slate-50 to-indigo-200 px-4 py-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-[#143915] text-base mb-1 truncate group-hover:scale-105 transition-transform duration-200">
                                {pharmacy.pharmacyName}
                              </h3>
                              <div className="flex items-center gap-1.5 text-[#f06767] text-xs">
                                <FaMapMarkerAlt className="text-[10px]" />
                                <span>{pharmacy.distance} km</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ml-2">
                              <FaPills className="text-[#143915] text-lg" />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          {/* Address */}
                          <div className="flex items-start gap-2 mb-3">
                            <FaMapMarkerAlt className="text-gray-400 text-xs mt-1 flex-shrink-0" />
                            <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed">
                              {pharmacy.address}
                            </p>
                          </div>

                          {/* Contact */}
                          <div className="flex items-center gap-2 mb-3">
                            <FaPhone className="text-gray-400 text-xs" />
                            <span className="text-[13px] text-gray-700 font-medium">{pharmacy.contactNumber}</span>
                          </div>

                          {/* Footer */}
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-semibold text-gray-700">
                                {pharmacy.availableMedicines} Items
                              </span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/customer/search?pharmacyId=${pharmacy.pharmacyId}`);
                              }}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group-hover:gap-2 transition-all duration-200"
                            >
                              Shop <span>→</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {filteredPharmacies.length > 6 && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => navigate('/customer/search')}
                      className="px-8 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 hover:shadow-md transition-all duration-200 inline-flex items-center gap-2"
                    >
                      View All Pharmacies
                      <span>→</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>



        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-textc-dark mb-3">
              Why Choose Our Platform
            </h2>
            <p className="text-textc-base text-[15px] max-w-2xl mx-auto">
              Experience healthcare redefined with cutting-edge technology, trusted pharmacies, and personalized care at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  onClick={() => navigate(feature.path)}
                  className={`${feature.bgColor} rounded-3xl shadow-card p-8 hover:shadow-cardHover transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-white overflow-hidden relative`}
                >
                  {/* Decorative gradient blob */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-5 mb-4">
                      {/* Icon Container */}
                      <div className={`p-4 rounded-2xl ${feature.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-md flex-shrink-0`}>
                        <Icon className={`text-4xl ${feature.iconColor}`} />
                      </div>
                      
                      {/* Badge or Highlight */}
                      {feature.badge && (
                        <span className={`px-3 py-1.5 bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold rounded-full shadow-md`}>
                          {feature.badge}
                        </span>
                      )}
                      {feature.highlight && (
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold rounded-full shadow-sm border border-gray-200">
                          {feature.highlight}
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h3 className="text-2xl font-bold text-textc-dark mb-3 group-hover:text-[#1B9C85] transition-colors duration-200">
                        {feature.title}
                      </h3>
                      <p className="text-[15px] text-gray-700 leading-relaxed mb-5">
                        {feature.description}
                      </p>
                      
                      {/* CTA Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(feature.path);
                        }}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-full hover:shadow-lg transform group-hover:translate-x-2 transition-all duration-200 text-sm`}
                      >
                        Explore Now 
                        <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="  p-8 sm:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1B9C85] opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1B9C85] opacity-5 rounded-full blur-3xl">erwre</div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-textc-dark mb-3">
                  How It Works
                </h2>
                <p className="text-textc-base text-[15px] max-w-2xl mx-auto">
                  Get your medicines delivered in 4 simple steps. Quick, easy, and hassle-free healthcare at your doorstep
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                {/* Connecting line for desktop */}
                <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#1B9C85] to-transparent opacity-20"></div>
                
                {/* Step 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-center group relative"
                >
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-[#1B9C85] to-[#0F5132] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                        1
                      </div>
                      <div className="p-6 bg-white rounded-2xl shadow-card group-hover:shadow-cardHover transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 border-2 border-transparent group-hover:border-[#1B9C85]">
                        <FaSearch className="text-5xl text-[#1B9C85]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-textc-dark mb-2 text-xl">Search</h3>
                  <p className="text-textc-base text-[15px] leading-relaxed">
                    Search for medicines or use AI to check your symptoms instantly
                  </p>
                </motion.div>

                {/* Step 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-center group relative"
                >
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                        2
                      </div>
                      <div className="p-6 bg-white rounded-2xl shadow-card group-hover:shadow-cardHover transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 border-2 border-transparent group-hover:border-[#10B981]">
                        <FaPills className="text-5xl text-[#10B981]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-textc-dark mb-2 text-xl">Select</h3>
                  <p className="text-textc-base text-[15px] leading-relaxed">
                    Choose from verified nearby pharmacies with best prices
                  </p>
                </motion.div>

                {/* Step 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="text-center group relative"
                >
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                        3
                      </div>
                      <div className="p-6 bg-white rounded-2xl shadow-card group-hover:shadow-cardHover transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 border-2 border-transparent group-hover:border-[#8B5CF6]">
                        <FaShoppingCart className="text-5xl text-[#8B5CF6]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-textc-dark mb-2 text-xl">Order</h3>
                  <p className="text-textc-base text-[15px] leading-relaxed">
                    Place your order with secure payment and prescription upload
                  </p>
                </motion.div>

                {/* Step 4 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="text-center group relative"
                >
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      {/* Step number badge */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                        4
                      </div>
                      <div className="p-6 bg-white rounded-2xl shadow-card group-hover:shadow-cardHover transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 border-2 border-transparent group-hover:border-[#F59E0B]">
                        <FaTruck className="text-5xl text-[#F59E0B]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-textc-dark mb-2 text-xl">Receive</h3>
                  <p className="text-textc-base text-[15px] leading-relaxed">
                    Get fast delivery within 30-60 minutes with real-time tracking
                  </p>
                </motion.div>
              </div>

              {/* CTA */}
              <div className="mt-12 text-center">
                <button
                  onClick={() => navigate('/customer/search')}
                  className="px-8 py-4 bg-gradient-to-r from-[#1B9C85] to-[#0F5132] text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center gap-2"
                >
                  Get Started Now
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Customer Testimonials - Auto Scrolling Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="overflow-hidden  p-6 sm:p-8 "
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-textc-dark mb-2">
              What Our Customers Say
            </h2>
            <p className="text-textc-base text-sm">Real experiences from our valued customers</p>
          </div>

          {/* Auto-scrolling container */}
          <div className="relative overflow-hidden">
            {/* Gradient overlays for smooth edge effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
            
            {/* Scrolling testimonials */}
            <div className="flex gap-8 animate-scroll-horizontal">
              {/* Duplicate testimonials for seamless loop */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[350px] bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-cardHover hover:border-primary transition-all duration-300"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-accent-yellow text-sm" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-[15px] text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Reviewer Info */}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-textc-dark text-[15px] truncate">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs text-textc-base truncate">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* //Safety Notice
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl shadow-card p-6">
            <div className="flex items-start gap-4">
              <div className="text-yellow-600 text-3xl flex-shrink-0">⚠️</div>
              <div>
                <h3 className="font-bold text-yellow-800 mb-2 text-lg">Health Disclaimer</h3>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  Our AI-powered tools are designed to provide information and suggestions only. 
                  They do not replace professional medical advice, diagnosis, or treatment. 
                  Always consult a qualified healthcare provider for medical concerns.
                </p>
              </div>
            </div>
          </div>
        </motion.div> */}
      </div>
    </Layout>
  );
};

export default CustomerHome;
