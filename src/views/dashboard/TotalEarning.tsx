import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";

export default function TotalEarning() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Total Earning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$24,895</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">This month</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">+12.5% from last month</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">This Week</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">$5,432</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Last Week</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">$4,321</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}