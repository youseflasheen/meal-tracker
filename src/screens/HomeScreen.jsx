import { useState, useMemo } from 'react';
import DayCard from '../components/DayCard';

const HomeScreen = ({ storage, onNavigate }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [newProvider, setNewProvider] = useState(storage.getProvider());

  const days = storage.getDays();

  const today = new Date().toISOString().split('T')[0];

  const handleTodayClick = () => {
    storage.getOrCreateDay(today);
    onNavigate('day', { date: today });
  };

  const handleDayClick = (date) => {
    onNavigate('day', { date });
  };

  const handleSaveSettings = () => {
    if (newApiKey.trim()) {
      storage.setApiKey(newApiKey.trim());
      storage.setProvider(newProvider);
      setShowSettings(false);
      setNewApiKey('');
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-app mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-lg font-black text-white">متتبع الوجبات</h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-btn text-gray-400 hover:text-white hover:bg-surface-2 transition-all"
            title="الإعدادات"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-app mx-auto px-4 py-6">
        {/* Today Button */}
        <button
          onClick={handleTodayClick}
          className="w-full mb-6 py-4 rounded-card bg-gradient-to-l from-primary/20 via-primary/10 to-transparent border border-primary/30 text-white font-bold text-sm flex items-center justify-center gap-3 hover:from-primary/30 hover:via-primary/15 transition-all active:scale-[0.99] shadow-lg shadow-primary/10 animate-pulse-glow"
        >
          <span className="text-xl">📅</span>
          <span>فتح يوم اليوم</span>
          <span className="text-xs text-gray-400 bg-surface/50 px-2 py-0.5 rounded-full">
            {new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
          </span>
        </button>

        {/* Days Grid */}
        {days.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
              <span>📊</span>
              سجل الأيام
            </h2>
            {days.map((day) => (
              <DayCard
                key={day.date}
                day={day}
                totals={storage.getDayTotals(day.date)}
                onClick={() => handleDayClick(day.date)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-bold text-gray-400 mb-2">
              ابدأ رحلتك الصحية
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              اضغط على "فتح يوم اليوم" لتسجيل أول وجبة
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={handleTodayClick}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/30 flex items-center justify-center text-2xl transition-all active:scale-90 hover:scale-105 z-50 animate-bounce-subtle"
      >
        +
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-app bg-surface rounded-t-2xl border-t border-border p-6 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <h2 className="text-lg font-bold text-white mb-4">⚙️ الإعدادات</h2>

            <div className="space-y-4">
              {/* Current provider display */}
              <div className="p-3 rounded-btn bg-surface-2 border border-border">
                <p className="text-xs text-gray-500">
                  المزوّد الحالي:{' '}
                  <span className="text-primary font-bold">
                    {storage.getProvider() === 'openrouter' ? '🌐 OpenRouter' : '🔮 Google Gemini'}
                  </span>
                </p>
              </div>

              {/* Provider Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  تغيير المزوّد
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProvider('gemini')}
                    className={`p-2.5 rounded-btn border-2 text-center text-xs font-bold transition-all ${
                      newProvider === 'gemini'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface-2 text-gray-500 hover:border-border/80'
                    }`}
                  >
                    🔮 Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProvider('openrouter')}
                    className={`p-2.5 rounded-btn border-2 text-center text-xs font-bold transition-all ${
                      newProvider === 'openrouter'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface-2 text-gray-500 hover:border-border/80'
                    }`}
                  >
                    🌐 OpenRouter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  مفتاح API الجديد
                </label>
                <input
                  type="password"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder={newProvider === 'openrouter' ? 'sk-or-...' : 'AIza...'}
                  className="w-full px-4 py-3 rounded-btn bg-surface-2 border border-border text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  dir="ltr"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={!newApiKey.trim()}
                className={`w-full py-3 rounded-btn font-bold text-sm transition-all
                  ${newApiKey.trim()
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
              >
                حفظ الإعدادات
              </button>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 rounded-btn font-bold text-sm bg-surface-2 text-gray-400 hover:text-white transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
