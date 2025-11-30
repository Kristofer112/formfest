// app/api/kvortun/route.ts
import { NextRequest, NextResponse } from 'next/server';

type KvortunForm = {
  nafn: string;
  kennitala: string;
  mottakandi: string;
  lysing: string;
  timalina: string;
  krafa: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as KvortunForm;

    const { nafn, kennitala, mottakandi, lysing, timalina, krafa } = body;

    if (!nafn || !kennitala || !mottakandi || !lysing || !krafa) {
      return NextResponse.json(
        { error: 'Vantar nauðsynlegar upplýsingar.' },
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
Þú ert sérfræðingur í íslenskri stjórnsýslu- og lagalegri málfræði.
Þú átt að semja formlegt, skýrt og kurteist kvörtunarbréf á íslensku út frá upplýsingum frá notanda.

Kröfur:
- Formlegt en skiljanlegt mál.
- Haltu öllum staðreyndum (dagsetningar, atvik, kröfur).
- Bættu ekki við nýjum staðreyndum.
- Uppbygging:
  * Fyrirsögn/efnislína.
  * Ávarp til viðtakanda.
  * 2–4 stuttar efnisgreinar sem útskýra:
      - hver er að kvarta,
      - hvað gerðist og hvenær,
      - hvers vegna kvörtunin er sett fram,
      - hvaða úrlausn er óskað.
  * Kurteis lokasetning og undirskrift.
- Ekki minnast á gervigreind eða að textinn hafi verið búinn til sjálfvirkt.
`;

    const userPrompt = `
Upplýsingar frá notanda:

Nafn: ${nafn}
Kennitala: ${kennitala}
Móttakandi: ${mottakandi}

Lýsing máls:
${lysing}

Tímalína atvika:
${timalina || 'ekki sérstaklega tilgreind'}

Krafa (hvað notandi vill að verði gert):
${krafa}

Samdu eitt heilstætt kvörtunarbréf út frá þessu.
`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
    console.error('Villa í /api/kvortun:', err);
    return NextResponse.json(
      { error: 'Óvænt villa við að búa til kvörtunarbréf.' },
      { status: 500 },
    );
  }
}
