"use client";

import { useEffect, useState } from "react";
import { BillsClientAPI } from "../services/client-api";
import { UpcomingBillOccurrence, UpcomingBillsSummaryResponse } from "../types";
import { PrivacyMask, usePrivacyMode } from "@/lib/privacy";
import { formatCurrency } from "@/lib/format";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { CalendarClock, AlertCircle, Clock } from "lucide-react";

export function UpcomingBills({ userId, days = 30 }: { userId: number; days?: number }) {
  const { isPrivacyMode } = usePrivacyMode();
  const [occurrences, setOccurrences] = useState<UpcomingBillOccurrence[]>([]);
  const [summary, setSummary] = useState<UpcomingBillsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    Promise.all([
      BillsClientAPI.getUpcomingBills(userId, days),
      BillsClientAPI.getUpcomingBillsSummary(userId, days)
    ])
      .then(([occRes, sumRes]) => {
        if (mounted) {
          setOccurrences(occRes);
          setSummary(sumRes);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
      
    return () => { mounted = false; };
  }, [userId, days]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading upcoming bills...</div>;
  }

  if (error || !summary) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load upcoming bills: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title={`Total Upcoming (${days} days)`}
          value={<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(summary.total_upcoming_amount)} />} 
          highlight
        />
        <MetricCard 
          title="Next 7 Days" 
          value={<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(summary.next_7_days_amount)} />} 
        />
        <MetricCard 
          title="Next 30 Days" 
          value={<PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(summary.next_30_days_amount)} />} 
        />
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Next Bill</h4>
          {summary.next_bill ? (
            <div>
              <div className="text-lg font-bold text-slate-900 truncate">{summary.next_bill.name}</div>
              <div className="text-sm text-slate-500">
                <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(summary.next_bill.amount)} /> on {format(parseISO(summary.next_bill.due_date), "MMM d")}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">None scheduled</div>
          )}
        </div>
      </div>

      {/* Chronological List */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-indigo-500" />
          Schedule ({summary.bill_count} occurrences)
        </h3>

        {occurrences.length === 0 ? (
          <div className="text-center py-8 text-slate-500 border-t border-slate-100 border-dashed">
            <p className="font-medium text-slate-700 mb-1">No upcoming bills</p>
            <p className="text-sm">There are no active bill obligations scheduled within this period.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {occurrences.map((occ, idx) => (
              <OccurrenceRow key={`${occ.bill_id}-${idx}`} occurrence={occ} isPrivacyMode={isPrivacyMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OccurrenceRow({ occurrence, isPrivacyMode }: { occurrence: UpcomingBillOccurrence, isPrivacyMode: boolean }) {
  const dateObj = parseISO(occurrence.due_date);
  
  let dateText = format(dateObj, "MMM d, yyyy");
  if (isToday(dateObj)) dateText = "Today";
  else if (isTomorrow(dateObj)) dateText = "Tomorrow";
  
  let statusBadge = null;
  if (occurrence.status === "Due Today") {
    statusBadge = <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full"><AlertCircle className="w-3 h-3"/> Due Today</span>;
  } else if (occurrence.status === "Due Soon") {
    statusBadge = <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> Due Soon</span>;
  } else {
    statusBadge = <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Upcoming</span>;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-colors gap-4">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-lg w-12 h-12 flex-shrink-0">
          <span className="text-xs font-bold uppercase">{format(dateObj, "MMM")}</span>
          <span className="text-lg font-black leading-none">{format(dateObj, "d")}</span>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">{occurrence.bill_name}</h4>
          <div className="text-sm text-slate-500 flex flex-wrap items-center gap-2 mt-1">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{occurrence.category}</span>
            <span>•</span>
            <span>{occurrence.frequency}</span>
            {occurrence.days_until_due > 1 && (
              <>
                <span>•</span>
                <span>In {occurrence.days_until_due} days</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 pl-16 sm:pl-0">
        <div className="text-lg font-bold text-slate-900">
          <PrivacyMask isPrivacyMode={isPrivacyMode} value={formatCurrency(occurrence.amount)} />
        </div>
        {statusBadge}
      </div>
    </div>
  );
}

function MetricCard({ title, value, highlight = false }: { title: string, value: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-center ${highlight ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-200'}`}>
      <h4 className={`text-sm font-medium mb-1 ${highlight ? 'text-indigo-100' : 'text-slate-500'}`}>{title}</h4>
      <div className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</div>
    </div>
  );
}
