from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# Change YOUR_PASSWORD to your MySQL password
DATABASE_URL = "mysql+pymysql://root:Devika%40123456@localhost/todo_db"


engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

