import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const columnData = [
  { category: "Q1", value: 45, color: "bg-blue-500" },
  { category: "Q2", value: 78, color: "bg-green-500" },
  { category: "Q3", value: 62, color: "bg-yellow-500" },
  { category: "Q4", value: 89, color: "bg-purple-500" },
];

export default function DistributedColumnChart() {
  const maxValue = Math.max(...columnData.map(d => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Quarterly Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32 gap-3">
            {columnData.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className={`w-full ${item.color} rounded-t transition-all hover:opacity-80`}
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.category}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Best Quarter</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Q4: 89%</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Growth</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">+97.8%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}