// Direct fetch to avoid SDK version incompatibilities

export const runtime = 'edge';

const MEDICAL_AI_PERSONA = `
أنت المساعد الذكي لمنصة "عناية 3inaya" الطبية. 

دورة الأساسي:
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

    const groqKey = process.env.GROQ_API_KEY || "";
    if (!groqKey) {
      return Response.json({ message: "مفتاح API للذكاء الاصطناعي مفقود." }, { status: 401 });
    }

    const aiMessages = [
      { role: "system" as const, content: MEDICAL_AI_PERSONA },
      ...messages.map((m: any) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content
      }))
    ];

    let result = "";
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: aiMessages,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      result = data.choices?.[0]?.message?.content || "";
      
    } catch (err) {
      console.error("Groq API Error:", err);
      return Response.json({ message: "فشل الاتصال بخادم الذكاء الاصطناعي الجديد." }, { status: 500 });
    }

    // Clean up <think> tags if any
    result = result.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();

    return Response.json({ message: result });
  } catch (error) {
    console.error("AI Error:", error);
    return Response.json({ message: "حدث خطأ داخلي في الخادم بسبب الذكاء الاصطناعي." }, { status: 500 });
  }
}
