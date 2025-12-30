import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaUserFriends, FaShoppingCart, FaClipboardCheck } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import { getDashboard } from '../../redux/slices/adminSlice';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboard, loading } = useSelector(state => state.admin);

  const { error } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Backend Authentication Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500 mb-4">
                The backend is having trouble validating your token.<br/>
                Error: "Something Went Wrong While Validating the Token"<br/>
                <br/>
                <strong>Backend Fix Needed:</strong> Check your authentication middleware.<br/>
                Likely causes: Database connection issue, User model query failing, or JWT verification error.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const stats = dashboard || {
    totalPharmacies: 0,
    pendingPharmacies: 0,
    approvedPharmacies: 0,
    rejectedPharmacies: 0,
    totalVolunteers: 0,
    pendingVolunteers: 0,
    approvedVolunteers: 0,
    rejectedVolunteers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  };

  const statCards = [
    {
      title: 'Total Pharmacies',
      value: stats.totalPharmacies,
      icon: FaStore,
      color: 'bg-blue-500',
      details: [
        { label: 'Approved', value: stats.approvedPharmacies },
        { label: 'Pending', value: stats.pendingPharmacies },
        { label: 'Rejected', value: stats.rejectedPharmacies },
      ],
    },
    {
      title: 'Total Volunteers',
      value: stats.totalVolunteers,
      icon: FaUserFriends,
      color: 'bg-green-500',
      details: [
        { label: 'Approved', value: stats.approvedVolunteers },
        { label: 'Pending', value: stats.pendingVolunteers },
        { label: 'Rejected', value: stats.rejectedVolunteers },
      ],
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FaShoppingCart,
      color: 'bg-purple-500',
      details: [],
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: FaClipboardCheck,
      color: 'bg-orange-500',
      details: [],
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          {(stats.pendingPharmacies > 0 || stats.pendingVolunteers > 0) && (
            <Button onClick={() => navigate('/admin/approvals')} className="flex items-center gap-2">
              <FaClipboardCheck />
              Pending Approvals ({stats.pendingPharmacies + stats.pendingVolunteers})
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                    <Icon className="text-2xl" />
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-800 mb-3">{stat.value}</p>
                {stat.details.length > 0 && (
                  <div className="space-y-1 pt-3 border-t">
                    {stat.details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{detail.label}:</span>
                        <span className="font-medium text-gray-800">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/admin/approvals')}
              variant="outline"
              className="flex items-center justify-center gap-2 py-4"
            >
              <FaClipboardCheck />
              View Pending Approvals
            </Button>
            <Button
              onClick={() => navigate('/admin/pharmacies')}
              variant="outline"
              className="flex items-center justify-center gap-2 py-4"
            >
              <FaStore />
              Manage Pharmacies
            </Button>
            <Button
              onClick={() => navigate('/admin/volunteers')}
              variant="outline"
              className="flex items-center justify-center gap-2 py-4"
            >
              <FaUserFriends />
              Manage Volunteers
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        {stats.pendingPharmacies > 0 || stats.pendingVolunteers > 0 ? (
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <FaClipboardCheck className="text-2xl text-yellow-600" />
              <div>
                <h3 className="font-bold text-gray-800">Action Required</h3>
                <p className="text-sm text-gray-700">
                  You have {stats.pendingPharmacies} pharmacy approval{stats.pendingPharmacies !== 1 ? 's' : ''} and{' '}
                  {stats.pendingVolunteers} volunteer approval{stats.pendingVolunteers !== 1 ? 's' : ''} pending review.
                </p>
              </div>
              <Button
                onClick={() => navigate('/admin/approvals')}
                className="ml-auto"
              >
                Review Now
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="mt-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <FaClipboardCheck className="text-2xl text-green-600" />
              <div>
                <h3 className="font-bold text-gray-800">All Caught Up!</h3>
                <p className="text-sm text-gray-700">
                  No pending approvals at the moment. Great job!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
