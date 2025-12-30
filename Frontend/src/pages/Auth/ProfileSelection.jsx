import { Link } from 'react-router-dom';
import { FaUserCircle, FaStoreAlt, FaTruck, FaUserShield } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProfileSelection = () => {
  const profiles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Order medicines and track deliveries',
      icon: FaUserCircle,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      features: ['Search medicines', 'Order online', 'Track deliveries', 'Upload prescriptions'],
      link: '/signup/customer'
    },
    {
      id: 'vendor',
      title: 'Pharmacy/Vendor',
      description: 'Manage your pharmacy and inventory',
      icon: FaStoreAlt,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      features: ['Manage inventory', 'Process orders', 'Track sales', 'Verify prescriptions'],
      link: '/signup/vendor'
    },
    {
      id: 'volunteer',
      title: 'Delivery Partner',
      description: 'Deliver medicines and earn money',
      icon: FaTruck,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      features: ['Accept deliveries', 'Flexible schedule', 'Track earnings', 'Navigate routes'],
      link: '/signup/volunteer'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage platform and users',
      icon: FaUserShield,
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      features: ['Manage users', 'Approve vendors', 'Monitor platform', 'View analytics'],
      link: '/signup/admin',
      restricted: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome to Swasthya Sarathi
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Choose your profile to get started
            </p>
            <p className="text-sm text-gray-500">
              Select the profile type that best describes you
            </p>
          </motion.div>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {profiles.map((profile, index) => {
            const Icon = profile.icon;
            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={profile.link}
                  className={`block ${profile.restricted ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full`}>
                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-r ${profile.color} ${profile.hoverColor} p-6 transition-all duration-300`}>
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="text-5xl text-white" />
                        {profile.restricted && (
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                            Restricted
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {profile.title}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {profile.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="p-6">
                      <ul className="space-y-3">
                        {profile.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {!profile.restricted && (
                        <button className={`mt-6 w-full bg-gradient-to-r ${profile.color} text-white font-semibold py-3 rounded-lg transition-all duration-300 ${profile.hoverColor} shadow-md hover:shadow-lg`}>
                          Sign Up as {profile.title}
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-4">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <Link to="/about" className="hover:text-gray-700 transition-colors">
              About Us
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-gray-700 transition-colors">
              Contact
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSelection;
