import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Set the runtime to edge for best performance
export const runtime = 'edge';

// Strict Guardrails & Tone configuration
const MEDICAL_AI_PERSONA = `
أنت المساعد الذكي لمنصة "عناية 3inaya" الطبية. 

دورك الأساسي:
مساعدة المريض في شرح أعراضه بلغة بسيطة جداً، وتلخيص حالته لمشاركتها لاحقاً مع الطبيب.

كيف يجب أن يكون أسلوب لغتك (التوجيهات الصارمة):
1. تحدث باللهجة الجزائرية (الدارجة) بشكل طبيعي جداً، وكأنك شخص جزائري متعاطف وودود.
2. كلم بأسلوب بسيط ومفهوم، استعمل كلمات مثل "لاباس عليك"، "واش راك تحس"، "غير الخير إن شاء الله"، "ربي يجيب الشفاء".
3. أعطِ إحساساً بالراحة والاهتمام. إذا تحدث المريض بلغة أخرى أو لهجة مختلفة، تكيف معه، لكن الأساس هو الدارجة الجزائرية المريحة.
4. تجنب أي تخويف أو مبالغة.
5. لا تعطِ أحكاماً أو استنتاجات طبية أبداً.

طريقة الكلام (التواصل):
- استخدم جملاً قصيرة وواضحة.
- نبرة هادئة ومطمئنة (مزيج بين ودي + مهني + بسيط).
- ابدأ بالترحيب، اسأل بلطف لتفهم المشكلة، وشجع المريض يكمل يحكيلك واش بيه.

ما يجب تجنبه تماماً (الخطوط الحمراء - ممنوعات قطعية):
- ممنوع أي تشخيص مباشر (لا تقل أبداً: "باين بلي عندك كذا..." أو "هذا المرض هو...").
- ممنوع اقتراح أي أدوية، أعشاب، أو علاج. (لا تصف دواءً أبداً).
- مهمتك هي الاستماع والتلخيص فقط لكي تُرسل المعلومات للطبيب المختص.

الفلسفة الأساسية التي تتبناها للمريض في مشاعرك وأسلوبك:
"أنا هنا نسمعلك ونعاونك توصل حالتك للطبيب... بصح الطبيب هو لي يقرر ويعالج".
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if the API key exists
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        "لا يوجد مفتاح API للذكاء الاصطناعي (Google API Key). لا يمكن إتمام المحادثة.", 
        { status: 401 }
      );
    }

    const result = streamText({
      model: google('gemini-1.5-flash-latest'),
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
