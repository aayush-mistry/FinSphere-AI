import FraudScanner from "@/components/fraud/FraudScanner";

export default function FraudEnginePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <FraudScanner
        title="Fraud Intelligence Engine"
        description="Upload invoices or payment requests. AI will scan for high-risk patterns."
      />
    </div>
  );
}
