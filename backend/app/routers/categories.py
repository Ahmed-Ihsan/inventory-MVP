from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from ..database import get_db
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from ..models.category import Category

router = APIRouter()


@router.get("/", response_model=List[CategoryResponse])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        categories = db.query(Category).offset(skip).limit(limit).all()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")


@router.post("/", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    try:
        db_category = Category(**category.dict())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category name already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating category: {str(e)}")


@router.get("/{category_id}", response_model=CategoryResponse)
def read_category(category_id: int, db: Session = Depends(get_db)):
    try:
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if db_category is None:
            raise HTTPException(status_code=404, detail="Category not found")
        return db_category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching category: {str(e)}")


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    try:
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if db_category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        update_data = category.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
        return db_category
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category name already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating category: {str(e)}")


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    try:
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if db_category is None:
            raise HTTPException(status_code=404, detail="Category not found")
        db.delete(db_category)
        db.commit()
        return {"message": "Category deleted"}
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete category: it may have associated items")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting category: {str(e)}")
