import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaStore, FaUserFriends, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import {
  getPendingPharmacies,
  getPendingVolunteers,
  updatePharmacyApproval,
  updateVolunteerApproval,
} from '../../redux/slices/adminSlice';
import { APPROVAL_STATUS } from '../../utils/constants';

const PendingApprovals = () => {
  const dispatch = useDispatch();
  const { pendingPharmacies, pendingVolunteers, loading } = useSelector(state => state.admin);
  const { user } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('pharmacies');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    dispatch(getPendingPharmacies());
    dispatch(getPendingVolunteers());
  }, [dispatch]);

  const handleApproveClick = (item, type) => {
    setSelectedItem({ ...item, type });
    setAction('approve');
    setShowModal(true);
  };

  const handleRejectClick = (item, type) => {
    setSelectedItem({ ...item, type });
    setAction('reject');
    setRejectionReason('');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedItem || !user) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    const approvalData = {
      approvalStatus: action === 'approve' ? APPROVAL_STATUS.APPROVED : APPROVAL_STATUS.REJECTED,
      approvedBy: user._id,
      rejectionReason: action === 'reject' ? rejectionReason : undefined,
    };

    try {
      if (selectedItem.type === 'pharmacy') {
        await dispatch(updatePharmacyApproval({
          pharmacyId: selectedItem._id,
          approvalData,
        })).unwrap();
      } else {
        await dispatch(updateVolunteerApproval({
          volunteerId: selectedItem._id,
          approvalData,
        })).unwrap();
      }

      // Refresh lists
      dispatch(getPendingPharmacies());
      dispatch(getPendingVolunteers());
      setShowModal(false);
      setSelectedItem(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Approval action failed:', error);
    }
  };

  const PharmacyCard = ({ pharmacy }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FaStore className="text-2xl text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{pharmacy.name}</h3>
            <p className="text-sm text-gray-600">Owner: {pharmacy.owner?.firstName} {pharmacy.owner?.lastName}</p>
            <p className="text-xs text-gray-500">{pharmacy.owner?.email}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          Pending
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">License Number</p>
            <p className="font-medium text-gray-800">{pharmacy.licenseNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">GST Number</p>
            <p className="font-medium text-gray-800">{pharmacy.gstNumber || 'N/A'}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Address</p>
          <p className="font-medium text-gray-800 text-sm">{pharmacy.address}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Owner Contact</p>
            <p className="font-medium text-gray-800">{pharmacy.owner?.contactNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Pharmacy Contact</p>
            <p className="font-medium text-gray-800">{pharmacy.contactNumber}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Latitude</p>
            <p className="font-medium text-gray-800">{pharmacy.coordinates?.latitude || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Longitude</p>
            <p className="font-medium text-gray-800">{pharmacy.coordinates?.longitude || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={() => handleApproveClick(pharmacy, 'pharmacy')}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <FaCheck />
          Approve
        </Button>
        <Button
          onClick={() => handleRejectClick(pharmacy, 'pharmacy')}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
        >
          <FaTimes />
          Reject
        </Button>
      </div>
    </Card>
  );

  const VolunteerCard = ({ volunteer }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <FaUserFriends className="text-2xl text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {volunteer.user?.firstName} {volunteer.user?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{volunteer.user?.email}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          Pending
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Contact</p>
            <p className="font-medium text-gray-800">{volunteer.user?.contactNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Age</p>
            <p className="font-medium text-gray-800">{volunteer.age} years</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Vehicle Type</p>
            <p className="font-medium text-gray-800">{volunteer.vehicleType?.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-gray-600">Vehicle Number</p>
            <p className="font-medium text-gray-800">{volunteer.vehicleNumber}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Driving License</p>
          <p className="font-medium text-gray-800 text-sm">{volunteer.drivingLicense}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Service City</p>
            <p className="font-medium text-gray-800">{volunteer.serviceArea?.city}</p>
          </div>
          <div>
            <p className="text-gray-600">Service Radius</p>
            <p className="font-medium text-gray-800">{volunteer.serviceArea?.radius} km</p>
          </div>
        </div>
        <div className="pt-2">
          <p className="text-gray-600 text-sm mb-2">Documents:</p>
          <div className="flex gap-2">
            {volunteer.drivingLicenseDocument && (
              <a
                href={volunteer.drivingLicenseDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <FaEye /> DL
              </a>
            )}
            {volunteer.aadharDocument && (
              <a
                href={volunteer.aadharDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <FaEye /> Aadhar
              </a>
            )}
            {volunteer.profilePhoto && (
              <a
                href={volunteer.profilePhoto}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
              >
                <FaEye /> Photo
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={() => handleApproveClick(volunteer, 'volunteer')}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <FaCheck />
          Approve
        </Button>
        <Button
          onClick={() => handleRejectClick(volunteer, 'volunteer')}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
        >
          <FaTimes />
          Reject
        </Button>
      </div>
    </Card>
  );

  if (loading && !pendingPharmacies.length && !pendingVolunteers.length) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Pending Approvals</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('pharmacies')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'pharmacies'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaStore className="inline mr-2" />
            Pharmacies ({pendingPharmacies.length})
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'volunteers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaUserFriends className="inline mr-2" />
            Volunteers ({pendingVolunteers.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'pharmacies' ? (
          pendingPharmacies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPharmacies.map(pharmacy => (
                <PharmacyCard key={pharmacy._id} pharmacy={pharmacy} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-8">No pending pharmacy approvals</p>
            </Card>
          )
        ) : (
          pendingVolunteers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingVolunteers.map(volunteer => (
                <VolunteerCard key={volunteer._id} volunteer={volunteer} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-8">No pending volunteer approvals</p>
            </Card>
          )
        )}

        {/* Confirmation Modal */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {action === 'approve' ? 'Approve' : 'Reject'} {selectedItem.type === 'pharmacy' ? 'Pharmacy' : 'Volunteer'}
              </h2>
              
              <p className="text-gray-700 mb-4">
                Are you sure you want to {action} <strong>{selectedItem.name || `${selectedItem.firstName} ${selectedItem.lastName}`}</strong>?
              </p>

              {action === 'reject' && (
                <div className="mb-4">
                  <Input
                    label="Rejection Reason"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    multiline
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmAction}
                  disabled={loading}
                  className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {loading ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
                </Button>
                <Button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedItem(null);
                    setRejectionReason('');
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PendingApprovals;
