import os

from pydantic import BaseModel, computed_field

from .jwt import JWT

ADMIN_ROLE = "admin-manager"
JWT_USER_ID_CLAIM = os.getenv(
    "JWT_USER_ID_CLAIM", "preferred_username"
)  # The claim in the JWT token that stores the user ID (defaults to `preferred_username` from Keycloak)
JWT_USER_ROLES_CLAIM = (
    "X-Forwarded-Roles"  # The claim in the JWT token that stores the user roles
)


class UserInfo(BaseModel):
    user_id: str
    roles: list[str] = []

    @computed_field
    def is_admin(self) -> bool:
        return ADMIN_ROLE in self.roles

    @classmethod
    def from_jwt_data(cls, jwt_data: dict) -> "UserInfo":
        user_id = jwt_data.get(JWT_USER_ID_CLAIM)
        roles = jwt_data.get(JWT_USER_ROLES_CLAIM, [])
        return cls(user_id=user_id, roles=roles)

    @classmethod
    def from_request(cls, request) -> "UserInfo":
        jwt = JWT(request.cookies)
        return cls.from_jwt_data(jwt.data)
