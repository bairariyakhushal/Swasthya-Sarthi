import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerPharmacy } from '../../redux/slices/vendorSlice';
import Layout from '../../components/layouts/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FiMapPin, FiPhone, FiFileText } from 'react-icons/fi';
import { getCurrentLocation } from '../../utils/location';
import toast from 'react-hot-toast';

const RegisterPharmacy = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    licenseNumber: '',
    gstNumber: '',
    contactNumber: '',
    latitude: '',
    longitude: ''
  });

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.vendor);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGetLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setFormData({
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      console.log(error)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const pharmacyData = {
      name: formData.name,
      address: formData.address,
      licenseNumber: formData.licenseNumber,
      gstNumber: formData.gstNumber,
      contactNumber: formData.contactNumber,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    const result = await dispatch(registerPharmacy(pharmacyData));
    
    if (result.type === 'vendor/registerPharmacy/fulfilled') {
      setFormData({
        name: '',
        address: '',
        licenseNumber: '',
        gstNumber: '',
        contactNumber: '',
        latitude: '',
        longitude: '',
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register Pharmacy</h1>
          <p className="text-gray-600 mt-2">Fill in the details to register your pharmacy. Admin approval required.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pharmacy Name */}
            <Input
              label="Pharmacy Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter pharmacy name"
              required
            />

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Complete Address <span className="text-danger-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete pharmacy address"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* License Number */}
            <Input
              label="Drug License Number"
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="Enter drug license number"
              icon={<FiFileText />}
              required
            />

            {/* GST Number */}
            <Input
              label="GST Number (Optional)"
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="Enter GST number"
              icon={<FiFileText />}
            />

            {/* Contact Number */}
            <Input
              label="Pharmacy Contact Number"
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter 10-digit contact number"
              icon={<FiPhone />}
              required
            />

            {/* Location Coordinates */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Pharmacy Location <span className="text-danger-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  icon={<FiMapPin />}
                >
                  Get Current Location
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 19.0760"
                  step="any"
                  required
                />

                <Input
                  label="Longitude"
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g., 72.8777"
                  step="any"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Register Pharmacy
              </Button>
            </div>

            {/* Info Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your pharmacy registration will be sent for admin approval. 
                You will be notified once approved. After approval, you can add medicines to your inventory.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterPharmacy;
