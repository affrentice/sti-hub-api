from pathlib import Path
from sqlmodel import create_engine, Session

# Get the base directory of your project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Create database path
DATABASE_URL = f"sqlite:///{BASE_DIR}/community.db"

# Alternatively, for development, you could use:
# DATABASE_URL = "sqlite:///community.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

def get_session():
    with Session(engine) as session:
        yield session
