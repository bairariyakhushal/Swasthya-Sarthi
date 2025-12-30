import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPills, FaSearch, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import { getMedicineInfo, clearMedicineInfo } from '../../redux/slices/aiSlice';

const MedicineInfo = () => {
  const dispatch = useDispatch();
  const { medicineInfo, loading } = useSelector(state => state.ai);
  const [medicineName, setMedicineName] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      return;
    }
    dispatch(getMedicineInfo(medicineName.trim()));
  };

  const handleClear = () => {
    setMedicineName('');
    dispatch(clearMedicineInfo());
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <FaPills className="text-4xl text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Medicine Information</h1>
          <p className="text-gray-600">Get detailed information about any medicine powered by AI</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Medicine Name"
              placeholder="Enter medicine name (e.g., insulin, paracetamol)"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={loading || !medicineName.trim()}
                className="flex items-center gap-2"
              >
                <FaSearch />
                {loading ? 'Searching...' : 'Get Information'}
              </Button>
              {medicineInfo && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <div className="py-12">
              <Loader />
              <p className="text-center text-gray-600 mt-4">Fetching medicine information...</p>
            </div>
          </Card>
        )}

        {/* Results */}
        {!loading && medicineInfo && (
          <div className="space-y-6">
            {/* Medicine Name */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <FaPills className="text-3xl text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Medicine Name</p>
                  <h2 className="text-2xl font-bold text-gray-800 capitalize">
                    {medicineInfo.medicineName}
                  </h2>
                </div>
              </div>
            </Card>

            {/* Information */}
            <Card>
              <div className="flex items-start gap-3 mb-4">
                <FaInfoCircle className="text-2xl text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Detailed Information</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {medicineInfo.information}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Disclaimer */}
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-2xl text-yellow-600 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">Important Disclaimer</h3>
                  <p className="text-yellow-700">
                    {medicineInfo.disclaimer}
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    This information is AI-generated and should not replace professional medical advice. 
                    Always consult with a qualified healthcare provider before starting or stopping any medication.
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <Card>
              <div className="text-center">
                <p className="text-gray-700 mb-4">
                  Need to order this medicine? Search for nearby pharmacies.
                </p>
                <Button
                  onClick={() => {
                    // Navigate to search page with pre-filled medicine name
                    window.location.href = `/customer/search?medicine=${encodeURIComponent(medicineInfo.medicineName)}`;
                  }}
                  className="flex items-center gap-2 mx-auto"
                >
                  <FaSearch />
                  Search Nearby Pharmacies
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && !medicineInfo && (
          <Card>
            <div className="text-center py-12">
              <FaPills className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                Enter a medicine name to get detailed information
              </p>
              <p className="text-gray-400 text-sm">
                Our AI-powered system will provide you with comprehensive details including 
                dosage, side effects, and precautions.
              </p>
            </div>
          </Card>
        )}

        {/* Features Info */}
        <Card className="mt-6 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">What you'll get:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Detailed medicine description and uses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Common dosage information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Potential side effects and warnings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Important precautions and contraindications</span>
            </li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
};

export default MedicineInfo;
