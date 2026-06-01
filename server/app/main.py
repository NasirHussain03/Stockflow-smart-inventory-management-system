from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.api import api_router
from app.services.order_service import InsufficientStockException
from sqlalchemy.exc import IntegrityError

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware to allow the frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handler for Insufficient Stock
@app.exception_handler(InsufficientStockException)
def insufficient_stock_exception_handler(request: Request, exc: InsufficientStockException):
    return JSONResponse(
        status_code=400,
        content={"message": "Insufficient stock"}
    )

# Custom Exception Handler for DB Integrity Issues (unique SKU/email etc.)
@app.exception_handler(IntegrityError)
def integrity_error_handler(request: Request, exc: IntegrityError):
    err_msg = str(exc.orig)
    detail = "Database integrity constraint violation."
    if "sku" in err_msg.lower():
        detail = "Product SKU must be unique."
    elif "email" in err_msg.lower():
        detail = "Customer email must be unique."
    
    return JSONResponse(
        status_code=400,
        content={"detail": detail}
    )

# Include the API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API.",
        "docs_url": "/docs"
    }
