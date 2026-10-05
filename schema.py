from pydantic import BaseModel


# ======================================
# REGISTER
# ======================================

class UserCreate(BaseModel):

    username: str

    password: str


# ======================================
# LOGIN
# ======================================

class UserLogin(BaseModel):

    username: str

    password: str


# ======================================
# CREATE TODO
# ======================================

class TodoCreate(BaseModel):

    title: str

    description: str

    completed: bool = False


# ======================================
# UPDATE TODO
# ======================================

class TodoUpdate(BaseModel):

    title: str

    description: str

    completed: bool
