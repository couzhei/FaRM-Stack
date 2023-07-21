from typing import Optional
import uuid
from pydantic import BaseModel, Field
from datetime import datetime


class TaskModel(BaseModel):
    id: str = Field(  # Using a default_factory for this string kind of
        # will free us some time from creating a serialier/deserializers
        default_factory=uuid.uuid4,
        alias="_id",  # this will tell mongo to treat this field as private
        # so include that in the database
    )
    name: str = Field(...)
    completed: bool = False

    # datetime fields regarding deadline, task, repition, etc.
    created_on: datetime = datetime.now()
    start_on: Optional[datetime]
    deadline_on: Optional[datetime]

    # author
    # user with password ><

    class Config:
        allow_population_by_field_name = True
        schema_extra = {  # it's important for documentation
            "example": {
                "id": "00010203-0405-0607-0809-0a0b0c0d0e0f",
                "name": "My important task",
                "completed": True,
            }
        }


class UpdateTaskModel(BaseModel):
    name: Optional[str]
    completed: Optional[bool]

    class Config:
        schema_extra = {
            "example": {
                "name": "My important task",
                "completed": True,
            }
        }
