import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaStethoscope, FaSearch, FaPills, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaUserMd } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import { getSymptomSuggestion, clearSymptomSuggestion } from '../../redux/slices/aiSlice';

const SymptomChecker = () => {
  const dispatch = useDispatch();
  const { symptomSuggestion, loading } = useSelector(state => state.ai);
  const [symptoms, setSymptoms] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      return;
    }
    dispatch(getSymptomSuggestion(symptoms.trim()));
  };

  const handleClear = () => {
    setSymptoms('');
    dispatch(clearSymptomSuggestion());
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'serious':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'moderate':
        return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'mild':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'serious':
        return <FaExclamationTriangle className="text-2xl text-red-600" />;
      case 'moderate':
        return <FaExclamationTriangle className="text-2xl text-orange-600" />;
      case 'mild':
        return <FaCheckCircle className="text-2xl text-yellow-600" />;
      default:
        return <FaStethoscope className="text-2xl text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <FaStethoscope className="text-4xl text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Symptom Checker</h1>
          <p className="text-gray-600">Get medicine suggestions based on your symptoms (AI-powered)</p>
        </div>

        {/* Important Warning */}
        <Card className="mb-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-2xl text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Medical Disclaimer</h3>
              <p className="text-red-700 text-sm">
                This is an AI-powered tool and should NOT replace professional medical advice. 
                Always consult a qualified healthcare provider for proper diagnosis and treatment. 
                In case of emergency, call emergency services immediately.
              </p>
            </div>
          </div>
        </Card>

        {/* Search Form */}
        <Card className="mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Describe Your Symptoms"
              placeholder="e.g., headache, fever, stomach pain, cough"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              multiline
              rows={4}
            />
            <p className="text-sm text-gray-500">
              💡 Be as detailed as possible for better suggestions. Include duration, severity, and any other relevant information.
            </p>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={loading || !symptoms.trim()}
                className="flex items-center gap-2"
              >
                <FaSearch />
                {loading ? 'Analyzing...' : 'Check Symptoms'}
              </Button>
              {symptomSuggestion && (
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
              <p className="text-center text-gray-600 mt-4">AI is analyzing your symptoms...</p>
            </div>
          </Card>
        )}

        {/* Results */}
        {!loading && symptomSuggestion && (
          <div className="space-y-6">
            {/* Symptoms Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <FaStethoscope className="text-3xl text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Your Symptoms</p>
                  <p className="text-lg font-medium text-gray-800">
                    {symptomSuggestion.symptoms}
                  </p>
                </div>
              </div>
            </Card>

            {/* Severity Level */}
            <Card className={getSeverityColor(symptomSuggestion.severity)}>
              <div className="flex items-center gap-3">
                {getSeverityIcon(symptomSuggestion.severity)}
                <div className="flex-1">
                  <p className="text-sm font-medium">Severity Level</p>
                  <p className="text-2xl font-bold">{symptomSuggestion.severity}</p>
                </div>
              </div>
            </Card>

            {/* Doctor Consultation Required */}
            {symptomSuggestion.requiresDoctor && (
              <Card className="bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <FaUserMd className="text-3xl text-red-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
                      <FaExclamationTriangle />
                      Doctor Consultation Required
                    </h3>
                    <p className="text-red-700">
                      Based on your symptoms, we strongly recommend consulting a healthcare professional. 
                      This condition requires proper medical evaluation and diagnosis.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* AI Suggestion */}
            <Card>
              <div className="flex items-start gap-3 mb-4">
                <FaPills className="text-2xl text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">AI Analysis & Suggestion</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {symptomSuggestion.suggestion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medicine Suggestion Status */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  {symptomSuggestion.canSuggestMedicine ? (
                    <>
                      <FaCheckCircle className="text-green-600" />
                      <span className="text-green-700 font-medium">
                        Medicine suggestions available
                      </span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-600" />
                      <span className="text-red-700 font-medium">
                        Medicine suggestions not recommended - Please consult a doctor
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* AI Category */}
              {symptomSuggestion.aiCategory && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    Category: <span className="font-medium">{symptomSuggestion.aiCategory}</span>
                  </span>
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <Card>
              <div className="space-y-4">
                {symptomSuggestion.requiresDoctor ? (
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Recommended Actions</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => window.open('tel:108', '_self')}
                        className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <FaUserMd />
                        Call Emergency (108)
                      </Button>
                      <p className="text-sm text-gray-600">
                        Or visit the nearest hospital/clinic for immediate consultation
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-700 mb-4">
                      Want to search for medicines? Browse nearby pharmacies.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/customer/search'}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <FaSearch />
                      Search Nearby Pharmacies
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && !symptomSuggestion && (
          <Card>
            <div className="text-center py-12">
              <FaStethoscope className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                Describe your symptoms to get AI-powered suggestions
              </p>
              <p className="text-gray-400 text-sm">
                Our AI will analyze your symptoms and provide guidance on whether you need 
                medical consultation or suggest over-the-counter medicines.
              </p>
            </div>
          </Card>
        )}

        {/* Safety Information */}
        <Card className="mt-6 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">How This Works:</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">1.</span>
              <span>Describe your symptoms in detail</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">2.</span>
              <span>AI analyzes severity and determines if doctor consultation is needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">3.</span>
              <span>Receives suggestions with appropriate disclaimers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">⚠</span>
              <span className="font-medium text-red-700">
                This is NOT a substitute for professional medical advice
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
};

export default SymptomChecker;
