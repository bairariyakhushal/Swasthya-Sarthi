import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaShoppingCart, FaPhoneAlt, FaUser, FaStore, FaPills, FaCheckCircle, FaTimesCircle, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Loader from '../../components/common/Loader';
import { searchMedicines, setUserLocation } from '../../redux/slices/customerSlice';
import { getCurrentLocation } from '../../utils/location';
import { formatCurrency } from '../../utils/formatters';
import ProductCard from '../../components/ui/ProductCard';

const SearchMedicine = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchResults, searchMetadata, userLocation, loading } = useSelector(state => state.customer);

  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(5); // 5km default
  const [cart, setCart] = useState({});
  const [sortBy, setSortBy] = useState('distance'); // distance, price
  const [filterAvailable, setFilterAvailable] = useState(false);

  useEffect(() => {
    // Check if location data passed from navbar
    if (location.state) {
      const { latitude, longitude, radius: navRadius, medicineName } = location.state;
      
      if (latitude && longitude) {
        dispatch(setUserLocation({ latitude, longitude }));
        if (navRadius) setRadius(navRadius);
        if (medicineName) {
          setSearchQuery(medicineName);
          // Auto-search if all params are provided
          dispatch(searchMedicines({
            latitude,
            longitude,
            radius: navRadius || 5,
            medicineName,
          }));
        }
      }
    } else if (!userLocation) {
      // Automatically get user location on mount
      handleGetLocation();
    }
  }, [location.state]);

  // Auto-set location on component mount for search readiness
  useEffect(() => {
    if (!userLocation && !location.state) {
      handleGetLocation();
    }
  }, []);

  const handleGetLocation = async () => {
    try {
      const location = await getCurrentLocation();
      dispatch(setUserLocation(location));
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    if (!userLocation) {
      alert('Please enable location access to search for medicines');
      return;
    }

    dispatch(searchMedicines({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius,
      medicineName: searchQuery.trim(),
    }));
  };

  const handleAddToCart = (pharmacy) => {
    const key = `${pharmacy.pharmacyId}-${pharmacy.medicineName}`;
    const currentQty = cart[key]?.quantity || 0;
    
    setCart({
      ...cart,
      [key]: {
        pharmacy,
        quantity: currentQty + 1,
      },
    });
  };

  const handleRemoveFromCart = (pharmacy) => {
    const key = `${pharmacy.pharmacyId}-${pharmacy.medicineName}`;
    const currentQty = cart[key]?.quantity || 0;
    
    if (currentQty > 1) {
      setCart({
        ...cart,
        [key]: {
          pharmacy,
          quantity: currentQty - 1,
        },
      });
    } else {
      const newCart = { ...cart };
      delete newCart[key];
      setCart(newCart);
    }
  };

  const getCartQuantity = (pharmacy) => {
    const key = `${pharmacy.pharmacyId}-${pharmacy.medicineName}`;
    return cart[key]?.quantity || 0;
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  // Sort and filter results
  const getSortedAndFilteredResults = () => {
    let results = [...searchResults];
    
    // Filter by availability
    if (filterAvailable) {
      results = results.filter(item => item.isAvailable);
    }
    
    // Sort
    if (sortBy === 'distance') {
      results.sort((a, b) => {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distA - distB;
      });
    } else if (sortBy === 'price') {
      results.sort((a, b) => a.price - b.price);
    }
    
    return results;
  };

  const filteredResults = getSortedAndFilteredResults();

  const handleProceedToCheckout = () => {
    // Group cart items by pharmacy
    const ordersByPharmacy = {};
    Object.values(cart).forEach(item => {
      const pharmacyId = item.pharmacy.pharmacyId;
      if (!ordersByPharmacy[pharmacyId]) {
        ordersByPharmacy[pharmacyId] = {
          pharmacy: {
            _id: item.pharmacy.pharmacyId,
            name: item.pharmacy.pharmacyName,
            address: item.pharmacy.address,
            contactNumber: item.pharmacy.ownerContact,
          },
          medicines: [],
        };
      }
      ordersByPharmacy[pharmacyId].medicines.push({
        medicineName: item.pharmacy.medicineName,
        quantity: item.quantity,
        price: item.pharmacy.price,
        total: item.pharmacy.price * item.quantity,
      });
    });

    navigate('/customer/checkout', { state: { ordersByPharmacy } });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-18"
        >
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-textc-dark mb-2">
              Search Medicines
            </h1>
            <p className="text-textc-base">Find medicines from nearby pharmacies</p>
          </div>
          
          {getTotalItems() > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleProceedToCheckout}
              className="px-6 py-3 text-gray-800 border-2 border-gray-400 font-semibold rounded-full hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <FaShoppingCart />
              Checkout ({getTotalItems()})
            </motion.button>
          )}
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="py-20">
            <Loader />
            <p className="text-center text-textc-base mt-4">Searching nearby pharmacies...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-6">
            {/* Results Header with Sort & Filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl shadow-card p-4 mb-20"
            >
              <div className="flex items-center gap-3">
                <FaPills className="text-2xl text-primary" />
                <div>
                  <p className="font-bold text-textc-dark">
                    {filteredResults.length} Result{filteredResults.length !== 1 ? 's' : ''} Found
                  </p>
                  {searchMetadata && (
                    <p className="text-sm text-textc-base">{searchMetadata.message}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Filter Toggle */}
                <button
                  onClick={() => setFilterAvailable(!filterAvailable)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    filterAvailable
                      ? 'bg-primary text-textc-dark shadow-md'
                      : 'bg-gray-100 text-textc-base hover:bg-gray-200'
                  }`}
                >
                  <FaFilter />
                  Available Only
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <FaSortAmountDown className="text-textc-base" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-100 text-textc-base rounded-xl font-medium text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="distance">Sort by Distance</option>
                    <option value="price">Sort by Price</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Medicine Cards - Modern E-commerce Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2   gap-10">
              <AnimatePresence>
                {filteredResults.map((pharmacy, idx) => {
                  const cartQty = getCartQuantity(pharmacy);
                  return (
                    <ProductCard
                key={`${pharmacy.pharmacyId}-${idx}`}
                pharmacy={pharmacy}
                index={idx}
                cartQty={getCartQuantity(pharmacy)}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                formatCurrency={formatCurrency}
              />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : searchQuery ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-card p-12 text-center"
          >
            <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
              <FaSearch className="text-5xl text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-textc-dark mb-2">No Results Found</h3>
            <p className="text-textc-base mb-6">
              No medicines found matching "{searchQuery}". Try adjusting your search or radius.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterAvailable(false);
              }}
              className="px-6 py-3 bg-primary text-textc-dark font-medium rounded-xl hover:bg-primary-dark transition-all duration-200"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-card p-12 text-center"
          >
            <div className="inline-flex p-6 bg-primary-light rounded-full mb-4">
              <FaPills className="text-5xl text-primary" />
            </div>
            <h3 className="text-xl font-bold text-textc-dark mb-2">Start Searching</h3>
            <p className="text-textc-base">
              Enter a medicine name above to find available pharmacies near you.
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default SearchMedicine;
