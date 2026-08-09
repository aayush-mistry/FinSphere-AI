import sqlite3
conn = sqlite3.connect('finsphere.db')
conn.execute("UPDATE goals SET status='Active' WHERE id=1")
conn.commit()
print("updated status")
