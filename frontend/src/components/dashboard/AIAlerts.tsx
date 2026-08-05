import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert, Info, Clock, ArrowRight } from "lucide-react";
import { MOCK_ALERTS } from "@/lib/mockData";
import { AIAlert, AlertSeverity } from "@/lib/types";

export default function AIAlerts() {
  const getAlertStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical": return "border-rose-200 bg-rose-50 text-rose-900 [&>svg]:text-rose-600";
      case "warning": return "border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600";
      case "info": default: return "border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600";
    }
  };

  const getAlertIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical": return <ShieldAlert className="h-4 w-4" />;
      case "warning": return <AlertCircle className="h-4 w-4" />;
      case "info": default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {MOCK_ALERTS.map((alert: AIAlert) => (
        <Alert key={alert.id} className={`transition-all duration-300 hover:shadow-md ${getAlertStyles(alert.severity)}`}>
          {getAlertIcon(alert.severity)}
          <AlertTitle className="text-sm font-semibold flex justify-between items-center">
            {alert.title}
            <span className="text-[10px] font-medium flex items-center gap-1 opacity-70">
              <Clock className="h-3 w-3" />
              {alert.timestamp}
            </span>
          </AlertTitle>
          <AlertDescription className="mt-1 flex flex-col gap-2">
            <span className="text-xs opacity-90">{alert.description}</span>
            <button className="flex items-center gap-1 text-xs font-semibold hover:underline w-fit group">
              {alert.suggestedAction}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
