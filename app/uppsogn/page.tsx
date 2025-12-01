'use client';

import { FormEvent, useState } from 'react';

type UppsognForm = {
  nafn: string;
  kennitala: string;
  leiguhusnaedi: string;   // heimilisfang leigðu íbúðarinnar
  leigusali: string;       // nafn / heiti leigusala
  uppsagnardagur: string;  // t.d. "frá og með 1. febrúar 2026"
  lysing: string;          // opin lýsing á aðstæðum
  onnurAtridi: string;     // önnur atriði sem skipta máli
};

export default function UppsognPage() {
  const [form, setForm] = useState<UppsognForm>({
    nafn: '',
    kennitala: '',
    leiguhusnaedi: '',
    leigusali: '',
    uppsagnardagur: '',
    lysing: '',
    onnurAtridi: '',
  });

  const [utkoma, setUtkoma] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof UppsognForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUtkoma(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/uppsogn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('Villa við að búa til bréf');
      }

      const data: { bref?: string; error?: string } = await res.json();
      if (data.bref) {
        setUtkoma(data.bref);
      } else {
        setUtkoma(
          data.error ?? 'Tókst ekki að búa til bréf. Reyndu aftur síðar.',
        );
      }
    } catch (err) {
      setUtkoma('Tókst ekki að búa til bréfið. Reyndu aftur síðar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Uppsögn leigu – leigjandi</h1>

        <p className="text-sm text-gray-700">
          Þetta form hjálpar þér að semja formlegt uppsagnarbréf vegna leigu
          íbúðar. Nauðsynlegar upplýsingar eru merktar sem skylda, en þú getur
          bætt við frjálsum texta þar sem hentar.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white rounded-lg border p-4 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nafn leigjanda</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.nafn}
              onChange={(e) => handleChange('nafn', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kennitala</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.kennitala}
              onChange={(e) => handleChange('kennitala', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Leiguhúsnæði (heimilisfang íbúðar)
            </label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.leiguhusnaedi}
              onChange={(e) => handleChange('leiguhusnaedi', e.target.value)}
              required
              placeholder="t.d. Álfabakki 10, 109 Reykjavík"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Leigusali / móttakandi
            </label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.leigusali}
              onChange={(e) => handleChange('leigusali', e.target.value)}
              required
              placeholder="t.d. Jón Jónsson eða Leigufélag ehf."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Uppsögnin tekur gildi frá (frjáls texti)
            </label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.uppsagnardagur}
              onChange={(e) => handleChange('uppsagnardagur', e.target.value)}
              required
              placeholder="t.d. frá og með 1. mars 2026"
            />
            <p className="text-xs text-gray-500 mt-1">
              Athugaðu að uppsagnarfrestur er yfirleitt 3 mánuðir frá næstu
              mánaðamótum miðað við tímalausan samning.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Lýsing á aðstæðum (valfrjálst)
            </label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[100px]"
              value={form.lysing}
              onChange={(e) => handleChange('lysing', e.target.value)}
              placeholder="Stutt lýsing á aðstæðum, ef þú vilt útskýra nánar."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Önnur atriði sem þú vilt nefna (valfrjálst)
            </label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[80px]"
              value={form.onnurAtridi}
              onChange={(e) => handleChange('onnurAtridi', e.target.value)}
              placeholder="t.d. upplýsingar um tryggingarfé, samskipti, væntingar o.s.frv."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start px-4 py-2 border rounded font-medium disabled:opacity-60"
          >
            {isSubmitting ? 'Bý til bréf…' : 'Búa til uppsagnarbréf'}
          </button>
        </form>

        {utkoma && (
          <section className="mt-4 bg-white border rounded-lg p-4 shadow-sm whitespace-pre-line flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Tillaga að uppsagnarbréfi
              </h2>
              <p>{utkoma}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Endilega komdu með athugasemdir og ég skal reyna að bæta mig
              </label>
              <textarea
                className="w-full border rounded px-2 py-1 min-h-[80px]"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Hvað mætti bréfið gera betur? Hvað var gagnlegt? Hvað var ruglingslegt?"
              />
              {/* Síðar má senda þetta á API, í dag er þetta bara geymt í state */}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
