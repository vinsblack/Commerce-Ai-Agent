from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    """
    Schema per il token di accesso.
    """
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    """
    Schema per il payload del token JWT.
    """
    sub: Optional[str] = None
    exp: Optional[int] = None
