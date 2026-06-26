"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { currency } from "@/lib/utils";

export function AllocationChart({ data }: { data: Array<{ ticker: string; value: number }> }) {
  return (
    <div className="mt-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="ticker" innerRadius={58} outerRadius={96} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.ticker} fill={["#0f766e", "#2563eb", "#b7791f", "#dc2626"][index % 4]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => currency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
