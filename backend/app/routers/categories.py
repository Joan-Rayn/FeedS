from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import Category as CategoryModel
from ..schemas import Category as CategorySchema, CategoryCreate
from ..utils.auth import get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[CategorySchema])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(CategoryModel).offset(skip).limit(limit).all()
    return categories

@router.get("/{category_id}", response_model=CategorySchema)
def read_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=CategorySchema)
def create_category(category: CategoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    db_category = CategoryModel(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategorySchema)
def update_category(category_id: int, category_update: CategoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in category_update.dict().items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}