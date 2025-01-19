from datetime import UTC, datetime
from sqlmodel import SQLModel, Field, Relationship

from .forum import Post, Reply

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    is_active: bool = Field(default=True)
    
    # Relationships
    posts: list[Post] = Relationship(back_populates="author")
    replies: list[Reply] = Relationship(back_populates="author")
