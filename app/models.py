from sqlmodel import Field, SQLModel

class UserBase(SQLModel): # data model
    username: str = Field(index=True)

class User(UserBase, table=True): # table model
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    disabled: bool = False

class UserPublic(UserBase):
    id: int # redeclares id to be an integer (and not None), doesn't show pwd
    username: str

class UserCreate(UserBase):
    username: str
    password: str # plain text password

class UserUpdate(UserBase):
    username: str | None = None
    password: str | None = None # plain text password
