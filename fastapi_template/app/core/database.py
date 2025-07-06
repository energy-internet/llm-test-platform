# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import redis
from app.core.config import settings

# 根据数据库URI类型调整连接参数
if settings.SQLALCHEMY_DATABASE_URI and settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    # SQLite数据库连接参数
    engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URI,
        connect_args={"check_same_thread": False},
        echo=True
    )
else:
    # 其他数据库(如PostgreSQL)不需要check_same_thread参数
    engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URI,
        echo=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Redis connection
try:
    redis_client = redis.from_url(settings.REDIS_URL)
except:
    # 如果Redis无法连接，使用一个空的模拟对象
    print("警告: Redis无法连接，某些功能可能不可用")
    class MockRedis:
        def get(self, *args, **kwargs): return None
        def set(self, *args, **kwargs): pass
        def ping(self, *args, **kwargs): return True
    redis_client = MockRedis()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis():
    return redis_client