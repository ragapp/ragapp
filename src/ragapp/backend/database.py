import os

from sqlmodel import Session as SQLSession
from sqlmodel import SQLModel, create_engine

from backend.models.orm import *  # noqa


class DB:
    _engine = None

    @classmethod
    def get_engine(cls):
        if cls._engine is None:
            db_uri = os.environ.get("DB_URI", "sqlite:///ragapp_db.sqlite")
            cls._engine = create_engine(db_uri)
            SQLModel.metadata.create_all(cls._engine)
        return cls._engine

    @classmethod
    def get_session(cls):
        try:
            db = SQLSession(cls.get_engine())
            yield db
        finally:
            db.close()
