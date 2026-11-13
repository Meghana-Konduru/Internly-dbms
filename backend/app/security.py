
# from datetime import datetime, timedelta, timezone

# import jwt
# from pwdlib import PasswordHash

# from app.config import settings


# password_hash = PasswordHash.recommended()


# def hash_password(password: str) -> str:
#     """Convert a plain password into a secure Argon2 hash."""
#     return password_hash.hash(password)


# def verify_password(password: str, hashed_password: str) -> bool:
#     """Verify a password against its stored hash."""
#     return password_hash.verify(password, hashed_password)


# def create_access_token(user_id: int, role: str) -> str:
#     """Generate a signed JWT access token."""

#     expires_at = datetime.now(timezone.utc) + timedelta(
#         minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
#     )

#     payload = {
#         "sub": str(user_id),
#         "role": role,
#         "exp": expires_at
#     }

#     return jwt.encode(
#         payload,
#         settings.JWT_SECRET_KEY,
#         algorithm=settings.JWT_ALGORITHM
#     )

from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings


password_hash = PasswordHash.recommended()

bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int, role: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expires_at
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    """Decode and validate the JWT access token."""

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id = payload.get("sub")
        role = payload.get("role")

        if not user_id or role not in ("student", "recruiter"):
            raise InvalidTokenError("Invalid token payload")

        return {
            "user_id": int(user_id),
            "role": role
        }

    except (InvalidTokenError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"}
        )


def get_current_student(
    current_user: dict = Depends(get_current_user)
):
    """Allow access only to authenticated students."""

    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access only"
        )

    return current_user
