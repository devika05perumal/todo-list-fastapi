from sqlalchemy import Column, Integer, String, Boolean, ForeignKey

from database import Base


# ======================================
# USER TABLE
# ======================================

class User(Base):

    __tablename__ = "users"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    username = Column(
        String(100),
        unique=True,
        nullable=False
    )


    password = Column(
        String(100),
        nullable=False
    )


# ======================================
# TODO TABLE
# ======================================

class Todo(Base):

    __tablename__ = "todos"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    title = Column(
        String(200),
        nullable=False
    )


    description = Column(
        String(500),
        nullable=False
    )


    completed = Column(
        Boolean,
        default=False
    )


    # Todo belongs to a user
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
