import { useState, useMemo } from 'react';
import MealSection from '../components/MealSection';
import { MEAL_DEFINITIONS } from '../hooks/useStorage';

const DayScreen = ({ date, storage, onNavigate, onAddDish }) => {
  const day = useMemo(() => storage.getOrCreateDay(date), [date, storage]);

  const dayTotals = storage.getDayTotals(date);

  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isToday = date === new Date().toISOString().split('T')[0];

  const handleRemoveDish = (mealId, dishId) => {
    if (confirm('هل تريد حذف هذا الطبق؟')) {
      storage.removeDish(date, mealId, dishId);
    }
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-app mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 -mr-2 rounded-btn text-gray-400 hover:text-white hover:bg-surface-2 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                {isToday && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">اليوم</span>}
                {formattedDate}
              </h1>
            </div>
          </div>
          <button
            onClick={() => onNavigate('report', { date })}
            className="px-3 py-1.5 rounded-btn bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1"
          >
            <span>📊</span>
            تقرير اليوم
          </button>
        </div>
      </header>

      <div className="max-w-app mx-auto px-4 py-6">
        {/* Meals Sections */}
        <div className="space-y-4">
          {MEAL_DEFINITIONS.map((mealDef) => {
            const meal = day.meals[mealDef.id] || {
              ...mealDef,
              dishes: [],
            };
            const mealTotals = storage.getMealTotals(meal);

            return (
              <MealSection
                key={mealDef.id}
                meal={meal}
                mealTotals={mealTotals}
                onAddDish={() => onAddDish(date, mealDef.id)}
                onRemoveDish={(dishId) => handleRemoveDish(mealDef.id, dishId)}
              />
            );
          })}
        </div>

        {/* Day Summary */}
        <div className="mt-8 bg-gradient-to-br from-surface to-surface-2 rounded-card border border-border p-5">
          <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
            <span>📋</span>
            ملخص اليوم
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-2/80 rounded-lg p-3 text-center">
              <span className="text-xl block mb-1">🔥</span>
              <p className="text-xl font-black text-orange-400">{Math.round(dayTotals.calories)}</p>
              <p className="text-xs text-gray-500">كالوري</p>
            </div>
            <div className="bg-surface-2/80 rounded-lg p-3 text-center">
              <span className="text-xl block mb-1">💪</span>
              <p className="text-xl font-black text-red-400">{Math.round(dayTotals.protein)}g</p>
              <p className="text-xs text-gray-500">بروتين</p>
            </div>
            <div className="bg-surface-2/80 rounded-lg p-3 text-center">
              <span className="text-xl block mb-1">🍞</span>
              <p className="text-xl font-black text-yellow-400">{Math.round(dayTotals.carbs)}g</p>
              <p className="text-xs text-gray-500">كارب</p>
            </div>
            <div className="bg-surface-2/80 rounded-lg p-3 text-center">
              <span className="text-xl block mb-1">🫒</span>
              <p className="text-xl font-black text-emerald-400">{Math.round(dayTotals.fat)}g</p>
              <p className="text-xs text-gray-500">دهون</p>
            </div>
          </div>

          <div className="mt-3 bg-surface-2/80 rounded-lg p-3 text-center">
            <span className="text-lg">🌾</span>
            <span className="text-sm font-bold text-amber-600 mr-2">{Math.round(dayTotals.fiber)}g</span>
            <span className="text-xs text-gray-500">ألياف</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayScreen;
