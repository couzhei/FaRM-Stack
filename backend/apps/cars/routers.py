from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

# the below is the wrapper around PyMongo, but here is asynchronous
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

templates = Jinja2Templates(
    directory="../frontend/public",
)


@router.get("/", response_class=HTMLResponse)
async def home(req: Request, page: int = 1, page_size: int = 10):
    # Just testing my mongodb connection
    client = AsyncIOMotorClient("mongodb://localhost:27017/")
    # # previously the above was PyMongo(...)
    db = client["carsDB"]
    collection = db["cars"]

    # Count total documents in the collection
    total_items = await collection.count_documents({})

    # Calculate the number of items to skip to get to the current page
    items_per_page = 5  # Set the number of items per page as needed
    skip = (page - 1) * items_per_page

    # Get the data for the current page using skip and limit
    data = await collection.find().skip(skip).limit(items_per_page).to_list(length=None)

    # Calculate the total number of pages
    total_pages = (total_items + items_per_page - 1) // items_per_page

    # Pass the pagination data to the template
    pagination = {
        "current_page": page,
        "total_pages": total_pages,
        "total_items": total_items,
    }

    return templates.TemplateResponse(
        "showing_cars.html",
        {"request": req, "cars": data, "pagination": pagination},
    )
