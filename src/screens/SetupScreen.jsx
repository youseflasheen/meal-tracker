import { useState } from 'react';

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '🔮',
    description: 'مفتاح مجاني من Google AI Studio',
    link: 'https://aistudio.google.com/apikey',
    linkText: 'aistudio.google.com',
    placeholder: 'AIza...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🌐',
    description: 'بديل مدفوع — يدعم موديلات كثيرة',
    link: 'https://openrouter.ai/keys',
    linkText: 'openrouter.ai',
    placeholder: 'sk-or-...',
  },
];

const SetupScreen = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openrouter');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  const currentProvider = PROVIDERS.find((p) => p.id === provider);

  const testGeminiKey = async (key) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'قل "مرحبا" فقط' }] }],
        }),
      }
    );
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      if (res.status === 400 || res.status === 403) {
        throw new Error('مفتاح Gemini غير صالح. تأكد من المفتاح.');
      } else if (res.status === 429) {
        throw new Error('تم تجاوز الحد المجاني لـ Gemini. جرّب OpenRouter كبديل.');
      }
      throw new Error(errData?.error?.message || 'خطأ في الاتصال');
    }
  };

  const testOpenRouterKey = async (key) => {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('مفتاح OpenRouter غير صالح. تأكد من المفتاح.');
      }
      throw new Error('خطأ في الاتصال بـ OpenRouter');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      setError('من فضلك ادخل مفتاح API');
      return;
    }

    if (trimmedKey.length < 20) {
      setError('مفتاح API قصير جداً. تأكد من نسخ المفتاح كاملاً.');
      return;
    }

    setTesting(true);
    setError('');

    try {
      if (provider === 'gemini') {
        await testGeminiKey(trimmedKey);
      } else {
        await testOpenRouterKey(trimmedKey);
      }
      onComplete(trimmedKey, provider);
    } catch (err) {
      setError(err.message || 'فشل التحقق من المفتاح. تأكد من الاتصال بالإنترنت.');
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-app animate-scale-in">
        {/* Logo / Icon Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6 animate-pulse-glow">
            <span className="text-5xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">متتبع الوجبات</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            صوّر وجبتك واحصل على التحليل الغذائي
            <br />
            بالذكاء الاصطناعي فوراً
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface rounded-card border border-border p-6">
          {/* Provider Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3">اختر مزوّد الـ AI</h2>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProvider(p.id);
                    setError('');
                  }}
                  className={`p-3 rounded-card border-2 text-center transition-all ${
                    provider === p.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface-2 hover:border-border/80'
                  }`}
                >
                  <span className="text-2xl block mb-1">{p.icon}</span>
                  <span className={`text-xs font-bold ${provider === p.id ? 'text-primary' : 'text-gray-400'}`}>
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Info */}
          <div className="mb-4 p-3 rounded-btn bg-surface-2 border border-border">
            <p className="text-xs text-gray-500 leading-relaxed">
              {currentProvider.description}
              <br />
              احصل على المفتاح من{' '}
              <a
                href={currentProvider.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-light underline underline-offset-2"
              >
                {currentProvider.linkText}
              </a>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                مفتاح {currentProvider.name}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder={currentProvider.placeholder}
                className="w-full px-4 py-3 rounded-btn bg-surface-2 border border-border text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-left"
                dir="ltr"
                autoComplete="off"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-btn bg-red-500/10 border border-red-500/20 animate-scale-in">
                <span className="text-red-400 text-sm flex-shrink-0 mt-0.5">⚠️</span>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={testing || !apiKey.trim()}
              className={`w-full py-3.5 rounded-btn font-bold text-sm transition-all flex items-center justify-center gap-2
                ${
                  testing || !apiKey.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]'
                }
              `}
            >
              {testing ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  جاري التحقق...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  ابدأ
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-6">
          المفتاح يُحفظ في متصفحك فقط ولا يُرسل لأي سيرفر
        </p>
      </div>
    </div>
  );
};

export default SetupScreen;
