interface EsgGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

function getColor(score: number) {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}

function getGrade(score: number) {
  if (score >= 85) return "A+";
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function EsgGauge({ score, label = "Overall ESG Score", size = 160 }: EsgGaugeProps) {
  const color = getColor(score);
  const grade = getGrade(score);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75; // 270° sweep
  const filled = arc * (score / 100);
  const offset = circ * 0.125; // start at 135° (rotate -135deg)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size * 0.8 }}>
        <svg
          width={size}
          height={size * 0.8}
          viewBox="0 0 130 100"
          className="overflow-visible"
        >
          {/* Track */}
          <circle
            cx="65"
            cy="70"
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeDasharray={`${arc} ${circ - arc}`}
            strokeDashoffset={circ - offset}
            strokeLinecap="round"
            transform="rotate(-225 65 70)"
          />
          {/* Value arc */}
          <circle
            cx="65"
            cy="70"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={circ - offset}
            strokeLinecap="round"
            transform="rotate(-225 65 70)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
          {/* Center */}
          <text x="65" y="65" textAnchor="middle" dy="0.3em" fontSize="22" fontWeight="700" fill={color}>
            {score}
          </text>
          <text x="65" y="80" textAnchor="middle" fontSize="10" fill="#9ca3af">
            / 100
          </text>
        </svg>
        {/* Grade badge */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-sm font-bold text-white shadow-sm"
          style={{ background: color }}
        >
          {grade}
        </div>
      </div>
      <p className="text-xs font-medium text-gray-500 text-center mt-2">{label}</p>
    </div>
  );
}
