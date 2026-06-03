import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
};

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-slate-500">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}