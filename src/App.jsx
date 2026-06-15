import { useState, useEffect, useCallback } from 'react';
import useStorage from './hooks/useStorage';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import DayScreen from './screens/DayScreen';
import ReportScreen from './screens/ReportScreen';
import AddDishFlow from './screens/AddDishFlow';
import { MEAL_DEFINITIONS } from './hooks/useStorage';

// Sample data to show on first launch
const generateSampleData = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const createMeals = () => {
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
    return meals;
  };

  // Yesterday with sample meals
  const yesterdayMeals = createMeals();
  yesterdayMeals.breakfast.dishes = [
    {
      id: 'sample-1',
      imageBase64: null,
      name: 'بيض مسلوق مع خبز توست',
      nutrition: { calories: 280, protein: 18, carbs: 24, fat: 14, fiber: 2 },
      clarificationNeeded: false,
      clarificationQuestion: null,
      userClarification: null,
      analysisStatus: 'done',
      confidence: 'high',
      notes: null,
    },
    {
      id: 'sample-2',
      imageBase64: null,
      name: 'كوب شاي بالحليب',
      nutrition: { calories: 65, protein: 3, carbs: 8, fat: 2.5, fiber: 0 },
      clarificationNeeded: false,
      clarificationQuestion: null,
      userClarification: null,
      analysisStatus: 'done',
      confidence: 'high',
      notes: null,
    },
  ];
  yesterdayMeals.lunch.dishes = [
    {
      id: 'sample-3',
      imageBase64: null,
      name: 'أرز مع دجاج مشوي',
      nutrition: { calories: 520, protein: 42, carbs: 55, fat: 12, fiber: 1 },
      clarificationNeeded: false,
      clarificationQuestion: null,
      userClarification: null,
      analysisStatus: 'done',
      confidence: 'high',
      notes: null,
    },
    {
      id: 'sample-4',
      imageBase64: null,
      name: 'سلطة خضراء',
      nutrition: { calories: 85, protein: 3, carbs: 10, fat: 4, fiber: 4 },
      clarificationNeeded: false,
      clarificationQuestion: null,
      userClarification: null,
      analysisStatus: 'done',
      confidence: 'high',
      notes: null,
    },
  ];
  yesterdayMeals.dinner.dishes = [
    {
      id: 'sample-5',
      imageBase64: null,
      name: 'فول مدمس مع زيت زيتون',
      nutrition: { calories: 350, protein: 20, carbs: 40, fat: 12, fiber: 10 },
      clarificationNeeded: false,
      clarificationQuestion: null,
      userClarification: null,
      analysisStatus: 'done',
      confidence: 'high',
      notes: null,
    },
  ];

  // Two days ago with sample meals
  const twoDaysAgoMeals = createMeals();
  twoDaysAgoMeals.breakfast.dishes = [
    {
      id: 'sample-6',
      imageBase64: null,
      name: 'فطيرة جبنة',
      nutrition: { calories: 320, protein: 14, carbs: 30, fat: 16, fiber: 1 },
      clarificationNeeded: false,
      clarificationQuestion: null,
      userClarification: null,
      analysisStatus: 'done',
      confidence: 'medium',
      notes: 'الحجم تقريبي',
    },
  ];
  twoDaysAgoMeals.lunch.dishes = [
    {
      id: 'sample-7',
      imageBase64: null,
      name: 'كشري مصري',
      nutrition: { calories: 620, protein: 18, carbs: 95, fat: 15, fiber: 8 },
      clarificationNeeded: false,
      clarificationQuestion: null,
      userClarification: null,
      analysisStatus: 'done',
      confidence: 'high',
      notes: null,
    },
  ];
  twoDaysAgoMeals.snack2.dishes = [
    {
      id: 'sample-8',
      imageBase64: null,
      name: 'موز',
      nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3 },
      clarificationNeeded: false,
      clarificationQuestion: null,
      userClarification: null,
      analysisStatus: 'done',
      confidence: 'high',
      notes: null,
    },
  ];

  return {
    days: {
      [formatDate(yesterday)]: {
        date: formatDate(yesterday),
        meals: yesterdayMeals,
      },
      [formatDate(twoDaysAgo)]: {
        date: formatDate(twoDaysAgo),
        meals: twoDaysAgoMeals,
      },
    },
  };
};

function App() {
  // On very first mount, seed sample data into localStorage before useStorage reads it
  const [seeded] = useState(() => {
    const STORAGE_KEY = 'meal-tracker-data';
    const API_KEY_STORAGE = 'meal-tracker-api-key';
    const hasData = localStorage.getItem(STORAGE_KEY);
    const hasKey = localStorage.getItem(API_KEY_STORAGE);
    if (!hasData && !hasKey) {
      const sampleData = generateSampleData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      return true;
    }
    return false;
  });

  const storage = useStorage();
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [screenParams, setScreenParams] = useState({});
  const [addDishState, setAddDishState] = useState(null); // { date, mealId }

  // Initialize app
  useEffect(() => {
    const apiKey = storage.getApiKey();

    if (apiKey) {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('setup');
    }
  }, []);

  const navigate = useCallback((screen, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  }, []);

  const handleSetupComplete = useCallback(
    (apiKey, provider) => {
      storage.setApiKey(apiKey);
      storage.setProvider(provider);
      setCurrentScreen('home');
    },
    [storage]
  );

  const handleOpenAddDish = useCallback((date, mealId) => {
    setAddDishState({ date, mealId });
  }, []);

  const handleCloseAddDish = useCallback(() => {
    setAddDishState(null);
  }, []);

  const handleSaveDish = useCallback(
    async (dish) => {
      if (addDishState) {
        await storage.addDish(addDishState.date, addDishState.mealId, dish);
        setAddDishState(null);
      }
    },
    [addDishState, storage]
  );

  // Loading state
  if (currentScreen === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4 animate-pulse-glow">
            <span className="text-4xl">🍽️</span>
          </div>
          <p className="text-gray-500 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Get current meal label for AddDishFlow
  const getCurrentMealLabel = () => {
    if (!addDishState) return '';
    const mealDef = MEAL_DEFINITIONS.find((m) => m.id === addDishState.mealId);
    return mealDef ? `${mealDef.icon} ${mealDef.label}` : '';
  };

  return (
    <>
      {currentScreen === 'setup' && (
        <SetupScreen onComplete={handleSetupComplete} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen storage={storage} onNavigate={navigate} />
      )}

      {currentScreen === 'day' && screenParams.date && (
        <DayScreen
          date={screenParams.date}
          storage={storage}
          onNavigate={navigate}
          onAddDish={handleOpenAddDish}
        />
      )}

      {currentScreen === 'report' && screenParams.date && (
        <ReportScreen
          date={screenParams.date}
          storage={storage}
          onNavigate={navigate}
        />
      )}

      {/* Add Dish Modal (overlays any screen) */}
      {addDishState && (
        <AddDishFlow
          date={addDishState.date}
          mealId={addDishState.mealId}
          mealLabel={getCurrentMealLabel()}
          apiKey={storage.getApiKey()}
          provider={storage.getProvider()}
          onSave={handleSaveDish}
          onClose={handleCloseAddDish}
        />
      )}
    </>
  );
}

export default App;
