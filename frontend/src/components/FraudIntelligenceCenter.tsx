import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import FraudScanner from "@/components/fraud/FraudScanner";

export default function FraudIntelligenceCenter() {
  return (
    <Card className="col-span-4 lg:col-span-7 border-slate-100 shadow-sm bg-white overflow-hidden relative group">
      <CardHeader>
        <CardTitle className="text-slate-900">Fraud Intelligence Center</CardTitle>
        <CardDescription>Scan receipts or invoices for anomalies and suspicious activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <FraudScanner compact showHighRiskOverlay />
      </CardContent>
    </Card>
  );
}
