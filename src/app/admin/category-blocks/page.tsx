import { getCategories } from "@/lib/queries/categories";
import { getCategoryBlocks } from "@/lib/queries/category-blocks";
import { CategoryBlockForm } from "./category-block-form";

export const dynamic = "force-dynamic";

export default async function CategoryBlocksPage() {
  const [blocks, categories] = await Promise.all([
    getCategoryBlocks(),
    getCategories(),
  ]);

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Bloques de categoría</h1>
        <p className="text-sm text-muted-foreground">
          Los 3 bloques que aparecen en /blog debajo de &quot;Más vistos&quot;,
          cada uno mostrando notas de una categoría.
        </p>
      </div>

      {blocks.map((block) => (
        <div key={block.position}>
          <h2 className="text-xl font-semibold mb-4">Bloque {block.position}</h2>
          <CategoryBlockForm block={block} categories={categories} />
        </div>
      ))}
    </div>
  );
}
