import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

const countryData = [
  { country: "United States", sales: 12500, percentage: 35, flag: "🇺🇸" },
  { country: "United Kingdom", sales: 8900, percentage: 25, flag: "🇬🇧" },
  { country: "Germany", sales: 7200, percentage: 20, flag: "🇩🇪" },
  { country: "France", sales: 5400, percentage: 15, flag: "🇫🇷" },
  { country: "Canada", sales: 1800, percentage: 5, flag: "🇨🇦" },
];

export default function SalesByCountries() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Sales by Countries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {countryData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.flag}</span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.country}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">${item.sales.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{item.percentage}%</Badge>
                <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full">
                  <div 
                    className="h-2 bg-brand-600 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Total Sales</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                ${countryData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}