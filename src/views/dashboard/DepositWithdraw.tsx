import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const recentTransactions = [
  { id: 1, type: "deposit", amount: "$2,500", date: "2024-01-15", status: "completed" },
  { id: 2, type: "withdraw", amount: "$800", date: "2024-01-14", status: "completed" },
  { id: 3, type: "deposit", amount: "$1,200", date: "2024-01-13", status: "pending" },
  { id: 4, type: "withdraw", amount: "$300", date: "2024-01-12", status: "completed" },
];

export default function DepositWithdraw() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit & Withdraw</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1">
              <ArrowDownLeft className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button variant="outline" className="flex-1">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === "deposit" 
                        ? "bg-green-100 dark:bg-green-900" 
                        : "bg-red-100 dark:bg-red-900"
                    }`}>
                      {transaction.type === "deposit" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {transaction.type === "deposit" ? "Deposit" : "Withdrawal"}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === "deposit" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {transaction.type === "deposit" ? "+" : "-"}{transaction.amount}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}