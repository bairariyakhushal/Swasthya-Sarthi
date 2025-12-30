import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { getVendorPharmacies, addInventory, getPharmacyInventory, updateInventory } from '../../redux/slices/vendorSlice';
import Layout from '../../components/layouts/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FiPlus, FiPackage, FiEdit2, FiMinus, FiX, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheck, FiSearch } from 'react-icons/fi';
import { FaPills, FaBoxes, FaRupeeSign } from 'react-icons/fa';

const ManageInventory = () => {
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    medicineName: '',
    sellingPrice: '',
    purchasePrice: '',
    stock: '',
  });

  const dispatch = useDispatch();
  const { pharmacies, inventory, loading } = useSelector((state) => state.vendor);

  useEffect(() => {
    dispatch(getVendorPharmacies());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPharmacy) {
      dispatch(getPharmacyInventory(selectedPharmacy));
    }
  }, [selectedPharmacy, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const inventoryData = {
      medicineName: formData.medicineName,
      sellingPrice: parseFloat(formData.sellingPrice),
      purchasePrice: parseFloat(formData.purchasePrice),
      stock: parseInt(formData.stock),
    };

    const result = await dispatch(addInventory({ 
      pharmacyId: selectedPharmacy, 
      inventoryData 
    }));
    
    if (!result.error) {
      setFormData({
        medicineName: '',
        sellingPrice: '',
        purchasePrice: '',
        stock: '',
      });
      setShowAddForm(false);
      setEditingItem(null);
      dispatch(getPharmacyInventory(selectedPharmacy));
    }
  };

  const handleStockAdjustment = async (item, adjustment) => {
    
    const inventoryData = {
      medicineName: item.medicineName,
      sellingPrice: item.sellingPrice,
      purchasePrice: item.purchasePrice,
      stock: adjustment+ item.stock,
    };

    const result = await dispatch(updateInventory({ 
      pharmacyId: selectedPharmacy, 
      inventoryData 
    }));
    
    if (!result.error) {
      dispatch(getPharmacyInventory(selectedPharmacy));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      medicineName: item.medicineName,
      sellingPrice: item.sellingPrice.toString(),
      purchasePrice: item.purchasePrice?.toString() || '',
      stock: '',
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      medicineName: '',
      sellingPrice: '',
      purchasePrice: '',
      stock: '',
    });
  };

  // Filter inventory based on search query
  const filteredInventory = inventory?.filter(item =>
    item.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Calculate inventory statistics
  const totalItems = inventory?.length || 0;
  const inStockItems = inventory?.filter(item => item.stock > 10).length || 0;
  const lowStockItems = inventory?.filter(item => item.stock > 0 && item.stock <= 10).length || 0;
  const outOfStockItems = inventory?.filter(item => item.stock === 0).length || 0;
  const totalValue = inventory?.reduce((sum, item) => sum + (item.sellingPrice * item.stock), 0) || 0;

  return (
    <Layout>
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FaBoxes className="text-2xl text-white" />
              </div>
              Manage Inventory
            </h1>
            <p className="text-gray-600 mt-2 ml-1">Add, update, and track your pharmacy's medicine stock</p>
          </div>
          {selectedPharmacy && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              {showAddForm ? <FiX className="text-lg" /> : <FiPlus className="text-lg" />}
              <span>{showAddForm ? 'Close Form' : 'Add Medicine'}</span>
            </button>
          )}
        </motion.div>

        {/* Pharmacy Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br  border-2 border-blue-200">
            <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <FaPills className="text-blue-600" />
              Select Pharmacy
            </label>
            <select
              value={selectedPharmacy}
              onChange={(e) => {
                setSelectedPharmacy(e.target.value);
                setSearchQuery('');
                setShowAddForm(false);
              }}
              className="w-full px-4 py-3.5 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-900 transition-all duration-200"
            >
              <option value="">-- Select a Pharmacy --</option>
              {pharmacies?.filter(p => p.approvalStatus === 'approved').map((pharmacy) => (
                <option key={pharmacy._id} value={pharmacy._id}>
                  {pharmacy.name} - {pharmacy.address}
                </option>
              ))}
            </select>
            {pharmacies?.length === 0 && (
              <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                <FiAlertCircle className="text-yellow-600" />
                No approved pharmacies found. Please register a pharmacy first.
              </p>
            )}
          </Card>
        </motion.div>

        {/* Inventory Statistics */}
        {selectedPharmacy && inventory && inventory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">{totalItems}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <FiPackage className="text-2xl text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Stock</p>
                    <p className="text-3xl font-bold text-green-700 mt-1">{inStockItems}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <FiCheck className="text-2xl text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-3xl font-bold text-yellow-700 mt-1">{lowStockItems}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <FiAlertCircle className="text-2xl text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                    <p className="text-3xl font-bold text-red-700 mt-1">{outOfStockItems}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <FiX className="text-2xl text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">₹{totalValue.toFixed(0)}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <FaRupeeSign className="text-2xl text-indigo-600" />
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Add/Edit Medicine Form */}
        <AnimatePresence>
          {showAddForm && selectedPharmacy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-300 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    {editingItem ? <FiEdit2 className="text-white text-xl" /> : <FiPlus className="text-white text-xl" />}
                  </div>
                  {editingItem ? `Update Stock - ${editingItem.medicineName}` : 'Add New Medicine'}
                </h2>
                {editingItem && (
                  <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-600 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                      <FiPackage className="text-lg" />
                      Current Stock: <strong className="text-lg">{editingItem.stock}</strong> units
                    </p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Medicine Name"
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleChange}
                    placeholder="Enter medicine name"
                    required
                    disabled={editingItem !== null}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Purchase Price (₹)"
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />

                    <Input
                      label="Selling Price (₹)"
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />

                    <Input
                      label={editingItem ? 'Stock Adjustment (+/-)' : 'Initial Stock Quantity'}
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder={editingItem ? 'e.g., 10 or 200' : '0'}
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : (editingItem ? 'Update Stock' : 'Add to Inventory')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inventory List */}
        {selectedPharmacy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-2 border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <FiPackage className="text-2xl text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Current Inventory</h2>
                </div>
                
                {/* Search Box */}
                {inventory && inventory.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search medicines..."
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                )}
              </div>

              {filteredInventory.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Medicine Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Purchase Price</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Selling Price</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Profit Margin</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100 bg-white">
                      {filteredInventory.map((item, index) => {
                        const profitMargin = item.purchasePrice ? (((item.sellingPrice - item.purchasePrice) / item.purchasePrice) * 100).toFixed(1) : 0;
                        return (
                          <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.medicineName}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-700">₹{item.purchasePrice?.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-700">₹{item.sellingPrice?.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center gap-1 font-semibold ${profitMargin > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {profitMargin > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                {profitMargin}%
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-lg font-bold text-gray-900">{item.stock}</span>
                              <span className="text-sm text-gray-500 ml-1">units</span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                                item.stock > 10 
                                  ? 'bg-green-100 text-green-800 border border-green-300' 
                                  : item.stock > 0 
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}>
                                {item.stock > 10 ? (
                                  <><FiCheck /> In Stock</>
                                ) : item.stock > 0 ? (
                                  <><FiAlertCircle /> Low Stock</>
                                ) : (
                                  <><FiX /> Out of Stock</>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleStockAdjustment(item, 10)}
                                  className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 rounded-lg transition-all duration-200"
                                  title="Add 10 units"
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => handleStockAdjustment(item, -10)}
                                  className="px-3 py-1.5 text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300 rounded-lg transition-all duration-200"
                                  title="Reduce 10 units"
                                  disabled={item.stock < 10}
                                >
                                  -10
                                </button>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-300"
                                  title="Adjust Stock"
                                >
                                  <FiEdit2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : inventory && inventory.length > 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiSearch className="mx-auto text-5xl mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No medicines found</p>
                  <p className="text-sm mt-2">Try adjusting your search query</p>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="inline-flex p-6 bg-gray-100 rounded-full mb-4">
                    <FiPackage className="text-6xl text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No medicines in inventory yet</h3>
                  <p className="text-sm mt-2 mb-6">Click "Add Medicine" to get started</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default ManageInventory;
