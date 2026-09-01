import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: postsCount }, { count: publishedCount }, { count: categoriesCount }, { count: subcategoriesCount }] =
    await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("subcategories").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Notas totales", value: postsCount ?? 0 },
    { label: "Publicadas", value: publishedCount ?? 0 },
    { label: "Categorías", value: categoriesCount ?? 0 },
    { label: "Subcategorías", value: subcategoriesCount ?? 0 },
  ];

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
