import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import Image from "next/image";

export default function Award() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700 text-white">
      <CardContent>
        <Trophy className="mb-2 h-8 w-8" />
        <h3 className="text-xl font-bold">Congratulations John! 🎉</h3>
        <p className="mt-1 text-sm text-brand-50">You have done 57.6% more sales today</p>
        <button className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50">
          View Sales
        </button>
      </CardContent>
      <Image 
        src="/images/pages/trophy.png" 
        alt="Trophy" 
        width={120} 
        height={120}
        className="absolute -bottom-4 -right-4 opacity-20"
      />
    </Card>
  );
}