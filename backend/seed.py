import random
import json
from datetime import date, timedelta
from database import SessionLocal, init_db
from models import (
    User, Account, Transaction, InsurancePolicy, TaxRecord, AIConversation,
    UserType, AccountType, InsuranceType
)

def seed_data():
    init_db()
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(User).first():
        print("Database already seeded!")
        return

    print("Seeding database...")

    # 1. Create User
    user = User(
        name="Jane Doe",
        type=UserType.PERSONAL,
        risk_profile="Moderate"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Create Accounts (Checking, Savings, Loan, Investment)
    checking = Account(user_id=user.id, type=AccountType.CHECKING, balance=12450.50, institution="Chase Bank")
    savings = Account(user_id=user.id, type=AccountType.SAVINGS, balance=45000.00, institution="Ally Bank")
    home_loan = Account(user_id=user.id, type=AccountType.LOAN, balance=-320000.00, institution="Wells Fargo Home (3.5% APR)")
    car_loan = Account(user_id=user.id, type=AccountType.LOAN, balance=-18500.00, institution="Toyota Financial (5.2% APR)")
    investment = Account(user_id=user.id, type=AccountType.INVESTMENT, balance=145200.75, institution="Fidelity")

    db.add_all([checking, savings, home_loan, car_loan, investment])
    db.commit()

    # 3. Create 100+ Mixed Transactions
    categories = ["Groceries", "Dining", "Entertainment", "Transport", "Utilities", "Shopping", "Salary", "Rent"]
    merchants = {
        "Groceries": ["Whole Foods", "Trader Joe's", "Safeway"],
        "Dining": ["Sweetgreen", "Starbucks", "Local Restaurant"],
        "Entertainment": ["Netflix", "AMC Theatres", "Spotify"],
        "Transport": ["Uber", "Lyft", "Shell Gas"],
        "Utilities": ["PG&E", "Comcast", "Water Bill"],
        "Shopping": ["Amazon", "Target", "Apple Store"],
        "Salary": ["Tech Corp Inc"],
        "Rent": ["Apartment Complex"]
    }
    
    transactions = []
    end_date = date.today()
    
    for i in range(120):
        category = random.choice(categories)
        merchant = random.choice(merchants[category])
        
        # Salary is income, everything else is expense
        if category == "Salary":
            amount = round(random.uniform(4000.0, 6000.0), 2)
            acc_id = checking.id
        elif category == "Rent":
            amount = -2500.00
            acc_id = checking.id
        else:
            amount = -round(random.uniform(10.0, 200.0), 2)
            acc_id = checking.id if random.random() > 0.3 else investment.id # Some from investment? No, keep it simple
            acc_id = checking.id

        t_date = end_date - timedelta(days=random.randint(0, 90))
        is_fraud = random.random() < 0.02 # 2% chance of flagged fraud

        t = Transaction(
            account_id=acc_id,
            amount=amount,
            date=t_date,
            category=category,
            status="Completed",
            is_flagged_fraud=is_fraud
        )
        transactions.append(t)
    
    db.add_all(transactions)

    # 4. Create Insurance Policy
    health_policy = InsurancePolicy(
        user_id=user.id,
        type=InsuranceType.HEALTH,
        coverage_amount=500000.0,
        premium=350.0
    )
    db.add(health_policy)

    # 5. Create Tax Record
    tax_record = TaxRecord(
        user_id=user.id,
        fiscal_year=2025,
        estimated_tax=15400.0,
        deductions_found=2300.0
    )
    db.add(tax_record)

    # 6. Create AI Conversation Mock
    convo = AIConversation(
        user_id=user.id,
        message_history=[
            {"role": "user", "content": "How can I reduce my taxes?"},
            {"role": "assistant", "content": "Based on your records, you have $2,300 in deductions found. Consider maximizing your 401k."}
        ]
    )
    db.add(convo)

    db.commit()
    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
