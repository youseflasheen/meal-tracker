const NutritionTable = ({ nutrition, size = 'normal' }) => {
  if (!nutrition) return null;

  const items = [
    { icon: '🔥', label: 'السعرات', value: Math.round(nutrition.calories), unit: 'كالوري', color: 'text-orange-400' },
    { icon: '💪', label: 'البروتين', value: Math.round(nutrition.protein * 10) / 10, unit: 'جرام', color: 'text-red-400' },
    { icon: '🍞', label: 'الكارب', value: Math.round(nutrition.carbs * 10) / 10, unit: 'جرام', color: 'text-yellow-400' },
    { icon: '🫒', label: 'الدهون', value: Math.round(nutrition.fat * 10) / 10, unit: 'جرام', color: 'text-emerald-400' },
    { icon: '🌾', label: 'الألياف', value: Math.round(nutrition.fiber * 10) / 10, unit: 'جرام', color: 'text-amber-600' },
  ];

  if (size === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 3).map((item) => (
          <span key={item.label} className="flex items-center gap-1 text-xs text-gray-400">
            <span>{item.icon}</span>
            <span className={item.color}>{item.value}</span>
            <span className="text-gray-600">{item.unit}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-2/50 hover:bg-surface-2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="nutrition-icon">{item.icon}</span>
            <span className="text-sm text-gray-300">{item.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
            <span className="text-xs text-gray-500">{item.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NutritionTable;
