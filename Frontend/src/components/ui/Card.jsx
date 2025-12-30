import clsx from 'clsx';

const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl shadow-card transition-all duration-200',
        paddings[padding],
        hover && 'hover:shadow-soft cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
