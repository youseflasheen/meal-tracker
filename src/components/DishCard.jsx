const DishCard = ({ dish, onRemove }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-card bg-surface-2 border border-border hover:border-primary/20 transition-all group animate-scale-in">
      {/* Dish Image */}
      {dish.imageBase64 && (
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border">
          <img
            src={dish.imageBase64}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Dish Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-white truncate">{dish.name}</h4>
        {dish.nutrition && (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-orange-400">
              🔥 {Math.round(dish.nutrition.calories)}
            </span>
            <span className="text-xs text-red-400">
              💪 {Math.round(dish.nutrition.protein)}g
            </span>
            <span className="text-xs text-yellow-400">
              🍞 {Math.round(dish.nutrition.carbs)}g
            </span>
          </div>
        )}
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(dish.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
          title="حذف"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default DishCard;
