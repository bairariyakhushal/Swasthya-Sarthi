/**
 * Profile-Specific Field Configuration
 * 
 * This file contains the configuration for profile-specific fields
 * that will be rendered in Step 3 of the signup process.
 * 
 * Add this configuration to the Signup.jsx component's profileConfig object
 */

export const profileFieldsConfig = {
  customer: {
    fields: [
      {
        name: 'city',
        label: 'City',
        type: 'text',
        placeholder: 'Enter your city',
        required: true,
        hint: 'City where you want to order medicines'
      }
    ]
  },

  vendor: {
    fields: [
      {
        name: 'GSTIN',
        label: 'GSTIN',
        type: 'text',
        placeholder: 'Enter GST Identification Number',
        required: true,
        hint: 'Your pharmacy GST number'
      },
      {
        name: 'licenseNumber',
        label: 'License Number',
        type: 'text',
        placeholder: 'Enter pharmacy license number',
        required: true,
        hint: 'Your pharmacy license number'
      },
      {
        name: 'city',
        label: 'City',
        type: 'text',
        placeholder: 'Enter city',
        required: true,
        hint: 'City where your pharmacy is located'
      }
    ]
  },

  volunteer: {
    fields: [
      {
        name: 'drivingLicense',
        label: 'Driving License Number',
        type: 'text',
        placeholder: 'Enter driving license number',
        required: true,
        hint: 'Your driving license number'
      },
      {
        name: 'age',
        label: 'Age',
        type: 'number',
        placeholder: 'Enter your age',
        required: true,
        hint: 'Your current age'
      },
      {
        name: 'vehicleType',
        label: 'Vehicle Type',
        type: 'select',
        required: true,
        options: [
          { value: 'motorcycle', label: 'Bike' },
          { value: 'auto', label: 'Auto' },
          { value: 'bicycle', label: 'Bicycle' },
          { value: 'car', label: 'Car' }
        ],
        hint: 'Select your vehicle for deliveries'
      },
      {
        name: 'vehicleNumber',
        label: 'Vehicle Number',
        type: 'text',
        placeholder: 'e.g., KA01AB1234',
        required: true,
        hint: 'Enter vehicle registration number'
      },
      {
        name: 'city',
        label: 'City',
        type: 'text',
        placeholder: 'Enter city',
        required: true,
        hint: 'City where you will deliver'
      },
      {
        name: 'radius',
        label: 'Delivery Radius (km)',
        type: 'number',
        placeholder: 'Enter delivery radius (default: 10 km)',
        required: false,
        hint: 'Maximum distance you can travel for deliveries (default: 10 km)'
      }
    ]
  },

  admin: {
    fields: [
      {
        name: 'city',
        label: 'City',
        type: 'text',
        placeholder: 'Enter city',
        required: true,
        hint: 'Your office city'
      }
    ]
  }
};

/**
 * How to use:
 * 
 * 1. Import this configuration in Signup.jsx:
 *    import { profileFieldsConfig } from './profileFieldsConfig';
 * 
 * 2. Update the profileConfig in Signup.jsx:
 *    const profileConfig = {
 *      customer: {
 *        icon: FaUserCircle,
 *        color: 'blue',
 *        title: 'Customer Registration',
 *        fields: profileFieldsConfig.customer.fields
 *      },
 *      vendor: {
 *        icon: FaStoreAlt,
 *        color: 'green',
 *        title: 'Pharmacy/Vendor Registration',
 *        fields: profileFieldsConfig.vendor.fields
 *      },
 *      volunteer: {
 *        icon: FaTruck,
 *        color: 'purple',
 *        title: 'Delivery Partner Registration',
 *        fields: profileFieldsConfig.volunteer.fields
 *      }
 *    };
 * 
 * Field Types Supported:
 * - text: Regular text input
 * - email: Email input
 * - tel: Phone number input
 * - textarea: Multi-line text input
 * - select: Dropdown selection
 * - file: File upload
 * - date: Date picker
 * - time: Time picker
 * - number: Numeric input
 * 
 * Field Properties:
 * - name: Field name (used in formData)
 * - label: Display label
 * - type: Input type
 * - placeholder: Placeholder text
 * - required: Boolean (true/false)
 * - hint: Helper text below the field
 * - options: Array of {value, label} for select fields
 * - accept: File types for file inputs
 * - rows: Number of rows for textarea
 * - maxLength: Maximum character length
 */
