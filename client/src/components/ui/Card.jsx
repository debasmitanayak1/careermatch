export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 ${
        hover ? 'hover:shadow-md hover:border-slate-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
