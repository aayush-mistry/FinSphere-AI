import calendar
from datetime import date, timedelta, datetime, timezone
from typing import List, Optional
import models
import schemas

def add_months(start_date: date, months: int, original_due_day: int) -> date:
    month = start_date.month - 1 + months
    year = start_date.year + month // 12
    month = month % 12 + 1
    
    # Calculate the max valid day for the target month
    _, max_day = calendar.monthrange(year, month)
    
    # Use the original due day, or clamp it if it exceeds the month's max days
    target_day = min(original_due_day, max_day)
    return date(year, month, target_day)

def generate_upcoming_occurrences(
    bills: List[models.Bill], 
    reference_date: date, 
    horizon_days: int
) -> List[schemas.UpcomingBillOccurrence]:
    
    occurrences = []
    end_horizon = reference_date + timedelta(days=horizon_days)
    
    # Only active bills
    active_bills = [b for b in bills if b.status == "Active"]
    
    for bill in active_bills:
        start_d = bill.start_date.date() if isinstance(bill.start_date, datetime) else bill.start_date
        end_d = (bill.end_date.date() if isinstance(bill.end_date, datetime) else bill.end_date) if bill.end_date else None
        
        freq = bill.frequency
        due_day = bill.due_day
        
        # Determine the earliest possible occurrence we can generate.
        # It must be >= start_date.
        # We need to find all occurrences between max(start_date, reference_date) and min(end_date, end_horizon)
        
        current_occ = start_d
        
        # Advance current_occ until it's at least the reference date
        if freq == "Weekly":
            while current_occ < reference_date:
                current_occ += timedelta(days=7)
        elif freq == "Monthly":
            # For monthly, we align to due_day
            # First, set current_occ to the due_day of the start_date's month
            _, max_day = calendar.monthrange(start_d.year, start_d.month)
            day = min(due_day, max_day)
            current_occ = date(start_d.year, start_d.month, day)
            
            # If the aligned due date is before the start_date, advance one month
            if current_occ < start_d:
                current_occ = add_months(current_occ, 1, due_day)
                
            while current_occ < reference_date:
                current_occ = add_months(current_occ, 1, due_day)
                
        elif freq == "Quarterly":
            due_day_fallback = start_d.day
            while current_occ < reference_date:
                current_occ = add_months(current_occ, 3, due_day_fallback)
                
        elif freq == "Half-Yearly":
            due_day_fallback = start_d.day
            while current_occ < reference_date:
                current_occ = add_months(current_occ, 6, due_day_fallback)
                
        elif freq == "Yearly":
            # Advance year by year
            while current_occ < reference_date:
                try:
                    current_occ = current_occ.replace(year=current_occ.year + 1)
                except ValueError:
                    # Leap year 29 Feb edge case
                    current_occ = current_occ.replace(year=current_occ.year + 1, month=3, day=1)
                    
        # Now current_occ is the first occurrence >= reference_date.
        # Generate occurrences until we hit the horizon or the bill's end_date
        
        while current_occ <= end_horizon:
            if end_d and current_occ > end_d:
                break
                
            days_until = (current_occ - reference_date).days
            
            # Determine visual status
            status = "Upcoming"
            if days_until == 0:
                status = "Due Today"
            elif days_until <= 7:
                status = "Due Soon"
                
            occurrences.append(schemas.UpcomingBillOccurrence(
                bill_id=bill.id,
                bill_name=bill.name,
                category=bill.category,
                amount=bill.amount,
                currency=bill.currency or "INR",
                due_date=current_occ.isoformat(),
                frequency=bill.frequency,
                account_id=bill.account_id,
                account_name=None, # In a real scenario, fetch this
                auto_pay=bill.auto_pay,
                days_until_due=days_until,
                status=status
            ))
            
            # Advance to next occurrence
            if freq == "Weekly":
                current_occ += timedelta(days=7)
            elif freq == "Monthly":
                current_occ = add_months(current_occ, 1, due_day)
            elif freq == "Quarterly":
                current_occ = add_months(current_occ, 3, due_day_fallback)
            elif freq == "Half-Yearly":
                current_occ = add_months(current_occ, 6, due_day_fallback)
            elif freq == "Yearly":
                try:
                    current_occ = current_occ.replace(year=current_occ.year + 1)
                except ValueError:
                    current_occ = current_occ.replace(year=current_occ.year + 1, month=3, day=1)
            else:
                break # unknown freq

    # Sort primarily by due_date ascending, then amount descending
    occurrences.sort(key=lambda x: (x.due_date, -x.amount))
    return occurrences

def calculate_upcoming_summary(
    bills: List[models.Bill], 
    reference_date: date, 
    horizon_days: int
) -> schemas.UpcomingBillsSummaryResponse:
    
    occurrences = generate_upcoming_occurrences(bills, reference_date, horizon_days)
    
    total = sum(o.amount for o in occurrences)
    
    next_7 = sum(o.amount for o in occurrences if o.days_until_due <= 7)
    next_30 = sum(o.amount for o in occurrences if o.days_until_due <= 30)
    next_90 = sum(o.amount for o in occurrences if o.days_until_due <= 90)
    
    next_bill_summary = None
    if occurrences:
        next_occ = occurrences[0]
        next_bill_summary = schemas.NextBillSummary(
            name=next_occ.bill_name,
            amount=next_occ.amount,
            due_date=next_occ.due_date
        )
        
    return schemas.UpcomingBillsSummaryResponse(
        total_upcoming_amount=round(total, 2),
        bill_count=len(occurrences),
        next_bill=next_bill_summary,
        next_7_days_amount=round(next_7, 2),
        next_30_days_amount=round(next_30, 2),
        next_90_days_amount=round(next_90, 2)
    )
