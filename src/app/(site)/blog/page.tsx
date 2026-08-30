import Link from 'next/link';
import { PostCard } from '@/components/site/post-card';
import { Pagination } from '@/components/site/pagination';
import { getPublishedPosts, POSTS_PER_PAGE } from '@/lib/queries/posts';

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage({
  searchParams,
}: PageProps<'/blog'>) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const { posts, count } = await getPublishedPosts(page);
  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            ← Volver a inicio
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog y Recursos</h1>
            <p className="text-lg text-slate-600">
              Artículos, análisis y reflexiones sobre innovación tecnológica y transformación digital
            </p>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mb-16">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-600 text-lg mb-4">No hay artículos disponibles por el momento.</p>
              <p className="text-slate-500">Vuelve pronto para nuevos contenidos</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination basePath="/blog" page={page} totalPages={totalPages} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
