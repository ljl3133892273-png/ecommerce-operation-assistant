FROM python:3.12-slim

WORKDIR /app

# 先只拷依赖清单，充分利用层缓存
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv \
    && uv sync --frozen --no-dev

# 再拷业务代码
COPY . .

# compose 的 command 裸调 alembic/uvicorn/celery，必须能从 PATH 找到
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
