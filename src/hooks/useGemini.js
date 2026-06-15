import { useState, useCallback } from 'react';

const BASE_PROMPT = `أنت خبير تغذية. حلل هذه الصورة وأعطني التفاصيل الغذائية.

أجب بـ JSON فقط بدون أي نص إضافي:

{
  "name": "اسم الطبق بالعربي",
  "needsClarification": true/false,
  "clarificationQuestion": "سؤال لو محتاج توضيح، أو null",
  "nutrition": {
    "calories": رقم,
    "protein": رقم بالجرام,
    "carbs": رقم بالجرام,
    "fat": رقم بالجرام,
    "fiber": رقم بالجرام
  },
  "confidence": "high/medium/low",
  "notes": "ملاحظة اختيارية"
}

مهم جداً:
- لو تم تزويدك بوصف نصي بدون صورة، قم بتحليل الوصف وحساب السعرات التقريبية.
- لو الصورة مش واضحة أو فيها أكل مش معروف محتوياته (زي ساندوتش مغلق)، اجعل needsClarification = true واسأل سؤالاً محدداً
- لو needsClarification = true، اجعل nutrition بأرقام تقريبية وأشر إلى ذلك في notes
- الأرقام بالجرام للـ macros والكيلوكالوري للسعرات
- أجب بالعربي`;

// Call Gemini API directly
const callGeminiDirect = async (prompt, imageData, apiKey) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              ...(imageData
                ? [
                    {
                      inline_data: {
                        mime_type: 'image/jpeg',
                        data: imageData,
                      },
                    },
                  ]
                : []),
            ],
          },
        ],
        generationConfig: { temperature: 0.1 },
      }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    if (response.status === 400) {
      throw new Error('مفتاح API غير صالح. تأكد من المفتاح وحاول مرة أخرى.');
    } else if (response.status === 429) {
      throw new Error('تم تجاوز حد الطلبات. انتظر قليلاً وحاول مرة أخرى. أو جرّب OpenRouter كبديل.');
    } else if (response.status === 403) {
      throw new Error('مفتاح API غير مصرّح. تأكد من تفعيل Gemini API.');
    }
    throw new Error(errData?.error?.message || `خطأ في الاتصال: ${response.status}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('لم يتم الحصول على رد من Gemini. حاول مرة أخرى.');
  }

  return data.candidates[0].content.parts[0].text;
};

// Call via OpenRouter (OpenAI-compatible format)
const callOpenRouter = async (prompt, imageBase64Full, apiKey) => {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Meal Tracker',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...(imageBase64Full
                ? [
                    {
                      type: 'image_url',
                      image_url: {
                        url: imageBase64Full,
                      },
                    },
                  ]
                : []),
            ],
          },
        ],
        temperature: 0.1,
      }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    if (response.status === 401) {
      throw new Error('مفتاح OpenRouter غير صالح. تأكد من المفتاح وحاول مرة أخرى.');
    } else if (response.status === 402) {
      throw new Error('رصيد OpenRouter غير كافي. أضف رصيد من openrouter.ai');
    } else if (response.status === 429) {
      throw new Error('تم تجاوز حد الطلبات. انتظر قليلاً وحاول مرة أخرى.');
    }
    const msg = errData?.error?.message || `خطأ في الاتصال: ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('لم يتم الحصول على رد من OpenRouter. حاول مرة أخرى.');
  }

  return data.choices[0].message.content;
};

const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeImage = useCallback(async (imageBase64, apiKey, provider = 'gemini', userClarification = null) => {
    setLoading(true);
    setError(null);

    try {
      let prompt = BASE_PROMPT;
      if (userClarification) {
        prompt += `\n\nالمستخدم وضّح: "${userClarification}"\nأعد التحليل بناءً على هذه المعلومات الإضافية وأعطني JSON محدّث.`;
      }

      let text;

      if (provider === 'openrouter') {
        // OpenRouter needs the full data URL
        const fullBase64 = imageBase64
          ? imageBase64.includes(',')
            ? imageBase64
            : `data:image/jpeg;base64,${imageBase64}`
          : null;
        text = await callOpenRouter(prompt, fullBase64, apiKey);
      } else {
        // Gemini direct needs just the base64 data part
        const imageData = imageBase64
          ? imageBase64.includes(',')
            ? imageBase64.split(',')[1]
            : imageBase64
          : null;
        text = await callGeminiDirect(prompt, imageData, apiKey);
      }

      const jsonStr = text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(jsonStr);

      // Validate result structure
      if (!result.nutrition || typeof result.nutrition.calories !== 'number') {
        throw new Error('رد AI غير صحيح. حاول تصوير الطبق مرة أخرى.');
      }

      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'حصل خطأ غير متوقع. حاول مرة أخرى.';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { analyzeImage, loading, error, clearError };
};

export default useGemini;
