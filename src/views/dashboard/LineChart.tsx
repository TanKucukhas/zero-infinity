import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const chartData = [
  { month: "Jan", value: 65 },
  { month: "Feb", value: 78 },
  { month: "Mar", value: 82 },
  { month: "Apr", value: 75 },
  { month: "May", value: 88 },
  { month: "Jun", value: 92 },
];

export default function LineChart() {
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-24 gap-1">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1 flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t transition-all hover:from-brand-700 hover:to-brand-500"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Average Growth</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">+15.2%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}