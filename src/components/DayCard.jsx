const DayCard = ({ day, totals, onClick }) => {
  const date = new Date(day.date + 'T00:00:00');
  const dayName = date.toLocaleDateString('ar-EG', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
  });

  const isToday = day.date === new Date().toISOString().split('T')[0];
  const hasData = totals.mealCount > 0;

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-right p-4 rounded-card border transition-all duration-300 group
        ${
          isToday
            ? 'bg-primary/10 border-primary/30 hover:border-primary/50 ring-1 ring-primary/20'
            : hasData
            ? 'bg-surface border-border hover:border-primary/20 hover:bg-surface-2'
            : 'bg-surface/50 border-border/50 hover:border-border hover:bg-surface'
        }
      `}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-white text-sm">
            {dayName}
            {isToday && (
              <span className="mr-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                اليوم
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{dateStr}</p>
        </div>
        {hasData && (
          <div className="text-xs text-gray-500 bg-surface-2 px-2 py-1 rounded-full">
            {totals.mealCount} وجبات
          </div>
        )}
      </div>

      {/* Stats */}
      {hasData ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-bold text-orange-400">
              {Math.round(totals.calories).toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-gray-600">كالوري</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">💪</span>
            <span className="text-sm font-bold text-red-400">
              {Math.round(totals.protein)}g
            </span>
            <span className="text-xs text-gray-600">بروتين</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-600">لا توجد وجبات مسجلة</p>
      )}

      {/* Hover Arrow */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-gray-500 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default DayCard;
