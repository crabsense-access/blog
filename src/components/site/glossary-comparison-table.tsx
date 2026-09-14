import type { GlossaryComparisonTable } from "@/lib/types";

export function GlossaryComparisonTableBlock({ table }: { table: GlossaryComparisonTable }) {
  return (
    <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted">
            {table.headers.map((header, index) => (
              <th
                key={index}
                className="border-b border-border px-4 py-3 text-left font-semibold whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
