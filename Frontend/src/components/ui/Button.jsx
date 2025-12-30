import clsx from 'clsx';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon = null,
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 " +
    "focus:ring-4 focus:ring-primary-300 shadow-md hover:shadow-lg " +
    "transition-all rounded-xl",

  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 " +
    "focus:ring-4 focus:ring-gray-300 rounded-xl transition",

  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 " +
    "focus:ring-4 focus:ring-emerald-300 shadow-md hover:shadow-lg rounded-xl transition",

  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 " +
    "focus:ring-4 focus:ring-red-300 shadow-md hover:shadow-lg rounded-xl transition",

  outline:
    "border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 " +
    "focus:ring-4 focus:ring-primary-200 rounded-xl transition",

  ghost:
    "text-gray-700 hover:bg-gray-100 active:bg-gray-200 " +
    "focus:ring-4 focus:ring-gray-300 rounded-xl transition",

  link:
    "text-primary-600 hover:text-primary-700 active:text-primary-800 " +
    "underline-offset-2 hover:underline transition",

  subtle:
    "bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 " +
    "focus:ring-4 focus:ring-primary-200 rounded-xl transition",

  soft:
    "bg-gray-50 text-gray-800 hover:bg-gray-100 active:bg-gray-200 " +
    "shadow-sm rounded-xl transition",

  pill:
    "bg-primary-600 text-white px-6 py-2 rounded-full shadow hover:bg-primary-700 " +
    "active:bg-primary-800 focus:ring-4 focus:ring-primary-300 transition",
};

  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
