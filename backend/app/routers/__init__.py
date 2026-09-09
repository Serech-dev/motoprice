from app.routers.suppliers import router as suppliers_router
from app.routers.products import router as products_router
from app.routers.price_updates import router as price_updates_router
from app.routers.settings import router as settings_router

__all__ = ["suppliers_router", "products_router", "price_updates_router", "settings_router"]

