from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    agent_platform,
    agent_runs,
    auth,
    health,
    model_settings,
    products,
    promotion_links,
    stores,
    users,
    workspace,
)
from app.core.config import API_DIR, get_settings

settings = get_settings()

# 默认 JSONResponse 的 content-type 不带 charset，Windows PowerShell 5.1 这类严格按 RFC 2616
# 缺省 ISO-8859-1 解码的客户端，会把站名、用户名等 UTF-8 中文解成 "è¯¾ç¨..." 乱码。
class UTF8JSONResponse(JSONResponse):
    media_type = "application/json; charset=utf-8"


app = FastAPI(title=settings.app_name + ' — 第03篇业务系统', default_response_class=UTF8JSONResponse)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins,
                   allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(health.router)
for route in [auth, products, promotion_links, stores, users, workspace,model_settings,agent_runs,agent_platform]:
    app.include_router(route.router, prefix='/api/v1')
uploads_dir = API_DIR / 'uploads'
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=uploads_dir), name='uploads')
