from pydantic import BaseModel, computed_field

ADMIN_ROLE = "admin-manager"
JWT_USER_NAME_CLAIM = "preferred_username"  # The claim in the JWT token that stores the user ID or user name
JWT_USER_ROLES_CLAIM = (
    "X-Forwarded-Roles"  # The claim in the JWT token that stores the user roles
)


class UserInfo(BaseModel):
    user_name: str
    roles: list[str] = []

    @computed_field
    def is_admin(self) -> bool:
        return ADMIN_ROLE in self.roles

    @classmethod
    def from_jwt_data(cls, jwt_data: dict) -> "UserInfo":
        user_name = jwt_data.get(JWT_USER_NAME_CLAIM)
        roles = jwt_data.get(JWT_USER_ROLES_CLAIM, [])
        return cls(user_name=user_name, roles=roles)
