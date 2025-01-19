from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Annotated, List

from ...core.database import get_session
from ...core.auth import get_current_active_user
from ...models.user import User
from ...models.forum import Post, Reply
from . import schemas

router = APIRouter(prefix="/forum", tags=["forum"])

@router.post("/posts", response_model=schemas.PostResponse)
def create_post(
    post: schemas.PostCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    db_post = Post(**post.model_dump(), author_id=current_user.id)
    session.add(db_post)
    session.commit()
    session.refresh(db_post)
    return db_post

@router.get("/posts", response_model=list[schemas.PostResponse])
def get_posts(*,
    skip: int = 0,
    limit: int = 10,
    session: Annotated[Session, Depends(get_session)]
):
    posts = session.exec(select(Post).offset(skip).limit(limit))
    return posts.all()

@router.post("/replies", response_model=schemas.ReplyResponse)
def create_reply(
    reply: schemas.ReplyCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    db_reply = Reply(**reply.model_dump(), author_id=current_user.id)
    session.add(db_reply)
    session.commit()
    session.refresh(db_reply)
    return db_reply