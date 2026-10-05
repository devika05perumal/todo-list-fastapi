from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

import model
import schema

from database import engine, get_db


# Create tables
model.Base.metadata.create_all(bind=engine)


app = FastAPI(title="To-Do List")


# Static files
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


# Templates
templates = Jinja2Templates(directory="templates")


# =========================
# HOME
# =========================

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )


# =========================
# HEALTH
# =========================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================
# REGISTER
# =========================

@app.post("/register")
def register(
    user: schema.UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(model.User).filter(
        model.User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    new_user = model.User(
        username=user.username,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "username": new_user.username,
        "user_id": new_user.id
    }


# =========================
# LOGIN
# =========================

@app.post("/login")
def login(
    user: schema.UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(model.User).filter(
        model.User.username == user.username
    ).first()

    if existing_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if existing_user.password != user.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    return {
        "message": "Login successful",
        "username": existing_user.username,
        "user_id": existing_user.id
    }


# =========================
# CREATE TODO
# =========================

@app.post("/todo")
def create_todo(
    todo: schema.TodoCreate,
    user_id: int,
    db: Session = Depends(get_db)
):

    print("CREATE TODO USER ID:", user_id)

    user = db.query(model.User).filter(
        model.User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_todo = model.Todo(
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        user_id=user_id
    )

    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)

    return {
        "message": "Todo created successfully",
        "todo": {
            "id": new_todo.id,
            "title": new_todo.title,
            "description": new_todo.description,
            "completed": new_todo.completed,
            "user_id": new_todo.user_id
        }
    }


# =========================
# GET ALL TODOS
# =========================

@app.get("/todo")
def get_all_todos(
    user_id: int,
    db: Session = Depends(get_db)
):

    print("GET TODO USER ID:", user_id)

    todos = db.query(model.Todo).filter(
        model.Todo.user_id == user_id
    ).all()

    return todos


# =========================
# GET SINGLE TODO
# =========================

@app.get("/todo/{todo_id}")
def get_todo(
    todo_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    todo = db.query(model.Todo).filter(
        model.Todo.id == todo_id,
        model.Todo.user_id == user_id
    ).first()

    if todo is None:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    return todo


# =========================
# UPDATE TODO
# =========================

@app.put("/todo/{todo_id}")
def update_todo(
    todo_id: int,
    todo_data: schema.TodoUpdate,
    user_id: int,
    db: Session = Depends(get_db)
):

    todo = db.query(model.Todo).filter(
        model.Todo.id == todo_id,
        model.Todo.user_id == user_id
    ).first()

    if todo is None:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    todo.title = todo_data.title
    todo.description = todo_data.description
    todo.completed = todo_data.completed

    db.commit()
    db.refresh(todo)

    return {
        "message": "Todo updated successfully",
        "todo": todo
    }


# =========================
# DELETE TODO
# =========================

@app.delete("/todo/{todo_id}")
def delete_todo(
    todo_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    todo = db.query(model.Todo).filter(
        model.Todo.id == todo_id,
        model.Todo.user_id == user_id
    ).first()

    if todo is None:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    db.delete(todo)
    db.commit()

    return {
        "message": "Todo deleted successfully"
    }