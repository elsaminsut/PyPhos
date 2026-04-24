from sqlmodel import Field, SQLModel

class UserBase(SQLModel): # data model
    name: str = Field(index=True)
    age: int | None = Field(default=None, index=True)

class User(UserBase, table=True): # table model
    id: int | None = Field(default=None, primary_key=True)
    password: str

class UserPublic(UserBase):
    id: int # redeclares id to be an integer (and not None), doesn't show pwd

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    name: str | None = None 
    age: int | None = None 
    password: str | None = None 
