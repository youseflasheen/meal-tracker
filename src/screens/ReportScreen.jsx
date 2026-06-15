import { useMemo } from 'react';
import { MEAL_DEFINITIONS } from '../hooks/useStorage';

const ReportScreen = ({ date, storage, onNavigate }) => {
  const day = storage.getDay(date);
  const dayTotals = storage.getDayTotals(date);

  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calorie targets (can be customized later)
  const targets = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25,
  };

  const getPercentage = (value, target) => {
    return Math.min(Math.round((value / target) * 100), 100);
  };

  const getBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-primary';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!day) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-500">لا توجد بيانات لهذا اليوم</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 px-6 py-2 rounded-btn bg-surface-2 text-gray-400 hover:text-white transition-all"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-app mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('day', { date })}
              className="p-2 -mr-2 rounded-btn text-gray-400 hover:text-white hover:bg-surface-2 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <h1 className="text-sm font-bold text-white">📊 تقرير اليوم</h1>
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
      </header>

      <div className="max-w-app mx-auto px-4 py-6 space-y-6">
        {/* Main Summary Card */}
        <div className="bg-gradient-to-br from-primary/15 via-surface to-surface-2 rounded-card border border-primary/20 p-6 text-center animate-scale-in">
          <h2 className="text-sm font-bold text-gray-400 mb-4">إجمالي اليوم</h2>

          <div className="mb-6">
            <span className="text-3xl">🔥</span>
            <p className="text-4xl font-black text-orange-400 mt-1">
              {Math.round(dayTotals.calories).toLocaleString('ar-EG')}
            </p>
            <p className="text-sm text-gray-500">كالوري</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-black/20 rounded-lg p-2">
              <span className="text-sm">💪</span>
              <p className="text-sm font-bold text-red-400 mt-1">{Math.round(dayTotals.protein)}g</p>
              <p className="text-[10px] text-gray-600">بروتين</p>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <span className="text-sm">🍞</span>
              <p className="text-sm font-bold text-yellow-400 mt-1">{Math.round(dayTotals.carbs)}g</p>
              <p className="text-[10px] text-gray-600">كارب</p>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <span className="text-sm">🫒</span>
              <p className="text-sm font-bold text-emerald-400 mt-1">{Math.round(dayTotals.fat)}g</p>
              <p className="text-[10px] text-gray-600">دهون</p>
            </div>
            <div className="bg-black/20 rounded-lg p-2">
              <span className="text-sm">🌾</span>
              <p className="text-sm font-bold text-amber-600 mt-1">{Math.round(dayTotals.fiber)}g</p>
              <p className="text-[10px] text-gray-600">ألياف</p>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="bg-surface rounded-card border border-border p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
            <span>📈</span>
            التقدم نحو الهدف
          </h3>

          {[
            { label: 'السعرات', icon: '🔥', value: dayTotals.calories, target: targets.calories, unit: 'كالوري', color: 'bg-orange-500' },
            { label: 'البروتين', icon: '💪', value: dayTotals.protein, target: targets.protein, unit: 'g', color: 'bg-red-500' },
            { label: 'الكارب', icon: '🍞', value: dayTotals.carbs, target: targets.carbs, unit: 'g', color: 'bg-yellow-500' },
            { label: 'الدهون', icon: '🫒', value: dayTotals.fat, target: targets.fat, unit: 'g', color: 'bg-emerald-500' },
            { label: 'الألياف', icon: '🌾', value: dayTotals.fiber, target: targets.fiber, unit: 'g', color: 'bg-amber-600' },
          ].map((item) => {
            const pct = getPercentage(item.value, item.target);
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{item.icon}</span>
                    <span className="text-xs font-medium text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(item.value)} / {item.target} {item.unit}
                  </span>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Meals Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
            <span>🍽️</span>
            تفاصيل الوجبات
          </h3>

          {MEAL_DEFINITIONS.map((mealDef) => {
            const meal = day.meals[mealDef.id];
            if (!meal || !meal.dishes || meal.dishes.length === 0) return null;

            const mealTotals = storage.getMealTotals(meal);

            return (
              <div key={mealDef.id} className="bg-surface rounded-card border border-border p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{mealDef.icon}</span>
                    <span className="font-bold text-white text-sm">{mealDef.label}</span>
                    <span className="text-xs text-gray-600">⏰ {mealDef.time}</span>
                  </div>
                  <span className="text-xs text-orange-400 font-bold">
                    🔥 {Math.round(mealTotals.calories)}
                  </span>
                </div>

                {/* Dish Images Row */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {meal.dishes.map((dish) => (
                    <div key={dish.id} className="flex-shrink-0">
                      {dish.imageBase64 ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden ring-1 ring-border">
                          <img
                            src={dish.imageBase64}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-surface-2 flex items-center justify-center">
                          <span className="text-xl">🍽️</span>
                        </div>
                      )}
                      <p className="text-[10px] text-gray-500 text-center mt-1 max-w-16 truncate">
                        {dish.name}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Meal Summary */}
                <div className="flex items-center gap-3 text-xs pt-2 border-t border-border/50">
                  <span className="text-red-400">💪 {Math.round(mealTotals.protein)}g</span>
                  <span className="text-yellow-400">🍞 {Math.round(mealTotals.carbs)}g</span>
                  <span className="text-emerald-400">🫒 {Math.round(mealTotals.fat)}g</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
