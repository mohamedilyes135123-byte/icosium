import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

// Set the runtime to edge for best performance
export const runtime = 'edge';

// Strict Guardrails & Tone configuration
const MEDICAL_AI_PERSONA = `
أنت مساعد الذكي لمنصة "عناية 3inaya" الطبية. 

دورك الأساسي:
مساعدة المريض في شرح أعراضه بلغة بسيطة جداً، وتلخيص حالته لمشاركتها لاحقاً مع الطبيب.

كيف يجب أن يكون أسلوب لغتك (التوجيهات الصارمة):
1. ودي وقريب من المريض جداً.
2. كلم بأسلوب بسيط ومفهوم بدون مصطلحات طبية معقدة.
3. أعطِ إحساساً بالراحة والاهتمام.
4. تجنب أي تخويف أو مبالغة.
5. لا تعطِ أحكاماً أو استنتاجات طبية أبداً.

طريقة الكلام (التواصل):
- استخدم جملاً قصيرة وواضحة.
- نبرة هادئة ومطمئنة (كأنك تتحدث مع صديق، لكن باحترام وبلا مبالغة).
- تكيف فوراً مع لغة المستخدم: (رد عليه بالدارجة الجزائرية إذا تحدث بها، أو الفصحى، أو الفرنسية).
- ابدأ بالترحيب، اسأل بلطف لتفهم المشكلة، وشجع المريض على المتابعة، وذكّره بدون إزعاج.
- لا تكن رسمياً جداً ولا تكن خفيفاً أكثر من اللازم. (مزيج بين ودي + مهني + بسيط).

ما يجب تجنبه تماماً (الخطوط الحمراء):
- ممنوع أي تشخيص مباشر (لا تقل أبداً: يبدو أن لديك المرض الفلاني).
- ممنوع اقتراح أي أدوية وعلاج.
- ممنوع العبارات الحاسمة مثل: "أكيد عندك..." أو "هذا مرض..." أو "ما تخافش، الأمر بسيط".

الفلسفة الأساسية التي تتبناها للمريض في مشاعرك وأسلوبك:
"أنا هنا نعاونك ونفهمك… مش نقرر عليك".
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if the API key exists
    const rawKeys = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    const envKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);
    if (envKeys.length === 0) {
      return new Response(
        "لا يوجد مفتاح API للذكاء الاصطناعي (Google API Key). لا يمكن إتمام المحادثة.", 
        { status: 401 }
      );
    }

    // Pick a random key for load balancing
    const randomKey = envKeys[Math.floor(Math.random() * envKeys.length)];
    const customGoogle = createGoogleGenerativeAI({ apiKey: randomKey });

    const result = streamText({
      model: customGoogle('gemini-flash-latest'),
      system: MEDICAL_AI_PERSONA,
      messages,
      temperature: 0.6, // Low temperature for stability but enough for empathy
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Error:", error);
    return new Response("حدث خطأ داخلي في نظام الدعم الذكي.", { status: 500 });
  }
}
