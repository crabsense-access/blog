import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CONTACT_EMAIL = 'contacto@crabsense.com';

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-28">
        <div className="max-w-[108rem] mx-auto px-10 text-center">
          <h1 className="text-4xl md:text-5xl mb-4">Contáctanos</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Contános sobre tu proyecto y te respondemos a la brevedad
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[108rem] mx-auto px-10">
          <div className="max-w-xl mx-auto text-center">
            <Card className="p-8">
              <h2 className="text-xl font-bold mb-2">Escribinos</h2>
              <p className="text-slate-600 mb-6">
                La forma más rápida de contactarnos es por email.
              </p>
              <Button asChild size="lg">
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </Button>
            </Card>

            <p className="mt-8 text-sm text-slate-500">
              También podés{' '}
              <Link href="/blog" className="text-blue-600 hover:underline">
                leer nuestro blog
              </Link>{' '}
              mientras tanto.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
