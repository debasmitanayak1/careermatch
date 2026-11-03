export const SkillBadge = ({
  name,
  variant = 'blue',
  size = 'md',
  onRemove,
}) => {
  const variantStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-xs px-3 py-1.5 font-medium',
    lg: 'text-sm px-4 py-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border transition-colors ${
        variantStyles[variant] || variantStyles.blue
      } ${sizeStyles[size]}`}
    >
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove skill ${name}`}
          className="hover:opacity-75 focus:outline-none"
        >
          &times;
        </button>
      )}
    </span>
  );
};
