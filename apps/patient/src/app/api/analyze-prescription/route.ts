import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 60; // Allow max duration for AI analysis

// 🚀🚀 Prompts per document type (French & Highly Concise) 🚀🚀🚀
const UNIVERSAL_PROMPT = `
أنت مساعد طبي ذكي ومرن متخصص في قراءة وتحليل جميع أنواع الوثائق الطبية (وصفات طبية، تحاليل مخبرية، أشعة، بطاقة زمرة الدم، تقارير، تخطيط قلب، إلخ).
المهمة: استخراج "الزبدة" والمضمون المفيد جداً للطبيب من هذه الوثيقة بذكاء واختصار شديد.

القوانين الصارمة:
1. يجب أن تكون الإجابة النهائية باللغة الفرنسية (Français) بالكامل.
2. الاختصار الشديد، لا تكتب جملاً طويلة، استخدم النقاط والعناوين المباشرة.
3. بادر بفهم نوع الوثيقة واستخرج الأهم فوراً (مثال: إذا كانت بطاقة زمرة دم استخرج زمرة الدم بدقة، إذا كانت وصفة استخرج الأدوية، إذا كان تحليل استخرج النتائج غير الطبيعية، إذا كان أيكوغرافيا استخرج النتيجة النهائية).
4. استخدم الخط العريض (Bold) للعناوين والنتائج المهمة لتسهيل القراءة.
5. لا تكتب أي مقدمات أو شروحات، أعطني المخرجات المطلوبة مباشرة.

Format de sortie à respecter strictement :
**Type de document :** [Ex: Ordonnance / Bilan Sanguin / Carte Groupage Sanguin / Échographie / ECG / etc.]
**Patient :** [Nom et Prénom] ([Âge] ou [Date de naissance] si disponible)
**Date :** [Date du document]
**Médecin / Laboratoire :** [Nom du médecin, ou du laboratoire]

**Contenu Principal (Le plus important) :**
[Adaptez intelligemment cette section selon le document :]
• Si Carte de Groupage : Affichez LE GROUPE SANGUIN de manière très visible (Ex: **A POSITIF (A+)**).
• Si Ordonnance : Listez les médicaments (Nom + Dosage).
• Si Analyse/Bilan : Listez les résultats anormaux ou cruciaux.
• Si Imagerie/Échographie : Donnez la conclusion médicale finale.

**Notes / Remarques importantes :**
[Toute instruction, allergie, recommandation du médecin, ou remarque comme "à confirmer". Omettre s'il n'y a rien de spécial.]
`;
  
export async function POST(req: Request) {
  try {
    const rawKeys = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    const apiKeyList = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeyList.length === 0) {
      return Response.json({
        success: false,
        analysis: null,
        message: 'مفتاح API للذكاء الاصطناعي مفقود.',
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;
    const docType = (formData.get('docType') as string) || 'prescription';
    const prompt = UNIVERSAL_PROMPT;

    let result: string = "";
    let success = false;
    let lastError: any = null;

    // Loop through Gemini keys until one succeeds
    for (const apiKey of apiKeyList) {
      try {
        const customGoogle = createGoogleGenerativeAI({ apiKey });
        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
        let keySuccess = false;

        for (const modelName of modelsToTry) {
          try {
            const geminiModel = customGoogle(modelName);

            if (file) {
              const arrayBuffer = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const mimeType = file.type || 'image/jpeg';

              const { text: analysisText } = await generateText({
                model: geminiModel,
                maxRetries: 0,
                messages: [
                  {
                    role: 'user',
                    content: [
                      { type: 'text', text: prompt },
                      { type: 'image', image: buffer },
                    ],
                  },
                ],
                temperature: 0.1,
              });

              result = analysisText;
              keySuccess = true;
              break; // Stop model loop on success
            } else if (text) {
              const { text: analysisText } = await generateText({
                model: geminiModel,
                maxRetries: 0,
                messages: [
                  {
                    role: 'user',
                    content: `${prompt}\n\nالنص:\n${text}`,
                  },
                ],
                temperature: 0.1,
              });

              result = analysisText;
              keySuccess = true;
              break; // Stop model loop on success
            } else {
              return Response.json({ success: false, message: 'لم يتم تقديم ملف أو نص.' }, { status: 400 });
            }
          } catch (modelError: any) {
            console.warn(`[Model Fallback] Model ${modelName} failed for current key. Error: ${modelError.message}`);
            lastError = modelError;
          }
        }

        if (keySuccess) {
          success = true;
          break; // Stop key loop on success
        }
      } catch (error: any) {
        console.warn(`[Key Fallback] Gemini API key failed. Trying next if available. Error: ${error.message}`);
        lastError = error;
      }
    }

    if (!success) {
      console.error('All Gemini API keys failed:', lastError);
      return Response.json(
        { success: false, message: 'استنفد النظام جميع المفاتيح. يرجى تجديد رصيد الذكاء الاصطناعي.', analysis: null },
        { status: 500 }
      );
    }

    // Clean up <think> tags just in case Gemini accidentally uses them
    result = result.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();

    return Response.json({ success: true, analysis: result, docType });
  } catch (error) {
    console.error('Document analysis error:', error);
    return Response.json(
      { success: false, message: 'حدث خطأ في واجهة الذكاء الاصطناعي.', analysis: null },
      { status: 500 }
    );
  }
}
