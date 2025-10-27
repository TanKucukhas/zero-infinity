import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const weeklyData = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 80 },
  { day: "Wed", value: 45 },
  { day: "Thu", value: 90 },
  { day: "Fri", value: 75 },
  { day: "Sat", value: 55 },
  { day: "Sun", value: 40 },
];

export default function WeeklyOverview() {
  const maxValue = Math.max(...weeklyData.map(d => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Weekly Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyData.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="w-full bg-brand-600 rounded-t transition-all hover:bg-brand-700"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.day}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Total: {weeklyData.reduce((sum, item) => sum + item.value, 0)}</span>
            <span>Avg: {Math.round(weeklyData.reduce((sum, item) => sum + item.value, 0) / weeklyData.length)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}