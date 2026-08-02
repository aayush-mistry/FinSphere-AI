from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, Date, Enum
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()

class UserType(str, enum.Enum):
    PERSONAL = "Personal"
    BUSINESS = "Business"

class AccountType(str, enum.Enum):
    CHECKING = "Checking"
    SAVINGS = "Savings"
    LOAN = "Loan"
    INVESTMENT = "Investment"

class InsuranceType(str, enum.Enum):
    LIFE = "Life"
    HEALTH = "Health"
    AUTO = "Auto"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(Enum(UserType))
    risk_profile = Column(String)
    
    accounts = relationship("Account", back_populates="user")
    policies = relationship("InsurancePolicy", back_populates="user")
    tax_records = relationship("TaxRecord", back_populates="user")
    conversations = relationship("AIConversation", back_populates="user")

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(AccountType))
    balance = Column(Float, default=0.0)
    institution = Column(String)
    
    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    amount = Column(Float)
    date = Column(Date)
    category = Column(String)
    status = Column(String)
    is_flagged_fraud = Column(Boolean, default=False)
    
    account = relationship("Account", back_populates="transactions")

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(InsuranceType))
    coverage_amount = Column(Float)
    premium = Column(Float)
    
    user = relationship("User", back_populates="policies")

class TaxRecord(Base):
    __tablename__ = "tax_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    fiscal_year = Column(Integer)
    estimated_tax = Column(Float)
    deductions_found = Column(Float)
    
    user = relationship("User", back_populates="tax_records")

class AIConversation(Base):
    __tablename__ = "ai_conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message_history = Column(JSON)
    
    user = relationship("User", back_populates="conversations")
