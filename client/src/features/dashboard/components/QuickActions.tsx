import { useNavigate } from "react-router-dom";

interface QuickAction {
  icon: string;
  label: string;
  to: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((a) => (
        <button
          key={a.to}
          onClick={() => navigate(a.to)}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm
            hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
            style={{ background: `${a.color}15` }}
          >
            {a.icon}
          </div>
          <span className="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-green-700">
            {a.label}
          </span>
        </button>
      ))}
    </div>
  );
}
