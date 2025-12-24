from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import User as UserModel
from ..schemas import User as UserSchema, UserCreate, UserUpdate
from ..utils.auth import get_current_admin_user, get_password_hash

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    current_user: UserModel = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    db_user = db.query(UserModel).filter((UserModel.email == user.email) | (UserModel.matricule == user.matricule)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email or matricule already registered")
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(matricule=user.matricule, email=user.email, password_hash=hashed_password, nom=user.nom, prenom=user.prenom, date_naissance=user.date_naissance, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user_update.dict(exclude_unset=True).items():
        if key == "password":
            value = get_password_hash(value)
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}