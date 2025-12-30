// API constants
export const API_BASE_URLS = {
  AUTH: import.meta.env.VITE_API_BASE_AUTH,
  ADMIN: import.meta.env.VITE_API_BASE_ADMIN,
  VENDOR: import.meta.env.VITE_API_BASE_VENDOR,
  CUSTOMER: import.meta.env.VITE_API_BASE_CUSTOMER,
  VOLUNTEER: import.meta.env.VITE_API_BASE_VOLUNTEER,
  PHARMACY: import.meta.env.VITE_API_BASE_PHARMACY,
  ORDER: import.meta.env.VITE_API_BASE_ORDER,
};

// User account types (matching backend enum)
export const ACCOUNT_TYPES = {
  CUSTOMER: 'Customer',
  VENDOR: 'Vendor',
  VOLUNTEER: 'Volunteer',
  ADMIN: 'Admin',
};

// For backward compatibility
export const USER_ROLES = ACCOUNT_TYPES;

// Order statuses (matching backend)
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  READY_FOR_PICKUP: 'ready_for_pickup',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Delivery types
export const DELIVERY_TYPES = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
};

// Default search radius (in meters)
export const DEFAULT_SEARCH_RADIUS = 5000;

// Prescription requirement
export const PRESCRIPTION_REQUIRED = ['prescription_required', 'rx'];

// Vehicle types for volunteers
export const VEHICLE_TYPES = {
  BICYCLE: 'bicycle',
  MOTORCYCLE: 'motorcycle',
  CAR: 'car',
  AUTO: 'auto',
};

// Approval statuses
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};
