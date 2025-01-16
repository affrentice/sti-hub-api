from datetime import datetime
from sqlmodel import SQLModel

class PostBase(SQLModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    created_at: datetime
    updated_at: datetime
    author_id: int
    reply_count: int | None = None

class ReplyBase(SQLModel):
    content: str

class ReplyCreate(ReplyBase):
    post_id: int

class ReplyResponse(ReplyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    author_id: int
    post_id: int