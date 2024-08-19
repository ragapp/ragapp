import os

from sqlmodel import Session as SQLSession
from sqlmodel import SQLModel, create_engine

DB_URI = os.environ.get("DB_URI", "sqlite:///ragapp_db.sqlite")

engine = create_engine(DB_URI)
SQLModel.metadata.create_all(engine)


def get_db_session():
    db = SQLSession(engine)
    try:
        yield db
    finally:
        db.close()
