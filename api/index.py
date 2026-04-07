from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.routes import databases, query

app = FastAPI(title="Trae API", docs_url="/api/docs", openapi_url="/api/openapi.json")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler to match frontend expectation {"error": "..."}
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

# Include routers
app.include_router(databases.router, prefix="/api/databases", tags=["databases"])
app.include_router(query.router, prefix="/api/query", tags=["query"])

@app.get("/api/health")
def health_check():
    return {"success": True, "message": "ok"}
