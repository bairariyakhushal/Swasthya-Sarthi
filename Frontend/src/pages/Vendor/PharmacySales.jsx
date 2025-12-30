import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorPharmacies, getPharmacySales, getTopMedicines } from '../../redux/slices/vendorSlice';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import { FiDollarSign, FiTrendingUp, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const PharmacySales = () => {
  const dispatch = useDispatch();
  const { pharmacies, sales, topMedicines, loading } = useSelector((state) => state.vendor);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');

  useEffect(() => {
    dispatch(getVendorPharmacies());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPharmacy) {
      dispatch(getPharmacySales(selectedPharmacy));
      dispatch(getTopMedicines(selectedPharmacy));
    }
  }, [selectedPharmacy, dispatch]);

  const approvedPharmacies = Array.isArray(pharmacies) 
    ? pharmacies.filter(p => p.approvalStatus === 'approved') 
    : [];

  const salesData = Array.isArray(sales) ? sales : [];
  const topMedsData = Array.isArray(topMedicines) ? topMedicines : [];

  // Calculate total sales and orders
  const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalOrders = salesData.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Group sales by date
  const salesByDate = salesData.reduce((acc, sale) => {
    const date = sale.orderDate || new Date(sale.orderPlacedAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, orders: 0 };
    }
    acc[date].revenue += sale.totalAmount || 0;
    acc[date].orders += 1;
    return acc;
  }, {});

  const dailySales = Object.values(salesByDate).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sales Analytics</h1>

        {/* Pharmacy Selection */}
        <Card className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Pharmacy
          </label>
          <select
            value={selectedPharmacy}
            onChange={(e) => setSelectedPharmacy(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Select a Pharmacy --</option>
            {approvedPharmacies.map((pharmacy) => (
              <option key={pharmacy._id} value={pharmacy._id}>
                {pharmacy.name} - {pharmacy.address}
              </option>
            ))}
          </select>
          {approvedPharmacies.length === 0 && (
            <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
              <FiDollarSign className="flex-shrink-0" />
              No approved pharmacies found. Please register and get approval for a pharmacy first.
            </p>
          )}
        </Card>

        {loading ? (
          <Loader />
        ) : !selectedPharmacy ? (
          <Card>
            <div className="text-center py-12">
              <FiDollarSign className="mx-auto text-6xl text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">Please select a pharmacy to view sales analytics</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-100 rounded-lg">
                    <FiDollarSign className="text-3xl text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-100 rounded-lg">
                    <FiShoppingCart className="text-3xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-purple-100 rounded-lg">
                    <FiTrendingUp className="text-3xl text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{avgOrderValue.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling Medicines */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaPills className="text-2xl text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Top Selling Medicines</h2>
                </div>
                {topMedsData.length === 0 ? (
                  <div className="text-center py-8">
                    <FiPackage className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-600">No sales data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topMedsData.map((medicine, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{medicine.name}</p>
                            <p className="text-sm text-gray-600">
                              {medicine.totalQuantity} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹{(medicine.totalRevenue || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Daily Sales */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FiTrendingUp className="text-2xl text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Daily Sales</h2>
                </div>
                {dailySales.length === 0 ? (
                  <div className="text-center py-8">
                    <FiDollarSign className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-600">No sales data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailySales.slice(0, 10).map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{day.date}</p>
                          <p className="text-sm text-gray-600">{day.orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{day.revenue.toFixed(2)}</p>
                          <p className="text-xs text-gray-600">revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Sales Table */}
            {salesData.length > 0 && (
              <Card className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sales</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Items</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesData.slice(0, 20).map((sale) => (
                        <tr key={sale.orderId || sale._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            #{sale.orderId || sale._id?.slice(-8)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {sale.orderDate || new Date(sale.orderPlacedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {sale.customerName || `${sale.customer?.firstName} ${sale.customer?.lastName}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {sale.medicineCount || sale.medicines?.length || 0} items
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            ₹{(sale.totalAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PharmacySales;
