// app/api/uppsogn/route.ts
import { NextRequest, NextResponse } from 'next/server';

type UppsognForm = {
  nafn: string;
  kennitala: string;
  leiguhusnaedi: string;
  leigusali: string;
  uppsagnardagur: string;
  lysing: string;
  onnurAtridi: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UppsognForm;

    const {
      nafn,
      kennitala,
      leiguhusnaedi,
      leigusali,
      uppsagnardagur,
      lysing,
      onnurAtridi,
    } = body;

    if (!nafn || !kennitala || !leiguhusnaedi || !leigusali || !uppsagnardagur) {
      return NextResponse.json(
        { error: 'Vantar nauðsynlegar upplýsingar í formið.' },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY vantar í umhverfisbreytur.' },
        { status: 500 },
      );
    }

    const systemPrompt = `
Þú ert sérfræðingur í íslenskri húsaleigulöggjöf og opinberu, formlegu málfari.
Þú átt að semja formlegt, skýrt og kurteist uppsagnarbréf frá leigjanda vegna íbúðarleigu.

Kröfur:
- Formlegt en læsilegt mál.
- Ekki bæta við nýjum staðreyndum, notaðu aðeins upplýsingarnar sem þú færð.
- Gera ráð fyrir tímalausum leigusamningi með venjulegum 3 mánaða uppsagnarfresti, nema annað sé sérstaklega tekið fram í textanum.
- Uppbygging bréfsins:
  * Heimilisfang og dagsetning ef við á.
  * Nafn og heimilisfang leigusala sem ávarp.
  * Skýr yfirlýsing um uppsögn leigusamnings vegna tiltekins leiguhúsnæðis.
  * Taka fram hvenær uppsögnin tekur gildi og hvenær áætlað er að rýming fari fram.
  * Stutt útskýring á aðstæðum ef notandi hefur gefið slíka lýsingu.
  * Kurteis lokasetning og undirskrift leigjanda.
- Ekki minnast á gervigreind, forrit eða að bréfið hafi verið búið til sjálfvirkt.
`;

    const userPrompt = `
Upplýsingar frá notanda um uppsögn leigu:

Nafn leigjanda: ${nafn}
Kennitala leigjanda: ${kennitala}
Leiguhúsnæði (heimilisfang): ${leiguhusnaedi}
Leigusali / móttakandi: ${leigusali}
Uppsögnin á að taka gildi frá: ${uppsagnardagur}

Lýsing á aðstæðum (ef til staðar):
${lysing || 'engin sérstök lýsing gefin'}

Önnur atriði sem notandi vill nefna (ef til staðar):
${onnurAtridi || 'engin önnur atriði tilgreind'}

Samdu EITT heilstætt uppsagnarbréf út frá þessu, tilbúið til að prenta eða senda með tölvupósti.
`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.4,
      }),
    });

    if (!openaiRes.ok) {
      console.error('OpenAI API error', await openaiRes.text());
      return NextResponse.json(
        { error: 'Villa við samskipti við gervigreind.' },
        { status: 502 },
      );
    }

    const json = await openaiRes.json();
    const bref: string | undefined =
      json.choices?.[0]?.message?.content ?? undefined;

    if (!bref) {
      return NextResponse.json(
        { error: 'Enginn texti skilaðist frá gervigreind.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ bref });
  } catch (err) {
    console.error('Villa í /api/uppsogn:', err);
    return NextResponse.json(
      { error: 'Óvænt villa við að búa til uppsagnarbréf.' },
      { status: 500 },
    );
  }
}
