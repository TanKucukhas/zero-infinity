import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const transactions = [
  { id: 1, name: "John Doe", amount: "$2,500", status: "completed", trend: "up" },
  { id: 2, name: "Jane Smith", amount: "$1,800", status: "pending", trend: "down" },
  { id: 3, name: "Bob Johnson", amount: "$3,200", status: "completed", trend: "up" },
  { id: 4, name: "Alice Brown", amount: "$950", status: "failed", trend: "down" },
];

export default function Transactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900">
                  {transaction.trend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-brand-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{transaction.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{transaction.amount}</p>
                </div>
              </div>
              <Badge 
                variant={
                  transaction.status === "completed" ? "success" : 
                  transaction.status === "pending" ? "warning" : "error"
                }
              >
                {transaction.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}