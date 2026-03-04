from fastapi import APIRouter
from .tables import router as tables_router
from .auth import router as auth_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(tables_router, prefix="/tables", tags=["tables"])
