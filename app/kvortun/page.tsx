'use client';

import { FormEvent, useState } from 'react';

type KvortunForm = {
  nafn: string;
  kennitala: string;
  mottakandi: string;
  lysing: string;
  timalina: string;
  krafa: string;
};

export default function KvortunPage() {
  const [form, setForm] = useState<KvortunForm>({
    nafn: '',
    kennitala: '',
    mottakandi: '',
    lysing: '',
    timalina: '',
    krafa: '',
  });

  const [utkoma, setUtkoma] = useState<string | null>(null);

  function handleChange(field: keyof KvortunForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setUtkoma(null);

  try {
    const res = await fetch('/api/kvortun', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      throw new Error('Villa við að búa til bréf');
    }

    const data: { bref: string } = await res.json();
    setUtkoma(data.bref);
  } catch (err) {
    setUtkoma('Tókst ekki að búa til bréfið. Reyndu aftur síðar.');
  }
}


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Kvörtun – Formfest</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white rounded-lg border p-4 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nafn</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.nafn}
              onChange={(e) => handleChange('nafn', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Kennitala
            </label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.kennitala}
              onChange={(e) => handleChange('kennitala', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Móttakandi (t.d. Kópavogsbær)
            </label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.mottakandi}
              onChange={(e) => handleChange('mottakandi', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Lýsing máls
            </label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[100px]"
              value={form.lysing}
              onChange={(e) => handleChange('lysing', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tímalína (dagsetningar, atvik)
            </label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[80px]"
              value={form.timalina}
              onChange={(e) => handleChange('timalina', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Krafa (hvað viltu að verði gert?)
            </label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[80px]"
              value={form.krafa}
              onChange={(e) => handleChange('krafa', e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="self-start px-4 py-2 border rounded font-medium"
          >
            Búa til bréf
          </button>
        </form>

        {utkoma && (
          <section className="mt-4 bg-white border rounded-lg p-4 shadow-sm whitespace-pre-line">
            <h2 className="text-lg font-semibold mb-2">
              Tillaga að kvörtunarbréfi
            </h2>
            <p>{utkoma}</p>
          </section>
        )}
      </div>
    </main>
  );
}
