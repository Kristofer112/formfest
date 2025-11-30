import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Formfest</h1>
      <p className="mb-2">Formleg bréf á 1 mínútu – tilraunaútgáfa.</p>
      <a href="/kvortun" className="underline">
        Fara í kvörtunarbréf
      </a>
    </main>
  );
}