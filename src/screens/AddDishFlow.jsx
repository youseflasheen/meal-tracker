import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useGemini from '../hooks/useGemini';
import NutritionTable from '../components/NutritionTable';
import LoadingSpinner from '../components/LoadingSpinner';

const AddDishFlow = ({ date, mealId, mealLabel, apiKey, provider, onSave, onClose }) => {
  const [step, setStep] = useState('capture'); // capture | analyzing | clarification | result
  const [imageBase64, setImageBase64] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');
  const [result, setResult] = useState(null);
  const [clarification, setClarification] = useState('');
  const { analyzeImage, loading, error, clearError } = useGemini();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageCapture = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      // Compress on capture
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxWidth = 1200;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setImageBase64(compressed);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = async (userClarificationText = null) => {
    setStep('analyzing');
    clearError();

    try {
      // If we are in manual mode and this is the first analysis, userClarificationText holds the manual description.
      // But we pass it to useGemini as the userClarification string.
      const analysisResult = await analyzeImage(imageBase64, apiKey, provider, userClarificationText);

      setResult(analysisResult);

      if (analysisResult.needsClarification && !userClarificationText) {
        setStep('clarification');
      } else {
        setStep('result');
      }
    } catch (err) {
      // If it fails, return to capture (or manual text view)
      setStep('capture');
    }
  };

  const handleClarificationSubmit = () => {
    if (clarification.trim()) {
      handleAnalyze(clarification.trim());
    }
  };

  const handleSave = () => {
    const dish = {
      id: uuidv4(),
      imageBase64,
      name: result.name,
      nutrition: result.nutrition,
      clarificationNeeded: result.needsClarification || false,
      clarificationQuestion: result.clarificationQuestion || null,
      userClarification: clarification || null,
      analysisStatus: 'done',
      confidence: result.confidence,
      notes: result.notes,
    };
    onSave(dish);
  };

  const handleRetake = () => {
    setImageBase64(null);
    setManualMode(false);
    setManualText('');
    setResult(null);
    setClarification('');
    clearError();
    setStep('capture');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-app bg-bg rounded-t-2xl border-t border-border max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-bg/90 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            <span className="font-bold text-white text-sm">
              إضافة طبق — {mealLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-surface-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 pb-8">
          {/* Step: Capture */}
          {step === 'capture' && (
            <div className="animate-fade-in">
              {!imageBase64 ? (
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-card bg-surface-2 border-2 border-dashed border-border flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center">
                      <span className="text-4xl">📷</span>
                    </div>
                    <p className="text-gray-500 text-sm">صوّر أو اختر صورة الطبق</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-4 rounded-card bg-primary hover:bg-primary-dark text-white font-bold text-sm flex flex-col items-center gap-2 transition-all active:scale-[0.97] shadow-lg shadow-primary/20"
                    >
                      <span className="text-2xl">📷</span>
                      صوّر
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-4 rounded-card bg-surface-2 hover:bg-surface-3 text-white font-bold text-sm border border-border flex flex-col items-center gap-2 transition-all active:scale-[0.97]"
                    >
                      <span className="text-2xl">🖼️</span>
                      من الاستوديو
                    </button>
                  </div>

                  {!manualMode ? (
                    <button
                      onClick={() => setManualMode(true)}
                      className="w-full py-3 rounded-card bg-surface-2 hover:bg-surface-3 text-white font-medium text-sm border border-border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    >
                      <span>✍️</span>
                      إدخال يدوي بدون صورة
                    </button>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <textarea
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder="اكتب وصف الوجبة (مثلاً: طبق كبسة دجاج 200 جرام)"
                        className="w-full px-4 py-3 rounded-btn bg-surface border border-border text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                        rows={3}
                        autoFocus
                      />
                      <button
                        onClick={() => handleAnalyze(manualText)}
                        disabled={!manualText.trim()}
                        className={`w-full py-3.5 rounded-btn font-bold text-sm transition-all flex items-center justify-center gap-2
                          ${manualText.trim()
                            ? 'bg-gradient-to-l from-primary to-emerald-500 text-white shadow-lg shadow-primary/20'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        <span>✨</span>
                        تحليل الوصف
                      </button>
                    </div>
                  )}

                  {/* Hidden file inputs */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageCapture}
                    className="hidden"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageCapture}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative rounded-card overflow-hidden ring-1 ring-border">
                    <img
                      src={imageBase64}
                      alt="صورة الطبق"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <button
                      onClick={handleRetake}
                      className="absolute top-3 left-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-btn bg-red-500/10 border border-red-500/20 animate-scale-in">
                      <span className="text-red-400 text-sm flex-shrink-0">⚠️</span>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleAnalyze()}
                    className="w-full py-3.5 rounded-btn bg-gradient-to-l from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                  >
                    <span>✨</span>
                    تحليل بالـ AI
                  </button>

                  <button
                    onClick={handleRetake}
                    className="w-full py-3 rounded-btn bg-surface-2 text-gray-400 hover:text-white font-medium text-sm transition-all"
                  >
                    🔄 صوّر تاني
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step: Analyzing */}
          {step === 'analyzing' && (
            <div className="animate-fade-in">
              {imageBase64 ? (
                <div className="relative rounded-card overflow-hidden ring-1 ring-border">
                  <img
                    src={imageBase64}
                    alt="جاري التحليل"
                    className="w-full aspect-[4/3] object-cover opacity-40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6">
                      <LoadingSpinner text="✨ Gemini بيحلل وجبتك..." />
                    </div>
                  </div>
                </div>
              ) : (
                <LoadingSpinner text="✨ Gemini بيحلل وجبتك..." />
              )}
            </div>
          )}

          {/* Step: Clarification */}
          {step === 'clarification' && result && (
            <div className="space-y-4 animate-fade-in">
              {imageBase64 && (
                <div className="rounded-card overflow-hidden ring-1 ring-border">
                  <img
                    src={imageBase64}
                    alt={result.name}
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-card p-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-lg">🤔</span>
                  <div>
                    <p className="font-bold text-yellow-400 text-sm mb-1">
                      {result.needsClarification ? 'Gemini محتاج توضيح' : 'تصحيح للـ AI'}
                    </p>
                    <p className="text-sm text-yellow-200/80">
                      {result.needsClarification 
                        ? result.clarificationQuestion 
                        : 'اكتب التصحيح هنا وسيعيد الذكاء الاصطناعي حساب السعرات بناءً عليه.'}
                    </p>
                  </div>
                </div>

                <textarea
                  value={clarification}
                  onChange={(e) => setClarification(e.target.value)}
                  placeholder="اكتب إجابتك هنا..."
                  className="w-full px-4 py-3 rounded-btn bg-surface border border-border text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all resize-none"
                  rows={3}
                  autoFocus
                />

                <button
                  onClick={handleClarificationSubmit}
                  disabled={!clarification.trim()}
                  className={`w-full mt-3 py-3 rounded-btn font-bold text-sm transition-all flex items-center justify-center gap-2
                    ${clarification.trim()
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <span>🔄</span>
                  حلل تاني
                </button>
              </div>

              {/* Show approximate results */}
              {result.nutrition && (
                <div className="opacity-60">
                  <p className="text-xs text-gray-500 mb-2">نتائج تقريبية:</p>
                  <NutritionTable nutrition={result.nutrition} />
                </div>
              )}
            </div>
          )}

          {/* Step: Result */}
          {step === 'result' && result && (
            <div className="space-y-4 animate-fade-in">
              {/* Image */}
              {imageBase64 && (
                <div className="rounded-card overflow-hidden ring-1 ring-border">
                  <img
                    src={imageBase64}
                    alt={result.name}
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
              )}

              {/* Dish Name */}
              <div className="text-center py-2">
                <input
                  type="text"
                  value={result.name}
                  onChange={(e) => setResult({ ...result, name: e.target.value })}
                  className="w-full text-center bg-transparent border-b border-dashed border-gray-600 focus:border-primary focus:outline-none text-xl font-black text-white pb-1"
                />
                <p className="text-xs text-gray-500 mt-1">اضغط على الاسم لتعديله يدوياً</p>
              </div>

              {/* Confidence Warning */}
              {result.confidence && result.confidence !== 'high' && (
                <div className="flex items-center gap-2 p-3 rounded-btn bg-yellow-500/10 border border-yellow-500/20">
                  <span>⚠️</span>
                  <p className="text-xs text-yellow-400">
                    {result.confidence === 'medium'
                      ? 'مستوى الثقة متوسط — الأرقام قد تكون تقريبية'
                      : 'مستوى الثقة منخفض — الأرقام تقريبية جداً'}
                  </p>
                </div>
              )}

              {/* Nutrition Table */}
              <NutritionTable nutrition={result.nutrition} />

              {/* Notes */}
              {result.notes && (
                <div className="flex items-start gap-2 p-3 rounded-btn bg-surface-2 border border-border">
                  <span className="text-sm">📝</span>
                  <p className="text-xs text-gray-400">{result.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleSave}
                  className="w-full py-3.5 rounded-btn bg-primary hover:bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                  <span>✅</span>
                  إضافة للوجبة
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setClarification('');
                      setStep('clarification');
                    }}
                    className="w-full py-3 rounded-btn bg-surface-2 text-gray-300 hover:text-white border border-border hover:border-yellow-500/50 font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>✏️</span>
                    تصحيح للـ AI
                  </button>

                  <button
                    onClick={handleRetake}
                    className="w-full py-3 rounded-btn bg-surface-2 text-gray-400 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDishFlow;
