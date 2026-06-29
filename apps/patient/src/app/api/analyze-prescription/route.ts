import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const runtime = 'edge';

const PRESCRIPTION_ANALYSIS_PROMPT = `
أنت نظام تحليل وصفات طبية لمنصة "عناية 3inaya".

مهمتك: تحليل صورة وصفة طبية أو نص وصفة وإعادة تنظيمها بشكل واضح ومنظم باللغة العربية.

أخرج النتيجة بالتنسيق التالي فقط (لا تضف أي نص خارج هذا التنسيق):

**الأدوية الموصوفة:**
• [اسم الدواء] — [الجرعة] — [التكرار] — [المدة]
• [اسم الدواء] — [الجرعة] — [التكرار] — [المدة]

**ملاحظات الطبيب:**
[أي ملاحظات أو تعليمات]

**التشخيص (إن وُجد):**
[التشخيص المذكور]

**تعليمات إضافية:**
[تعليمات الصيام، الغذاء، الراحة، المتابعة...]

إذا لم تتمكن من قراءة بعض البيانات، اكتب [غير واضح] في مكانها.
إذا لم تكن هناك معلومات في خانة معينة، اكتب "لا يوجد".
`;

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      // Return a structured placeholder if no API key
      return Response.json({
        success: false,
        analysis: null,
        message: 'مفتاح الذكاء الاصطناعي غير متوفر — سيتم تفعيله قريباً',
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    let result: string;

    if (file) {
      // Image-based analysis (Gemini Vision)
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

      const { text: analysisText } = await generateText({
        model: google('gemini-1.5-flash'),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: base64,
              },
              {
                type: 'text',
                text: PRESCRIPTION_ANALYSIS_PROMPT,
              },
            ],
          },
        ],
        temperature: 0.2,
      });

      result = analysisText;
    } else if (text) {
      // Text-based analysis
      const { text: analysisText } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: `${PRESCRIPTION_ANALYSIS_PROMPT}\n\nالوصفة:\n${text}`,
        temperature: 0.2,
      });
      result = analysisText;
    } else {
      return Response.json({ success: false, message: 'لم يتم رفع أي ملف' }, { status: 400 });
    }

    return Response.json({ success: true, analysis: result });
  } catch (error) {
    console.error('Prescription analysis error:', error);
    return Response.json(
      { success: false, message: 'حدث خطأ أثناء تحليل الوصفة', analysis: null },
      { status: 500 }
    );
  }
}
