import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function InstitutionalHome() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Innovación y Transformación Digital
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8">
              Expertos en soluciones tecnológicas que impulsan tu negocio hacia el futuro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Leer Nuestro Blog
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">
                Contáctanos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Valores</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Nos guían en cada proyecto y decisión que tomamos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Innovación',
                description: 'Siempre buscamos las mejores tecnologías y metodologías para adelantarnos al futuro',
              },
              {
                icon: '🤝',
                title: 'Colaboración',
                description: 'Trabajamos en equipo con nuestros clientes para lograr objetivos comunes',
              },
              {
                icon: '✨',
                title: 'Excelencia',
                description: 'Comprometidos con la calidad en cada detalle de nuestro trabajo',
              },
            ].map((valor, i) => (
              <Card key={i} className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{valor.icon}</div>
                <h3 className="text-xl font-bold mb-3">{valor.title}</h3>
                <p className="text-slate-600">{valor.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Servicios Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Servicios</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Soluciones integrales para tu transformación digital
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Desarrollo Web',
                description: 'Aplicaciones web modernas, escalables y de alto rendimiento',
              },
              {
                title: 'Consultoría Digital',
                description: 'Estrategias y soluciones personalizadas para tu negocio',
              },
              {
                title: 'Datos e Inteligencia',
                description: 'Analytics avanzado y soluciones de datos para decisiones inteligentes',
              },
              {
                title: 'Transformación Cloud',
                description: 'Migración y optimización de infraestructura en la nube',
              },
            ].map((servicio, i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">{servicio.title}</h3>
                <p className="text-slate-600">{servicio.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Blog Preview Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Últimas del Blog</h2>
              <p className="text-slate-600">
                Artículos, tendencias y análisis sobre transformación digital
              </p>
            </div>
            <Link href="/blog" className="hidden md:block">
              <Button variant="outline">
                Ver Todo el Blog →
              </Button>
            </Link>
          </div>

          <div className="bg-slate-100 rounded-lg p-16 text-center">
            <p className="text-slate-600 text-lg mb-4">
              Descubre artículos, análisis y reflexiones sobre tecnología e innovación
            </p>
            <Link href="/blog">
              <Button size="lg">Ir al Blog</Button>
            </Link>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Contáctanos hoy y descubre cómo podemos ayudarte a alcanzar tus objetivos
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
            Solicitar Consulta
          </Button>
        </div>
      </section>
    </main>
  );
}
