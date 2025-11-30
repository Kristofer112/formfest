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
  const body = (await req.json()) as KvortunForm;

  const { nafn, kennitala, mottakandi, lysing, timalina, krafa } = body;

  const bref = `
Kvörtun til ${mottakandi}

Ég, ${nafn}, kt. ${kennitala}, vil hér með koma á framfæri kvörtun vegna eftirfarandi máls.

Lýsing máls:
${lysing}

Tímalína máls:
${timalina}

Krafa mín:
${krafa}

Virðingarfyllst,
${nafn}
  `.trim();

  return NextResponse.json({ bref });
}
