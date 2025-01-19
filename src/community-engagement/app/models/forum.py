from datetime import datetime, UTC
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User

class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    author_id: int = Field(foreign_key="user.id")
    
    replies: list["Reply"] = Relationship(back_populates="post")
    author: "User" = Relationship(back_populates="posts")
    

class Reply(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    author_id: int = Field(foreign_key="user.id")
    post_id: int = Field(foreign_key="post.id")
    
    post: Post = Relationship(back_populates="replies")
    author: "User" = Relationship(back_populates="replies")