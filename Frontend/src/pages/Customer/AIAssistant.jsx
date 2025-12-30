import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPills, FaStethoscope, FaSearch, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaUserMd, FaRobot } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Loader from '../../components/common/Loader';
import { getMedicineInfo, clearMedicineInfo, getSymptomSuggestion, clearSymptomSuggestion } from '../../redux/slices/aiSlice';

const AIAssistant = () => {
  const dispatch = useDispatch();
  const { medicineInfo, symptomSuggestion, loading } = useSelector(state => state.ai);
  
  const [activeMode, setActiveMode] = useState('medicine'); // 'medicine' or 'symptom'
  const [medicineName, setMedicineName] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Medicine Info Handlers
  const handleMedicineSearch = (e) => {
    e.preventDefault();
    if (!medicineName.trim()) return;
    dispatch(getMedicineInfo(medicineName.trim()));
  };

  const handleMedicineClear = () => {
    setMedicineName('');
    dispatch(clearMedicineInfo());
  };

  // Symptom Checker Handlers
  const handleSymptomSearch = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    dispatch(getSymptomSuggestion(symptoms.trim()));
  };

  const handleSymptomClear = () => {
    setSymptoms('');
    dispatch(clearSymptomSuggestion());
  };

  // Switch mode and clear data
  const switchMode = (mode) => {
    setActiveMode(mode);
    if (mode === 'medicine') {
      handleSymptomClear();
    } else {
      handleMedicineClear();
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'serious':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'moderate':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'mild':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
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
        return <FaInfoCircle className="text-2xl text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4 shadow-card">
            <FaRobot className="text-5xl text-secondary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-textc-dark mb-3">
            AI Health Assistant
          </h1>
          <p className="text-textc-base text-lg">
            Get instant information about medicines or check your symptoms
          </p>
        </motion.div>

        {/* Segmented Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-gray-100 p-1.5 rounded-full inline-flex shadow-inner">
            <button
              onClick={() => switchMode('medicine')}
              className={`relative px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center gap-2 ${
                activeMode === 'medicine'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-textc-base hover:text-textc-dark'
              }`}
            >
              <FaPills className="text-lg" />
              <span>Medicine Information</span>
            </button>
            <button
              onClick={() => switchMode('symptom')}
              className={`relative px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center gap-2 ${
                activeMode === 'symptom'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-textc-base hover:text-textc-dark'
              }`}
            >
              <FaStethoscope className="text-lg" />
              <span>Symptom Checker</span>
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeMode === 'medicine' ? (
            <motion.div
              key="medicine"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Medicine Search Form */}
              <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 mb-6">
                <form onSubmit={handleMedicineSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-textc-dark mb-2">
                      Medicine Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        placeholder="Enter medicine name (e.g., paracetamol, insulin)"
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      />
                      <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || !medicineName.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-textc-dark font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-textc-dark border-t-transparent rounded-full animate-spin"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <FaSearch />
                          Get Information
                        </>
                      )}
                    </button>
                    {medicineInfo && (
                      <button
                        type="button"
                        onClick={handleMedicineClear}
                        className="px-4 py-2 bg-[#A4E685] text-[#0F5132] font-semibold rounded-lg hover:bg-[#82D15F] transition-all duration-200 text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Medicine Results */}
              {medicineInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Medicine Name Card */}
                  <div className="bg-gradient-to-r from-primary-light to-accent-cyan-light rounded-2xl shadow-card p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-md">
                        <FaPills className="text-3xl text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-textc-dark mb-1">
                          {medicineInfo.medicineName}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Information Card */}
                  {medicineInfo.information && (
                    <div className="bg-white rounded-2xl shadow-card p-8 border border-gray-100">
                      <h3 className="flex items-center gap-3 text-xl font-bold text-textc-dark mb-6 pb-3 border-b border-gray-200">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FaInfoCircle className="text-blue-600 text-xl" />
                        </div>
                        Medicine Information
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <div className="text-textc-base leading-loose whitespace-pre-line text-[15px]">
                          {medicineInfo.information}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {medicineInfo.disclaimer && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-card p-8 border-2 border-red-200">
                      <h3 className="flex items-center gap-3 text-xl font-bold text-red-800 mb-4">
                        <div className="p-2 bg-white rounded-lg">
                          <FaExclamationTriangle className="text-red-600 text-xl" />
                        </div>
                        Important Notice
                      </h3>
                      <p className="text-red-700 leading-loose text-[15px] font-medium">{medicineInfo.disclaimer}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="symptom"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Symptom Search Form */}
              <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 mb-6">
                <form onSubmit={handleSymptomSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-textc-dark mb-2">
                      Describe Your Symptoms
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Enter your symptoms (e.g., fever, headache, cough)"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || !symptoms.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-textc-dark font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-textc-dark border-t-transparent rounded-full animate-spin"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FaStethoscope />
                          Check Symptoms
                        </>
                      )}
                    </button>
                    {symptomSuggestion && (
                      <button
                        type="button"
                        onClick={handleSymptomClear}
                        className="px-4 py-2 bg-[#A4E685] text-[#0F5132] font-semibold rounded-lg hover:bg-[#82D15F] transition-all duration-200 text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Symptom Results */}
              {symptomSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Severity Card */}
                  {symptomSuggestion.severity && (
                    <div className={`rounded-2xl shadow-card p-8 border-2 ${getSeverityColor(symptomSuggestion.severity)}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm">
                          {getSeverityIcon(symptomSuggestion.severity)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-3">
                            Severity: <span className="text-2xl">{symptomSuggestion.severity}</span>
                          </h3>
                          {symptomSuggestion.symptoms && (
                            <p className="font-semibold mb-2 text-base">
                              Symptoms: <span className="font-normal">{symptomSuggestion.symptoms}</span>
                            </p>
                          )}
                          {symptomSuggestion.aiCategory && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-sm font-medium mt-2">
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                              {symptomSuggestion.aiCategory}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Suggestion */}
                  {symptomSuggestion.suggestion && (
                    <div className="bg-white rounded-2xl shadow-card p-8 border border-gray-100">
                      <h3 className="flex items-center gap-3 text-xl font-bold text-textc-dark mb-6 pb-3 border-b border-gray-200">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FaInfoCircle className="text-blue-600 text-xl" />
                        </div>
                        AI Analysis
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <div className="text-textc-base leading-loose whitespace-pre-line text-[15px]">
                          {symptomSuggestion.suggestion}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Doctor Consultation Badge */}
                  {symptomSuggestion.requiresDoctor && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-card p-8 border-2 border-red-200">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm flex-shrink-0">
                          <FaUserMd className="text-3xl text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                            <span>⚠️</span> Doctor Consultation Required
                          </h3>
                          <p className="text-red-700 leading-loose text-[15px]">
                            Based on your symptoms, we strongly recommend consulting with a healthcare professional for proper diagnosis and treatment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Can Suggest Medicine Info */}
                  {symptomSuggestion.canSuggestMedicine !== undefined && !symptomSuggestion.canSuggestMedicine && (
                    <div className="bg-yellow-50 rounded-2xl shadow-card p-8 border-2 border-yellow-200">
                      <h3 className="flex items-center gap-3 text-xl font-bold text-yellow-800 mb-4">
                        <div className="p-2 bg-white rounded-lg">
                          <FaExclamationTriangle className="text-yellow-600 text-xl" />
                        </div>
                        Important Note
                      </h3>
                      <p className="text-yellow-700 leading-loose text-[15px]">
                        Medicine suggestions are not available for these symptoms. Please consult a healthcare professional.
                      </p>
                    </div>
                  )}

                  {/* Medical Consultation Warning */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-card p-6 border-2 border-red-200">
                    <div className="flex items-start gap-4">
                      <FaUserMd className="text-3xl text-red-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-red-800 mb-2">Important Notice</h3>
                        <p className="text-red-700 leading-relaxed">
                          This is an AI-based suggestion and should not replace professional medical advice.
                          Please consult a qualified healthcare provider for proper diagnosis and treatment,
                          especially if symptoms persist or worsen.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Health Disclaimer (Always Visible) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-card p-6 border border-yellow-200"
        >
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-2xl flex-shrink-0">⚠️</div>
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Health Disclaimer</h3>
              <p className="text-yellow-700 text-sm leading-relaxed">
                Our AI-powered tools provide information and suggestions only. They do not replace professional 
                medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for 
                medical concerns.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AIAssistant;
