
import os
import json
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")

redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True
)


def test_redis_connection():
    try:
        return redis_client.ping()
    except redis.RedisError:
        return False


def set_cache(key, value, expiry=300):
    try:
        redis_client.setex(
            key,
            expiry,
            json.dumps(value)
        )
        return True
    except redis.RedisError:
        return False


def get_cache(key):
    try:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    except (redis.RedisError, json.JSONDecodeError):
        return None


def delete_cache(key):
    try:
        redis_client.delete(key)
        return True
    except redis.RedisError:
        return False
