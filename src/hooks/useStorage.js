import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'meal-tracker-data';
const API_KEY_STORAGE = 'meal-tracker-api-key';
const API_PROVIDER_STORAGE = 'meal-tracker-api-provider';

const getInitialData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return { days: {} };
};

// Compress image to save localStorage space
const compressImage = (base64, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });
};

const MEAL_DEFINITIONS = [
  { id: 'breakfast', label: 'فطار', time: '08:00', icon: '🌅' },
  { id: 'snack1', label: 'سناك صباحي', time: '11:00', icon: '🍎' },
  { id: 'lunch', label: 'غدا', time: '13:00', icon: '🍽️' },
  { id: 'snack2', label: 'سناك مسائي', time: '16:00', icon: '🥤' },
  { id: 'dinner', label: 'عشا', time: '20:00', icon: '🌙' },
];

const createEmptyDay = (dateStr) => {
  const meals = {};
  MEAL_DEFINITIONS.forEach((meal) => {
    meals[meal.id] = {
      id: meal.id,
      label: meal.label,
      time: meal.time,
      icon: meal.icon,
      dishes: [],
    };
  });
  return { date: dateStr, meals };
};

const useStorage = () => {
  const [data, setData] = useState(getInitialData);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      // If storage is full, try to alert the user
      if (e.name === 'QuotaExceededError') {
        alert('مساحة التخزين ممتلئة! حاول حذف بعض الأيام القديمة.');
      }
    }
  }, [data]);

  // Get API Key
  const getApiKey = useCallback(() => {
    return localStorage.getItem(API_KEY_STORAGE);
  }, []);

  // Set API Key
  const setApiKey = useCallback((key) => {
    localStorage.setItem(API_KEY_STORAGE, key);
  }, []);

  // Remove API Key
  const removeApiKey = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE);
  }, []);

  // Get API Provider (gemini or openrouter)
  const getProvider = useCallback(() => {
    return localStorage.getItem(API_PROVIDER_STORAGE) || 'gemini';
  }, []);

  // Set API Provider
  const setProvider = useCallback((provider) => {
    localStorage.setItem(API_PROVIDER_STORAGE, provider);
  }, []);

  // Get all days sorted by date (newest first)
  const getDays = useCallback(() => {
    return Object.values(data.days).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [data]);

  // Get a specific day
  const getDay = useCallback(
    (dateStr) => {
      return data.days[dateStr] || null;
    },
    [data]
  );

  // Add or get today
  const getOrCreateDay = useCallback(
    (dateStr) => {
      if (data.days[dateStr]) {
        return data.days[dateStr];
      }
      const newDay = createEmptyDay(dateStr);
      setData((prev) => ({
        ...prev,
        days: { ...prev.days, [dateStr]: newDay },
      }));
      return newDay;
    },
    [data]
  );

  // Add dish to a meal
  const addDish = useCallback(
    async (dateStr, mealId, dish) => {
      // Compress image before saving
      let imageBase64 = dish.imageBase64;
      if (imageBase64) {
        imageBase64 = await compressImage(imageBase64);
      }

      setData((prev) => {
        const day = prev.days[dateStr] || createEmptyDay(dateStr);
        const meal = day.meals[mealId];
        const updatedMeal = {
          ...meal,
          dishes: [...meal.dishes, { ...dish, imageBase64 }],
        };
        return {
          ...prev,
          days: {
            ...prev.days,
            [dateStr]: {
              ...day,
              meals: { ...day.meals, [mealId]: updatedMeal },
            },
          },
        };
      });
    },
    []
  );

  // Remove a dish
  const removeDish = useCallback((dateStr, mealId, dishId) => {
    setData((prev) => {
      const day = prev.days[dateStr];
      if (!day) return prev;
      const meal = day.meals[mealId];
      const updatedDishes = meal.dishes.filter((d) => d.id !== dishId);
      return {
        ...prev,
        days: {
          ...prev.days,
          [dateStr]: {
            ...day,
            meals: {
              ...day.meals,
              [mealId]: { ...meal, dishes: updatedDishes },
            },
          },
        },
      };
    });
  }, []);

  // Delete a day
  const deleteDay = useCallback((dateStr) => {
    setData((prev) => {
      const newDays = { ...prev.days };
      delete newDays[dateStr];
      return { ...prev, days: newDays };
    });
  }, []);

  // Calculate day totals
  const getDayTotals = useCallback(
    (dateStr) => {
      const day = data.days[dateStr];
      if (!day) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, mealCount: 0 };

      let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, mealCount: 0 };

      Object.values(day.meals).forEach((meal) => {
        if (meal.dishes.length > 0) {
          totals.mealCount++;
          meal.dishes.forEach((dish) => {
            if (dish.nutrition) {
              totals.calories += dish.nutrition.calories || 0;
              totals.protein += dish.nutrition.protein || 0;
              totals.carbs += dish.nutrition.carbs || 0;
              totals.fat += dish.nutrition.fat || 0;
              totals.fiber += dish.nutrition.fiber || 0;
            }
          });
        }
      });

      return totals;
    },
    [data]
  );

  // Calculate meal totals
  const getMealTotals = useCallback((meal) => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    if (!meal || !meal.dishes) return totals;

    meal.dishes.forEach((dish) => {
      if (dish.nutrition) {
        totals.calories += dish.nutrition.calories || 0;
        totals.protein += dish.nutrition.protein || 0;
        totals.carbs += dish.nutrition.carbs || 0;
        totals.fat += dish.nutrition.fat || 0;
        totals.fiber += dish.nutrition.fiber || 0;
      }
    });

    return totals;
  }, []);

  return {
    data,
    getApiKey,
    setApiKey,
    removeApiKey,
    getProvider,
    setProvider,
    getDays,
    getDay,
    getOrCreateDay,
    addDish,
    removeDish,
    deleteDay,
    getDayTotals,
    getMealTotals,
    MEAL_DEFINITIONS,
  };
};

export default useStorage;
export { MEAL_DEFINITIONS, compressImage };
