import DishCard from './DishCard';

const MealSection = ({ meal, mealTotals, onAddDish, onRemoveDish }) => {
  const hasDishes = meal.dishes && meal.dishes.length > 0;

  return (
    <div className="bg-surface rounded-card border border-border p-4 transition-all hover:border-border/80">
      {/* Meal Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meal.icon}</span>
          <div>
            <h3 className="font-bold text-white text-sm">{meal.label}</h3>
            <span className="text-xs text-gray-500">⏰ {meal.time}</span>
          </div>
        </div>

        {hasDishes && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-orange-400 font-semibold">
              🔥 {Math.round(mealTotals.calories)}
            </span>
            <span className="text-red-400 font-semibold">
              💪 {Math.round(mealTotals.protein)}g
            </span>
          </div>
        )}
      </div>

      {/* Dishes List */}
      {hasDishes && (
        <div className="space-y-2 mb-3">
          {meal.dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onRemove={(dishId) => onRemoveDish(dishId)}
            />
          ))}
        </div>
      )}

      {/* Add Dish Button */}
      <button
        onClick={onAddDish}
        className="w-full py-2.5 rounded-btn border border-dashed border-border hover:border-primary/40 text-gray-500 hover:text-primary text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-primary/5"
      >
        <span className="text-lg">➕</span>
        إضافة طبق
      </button>
    </div>
  );
};

export default MealSection;
