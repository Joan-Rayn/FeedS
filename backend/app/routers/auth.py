from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.config import settings
from ..models import User as UserModel
from ..schemas import UserCreate, Token, User as UserSchema
from ..utils.auth import authenticate_user, create_access_token, get_password_hash, generate_random_password, get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter((UserModel.email == user.email) | (UserModel.matricule == user.matricule)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email or matricule already registered")
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(matricule=user.matricule, email=user.email, password_hash=hashed_password, nom=user.nom, prenom=user.prenom, date_naissance=user.date_naissance, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/reset-password")
def reset_password(matricule: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.matricule == matricule).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_password = generate_random_password()
    user.password_hash = get_password_hash(new_password)
    db.commit()
    # TODO: Send email with new password
    return {"message": "Password reset successful", "new_password": new_password}

@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """Get current logged in user information"""
    return current_user
    db.commit()
    # In real app, send email
    return {"message": "Password reset successful", "new_password": new_password}

@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    return current_user