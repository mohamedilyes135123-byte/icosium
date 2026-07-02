export const runtime = 'edge';

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

    const groqApiKey = process.env.GROQ_API_KEY || "";

    if (!groqApiKey) {
      return Response.json({ message: "مفتاح API للذكاء الاصطناعي (Groq) مفقود." }, { status: 401 });
    }

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: MEDICAL_AI_PERSONA },
        ...messages.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        }))
      ],
      temperature: 0.6,
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API Error Status:", res.status, errText);
      return Response.json({ message: "فشل الاتصال بخادم الذكاء الاصطناعي الجديد." }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "عذراً، لم أتمكن من معالجة الرسالة.";

    return Response.json({ message: reply });
  } catch (error) {
    console.error("AI Error:", error);
    return Response.json({ message: "حدث خطأ داخلي في الخادم بسبب الذكاء الاصطناعي." }, { status: 500 });
  }
}
