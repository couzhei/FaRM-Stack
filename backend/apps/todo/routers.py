from fastapi import APIRouter, Body, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from .models import TaskModel, UpdateTaskModel

router = APIRouter()


@router.post("/", response_description="Add new task")
async def create_task(request: Request, task: TaskModel = Body(...)):
    task = jsonable_encoder(task)
    # ofcourse we need data validation
    new_task = await request.app.mongodb["tasks"].insert_one(task)
    created_task = await request.app.mongodb["tasks"].find_one(
        {"_id": new_task.inserted_id}
    )

    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_task)


@router.get("/", response_description="List all tasks")
async def list_tasks(request: Request):
    tasks = []
    # of course we didn't need to hardcode length=100! but to
    # add some pagination behavior
    for doc in await request.app.mongodb["tasks"].find().to_list(length=100):
        # it would be nice to make a pagination
        tasks.append(doc)
    return tasks


@router.get("/{id}", response_description="Get a single task")
async def show_task(id: str, request: Request):
    if task := await request.app.mongodb["tasks"].find_one({"_id": id}):
        return task

    raise HTTPException(status_code=404, detail=f"Task {id} not found")


@router.put("/{id}", response_description="Update a task")
async def update_task(
    id: str,
    request: Request,
    task: UpdateTaskModel = Body(...),
):
    task = {k: v for k, v in task.dict().items() if v is not None}
    # the above checks if we don't accidentally update some
    # of the values to empty string

    if len(task) >= 1:  # little bit defensive programming, we don't want to
        # update our mongodb without having a body in the request
        update_result = await request.app.mongodb["tasks"].update_one(
            {"_id": id}, {"$set": task}
        )

        if update_result.modified_count == 1:
            if updated_task := await request.app.mongodb["tasks"].find_one(
                {"_id": id},
            ):
                return updated_task

    if existing_task := await request.app.mongodb["tasks"].find_one(
        {"_id": id},
    ):
        return existing_task

    raise HTTPException(status_code=404, detail=f"Task {id} not found")


@router.delete("/{id}", response_description="Delete Task")
async def delete_task(id: str, request: Request):
    delete_result = await request.app.mongodb["tasks"].delete_one({"_id": id})

    if delete_result.deleted_count == 1:
        # we have no document to show you now, hence the HTTP status code 204
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content="")

    raise HTTPException(status_code=404, detail=f"Task {id} not found")
