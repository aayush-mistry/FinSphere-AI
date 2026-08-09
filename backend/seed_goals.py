import sqlite3
from datetime import datetime, timedelta

def seed():
    conn = sqlite3.connect('finsphere.db')
    cursor = conn.cursor()
    
    # Create a goal
    target_date = (datetime.utcnow() + timedelta(days=365)).isoformat()
    now = datetime.utcnow().isoformat()
    
    cursor.execute("""
        INSERT INTO goals (user_id, name, description, category, target_amount, current_amount, target_date, priority, status, monthly_contribution, created_at, updated_at)
        VALUES (1, 'Emergency Fund', '6 months of living expenses', 'Savings', 120000, 40000, ?, 'High', 'On Track', 8000, ?, ?)
    """, (target_date, now, now))
    
    goal_id = cursor.lastrowid
    
    # Create some contributions
    cursor.execute("""
        INSERT INTO goal_contributions (goal_id, transaction_id, amount, contribution_date, created_at)
        VALUES (?, NULL, 20000, ?, ?)
    """, (goal_id, (datetime.utcnow() - timedelta(days=60)).isoformat(), now))
    
    cursor.execute("""
        INSERT INTO goal_contributions (goal_id, transaction_id, amount, contribution_date, created_at)
        VALUES (?, NULL, 10000, ?, ?)
    """, (goal_id, (datetime.utcnow() - timedelta(days=30)).isoformat(), now))
    
    cursor.execute("""
        INSERT INTO goal_contributions (goal_id, transaction_id, amount, contribution_date, created_at)
        VALUES (?, NULL, 10000, ?, ?)
    """, (goal_id, now, now))
    
    conn.commit()
    conn.close()
    print("Database seeded successfully with Goal ID:", goal_id)

if __name__ == '__main__':
    seed()
