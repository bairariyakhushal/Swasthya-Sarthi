import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup, sendOTP } from '../../redux/slices/authSlice';
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiFileText, FiUpload, FiArrowLeft, FiShield } from 'react-icons/fi';
import { FaUserCircle, FaStoreAlt, FaTruck, FaUserShield } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { profileFieldsConfig } from './profileFieldsConfig';

// Secret key for admin registration
// IMPORTANT: Change this in your .env file for production
const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'swasthya_sarathi_admin_2025_secret';

const Signup = () => {
  const { profileType } = useParams(); // Get profile type from URL
  const [searchParams] = useSearchParams(); // Get query parameters
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Basic Info, 3: Profile Specific
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    accountType: profileType ? profileType.charAt(0).toUpperCase() + profileType.slice(1) : 'Customer',
    otp: '',
    // Default values for optional fields
    radius: 10,
  });
  const [profileFiles, setProfileFiles] = useState({});
  const [previewImages, setPreviewImages] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  // Profile configuration
  const profileConfig = {
    customer: {
      icon: FaUserCircle,
      color: 'blue',
      title: 'Customer Registration',
      fields: profileFieldsConfig.customer.fields
    },
    vendor: {
      icon: FaStoreAlt,
      color: 'green',
      title: 'Pharmacy/Vendor Registration',
      fields: profileFieldsConfig.vendor.fields
    },
    volunteer: {
      icon: FaTruck,
      color: 'purple',
      title: 'Delivery Partner Registration',
      fields: profileFieldsConfig.volunteer.fields
    },
    admin: {
      icon: FaUserShield,
      color: 'red',
      title: 'Administrator Registration',
      fields: profileFieldsConfig.admin.fields
    }
  };

  const currentProfile = profileConfig[profileType?.toLowerCase()] || profileConfig.customer;

  // Admin access validation
  useEffect(() => {
    if (profileType?.toLowerCase() === 'admin') {
      const secretKey = searchParams.get('secret');
      if (secretKey !== ADMIN_SECRET_KEY) {
        toast.error('Unauthorized access! Invalid secret key.');
        navigate('/signup');
      } else {
        toast.success('Admin access granted!');
      }
    }
  }, [profileType, searchParams, navigate]);

  useEffect(() => {
    if (profileType) {
      setFormData(prev => ({
        ...prev,
        accountType: profileType.charAt(0).toUpperCase() + profileType.slice(1)
      }));
    }
  }, [profileType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setProfileFiles({
        ...profileFiles,
        [name]: files[0]
      });

      // Create preview for images
      if (files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages({
            ...previewImages,
            [name]: reader.result
          });
        };
        reader.readAsDataURL(files[0]);
      }
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }

    const result = await dispatch(sendOTP(formData.email));
    
    if (result.type === 'auth/sendOTP/fulfilled') {
      setStep(2);
    }
  };

  const handleBasicInfoNext = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.contactNumber || formData.contactNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.otp) {
      toast.error('Please enter the OTP');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setStep(3);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Create FormData
    const submitData = new FormData();
    
    // Append all text fields including confirmPassword
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    // Append files
    Object.keys(profileFiles).forEach(key => {
      submitData.append(key, profileFiles[key]);
    });

    const result = await dispatch(signup(submitData));
    
    if (result.type === 'auth/signup/fulfilled') {
      navigate('/login');
    }
  };

  const ProfileIcon = currentProfile.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ProfileIcon className={`text-6xl text-${currentProfile.color}-600`} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {currentProfile.title}
          </h1>
          <p className="text-gray-600">
            {step === 1 && "Let's start with your email"}
            {step === 2 && "Complete your basic information"}
            {step === 3 && "Additional profile details"}
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  s < step ? `bg-${currentProfile.color}-600 text-white` :
                  s === step ? `bg-${currentProfile.color}-600 text-white ring-4 ring-${currentProfile.color}-200` :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 ${s < step ? `bg-${currentProfile.color}-600` : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-2xl">
          {/* Back Button */}
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
          )}

          {/* Step 1: Email & OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                icon={<FiMail />}
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> We'll send a One-Time Password (OTP) to verify your email address.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                className={`bg-gradient-to-r from-${currentProfile.color}-500 to-${currentProfile.color}-600 hover:from-${currentProfile.color}-600 hover:to-${currentProfile.color}-700`}
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <form onSubmit={handleBasicInfoNext} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  icon={<FiUser />}
                  required
                />

                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  icon={<FiUser />}
                  required
                />
              </div>

              <Input
                label="Contact Number"
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="9876543210"
                icon={<FiPhone />}
                maxLength={10}
                required
              />

              <Input
                label="OTP"
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />

              <Input
                label="Create Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                icon={<FiLock />}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                icon={<FiLock />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className={`bg-gradient-to-r from-${currentProfile.color}-500 to-${currentProfile.color}-600 hover:from-${currentProfile.color}-600 hover:to-${currentProfile.color}-700`}
              >
                Continue
              </Button>
            </form>
          )}

          {/* Step 3: Profile Specific Fields */}
          {step === 3 && (
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-indigo-800">
                  <strong>Almost there!</strong> Please provide the following {formData.accountType.toLowerCase()}-specific details.
                </p>
              </div>

              {/* This section will be populated dynamically based on profile */}
              {currentProfile.fields.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Profile-specific fields will be rendered here based on the configuration you provide.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <p className="text-sm text-yellow-800">
                      <strong>Developer Note:</strong> Add profile-specific field configuration to render dynamic fields.
                    </p>
                  </div>
                </div>
              )}

              {/* Render dynamic fields based on profileConfig */}
              {currentProfile.fields.map((field, index) => {
                if (field.type === 'file') {
                  return (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                              <FiUpload className="text-xl" />
                              <span className="text-sm">
                                {profileFiles[field.name] ? profileFiles[field.name].name : `Upload ${field.label}`}
                              </span>
                            </div>
                          </div>
                          <input
                            type="file"
                            name={field.name}
                            onChange={handleFileChange}
                            accept={field.accept}
                            required={field.required}
                            className="hidden"
                          />
                        </label>
                        {previewImages[field.name] && (
                          <img src={previewImages[field.name]} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                        )}
                      </div>
                      {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
                    </div>
                  );
                } else if (field.type === 'textarea') {
                  return (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={field.rows || 4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
                    </div>
                  );
                } else if (field.type === 'select') {
                  return (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        required={field.required}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option, idx) => (
                          <option key={idx} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
                    </div>
                  );
                } else {
                  return (
                    <Input
                      key={index}
                      label={field.label}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  );
                }
              })}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  className={`bg-gradient-to-r from-${currentProfile.color}-500 to-${currentProfile.color}-600 hover:from-${currentProfile.color}-600 hover:to-${currentProfile.color}-700`}
                >
                  Complete Registration
                </Button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className={`text-${currentProfile.color}-600 hover:text-${currentProfile.color}-700 font-semibold transition-colors`}
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>

        {/* Change Profile Type */}
        <div className="text-center mt-6">
          <Link
            to="/signup"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Change Profile Type
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
