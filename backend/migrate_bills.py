import logging
from sqlalchemy import create_engine
from database import engine
from models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    logger.info("Initializing new tables in the database...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database migration complete.")

if __name__ == "__main__":
    migrate()
