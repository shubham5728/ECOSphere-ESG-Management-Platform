interface ActivityItem {
  id: string;
  text: string;
  sub: string;
  time: string;
  color: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-0">
      {items.map((item, idx) => (
        <div key={item.id} className="flex gap-3 group">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full shadow-sm border border-gray-100"
              style={{ background: `${item.color}15` }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            </div>
            {idx < items.length - 1 && (
              <div className="w-px flex-1 bg-gray-100 my-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 flex-1 min-w-0">
            <p className="text-sm text-gray-800 font-medium leading-snug">{item.text}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {item.sub}
              </span>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
