from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import Annotated
from datetime import datetime, UTC

from ...core.database import get_session
from ...core.security import verify_password, get_password_hash, create_access_token
from ...models.user import User
from . import schemas

router = APIRouter(prefix="/auth", tags=["auth"])

def create_auth_response(user_id: int) -> schemas.Token:
    access_token = create_access_token(data={"sub": user_id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=schemas.Token)
def register(
    user_create: schemas.UserCreate,
    session: Annotated[Session, Depends(get_session)]
):
    # Check if user exists
    query = select(User).where(User.email == user_create.email)
    result = session.exec(query)
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = User(
        email=user_create.email,
        username=user_create.username,
        hashed_password=get_password_hash(user_create.password),
        created_at=datetime.now(UTC)
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    # Create access token
    # access_token = create_access_token(data={"sub": db_user.id})
    # return {"access_token": access_token, "token_type": "bearer"}
    return create_auth_response(db_user.id)


@router.post("/login", response_model=schemas.Token)
def login(
    credentials: schemas.UserLogin,
    session: Annotated[Session, Depends(get_session)]
):
    # Authenticate user
    query = select(User).where(User.email == credentials.email)
    result = session.exec(query)
    user = result.first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    # access_token = create_access_token(data={"sub": user.id})
    # return {"access_token": access_token, "token_type": "bearer"}
    return create_auth_response(user.id)
