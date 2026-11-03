export const ScoreRing = ({ score = 0, size = 120, strokeWidth = 10, label = 'Overall Score' }) => {
  const clamped = Math.min(Math.max(Math.round(score), 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Determine color accent based on score tier
  const getColor = (val) => {
    if (val >= 80) return '#10b981'; // emerald
    if (val >= 65) return '#4f46e5'; // indigo
    if (val >= 50) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  const ringColor = getColor(clamped);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            {clamped}
            <span className="text-sm font-semibold text-slate-400 ml-0.5">%</span>
          </span>
        </div>
      </div>
      {label && <p className="text-xs font-semibold text-slate-500 mt-2 tracking-wide uppercase">{label}</p>}
    </div>
  );
};
