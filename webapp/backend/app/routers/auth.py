from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Creates a new user with the provided email and password. The password is
    automatically hashed before storage for security.

    Args:
        user_in: User registration data containing email and password
        db: Database session dependency

    Returns:
        UserOut: The newly created user object (without password)

    Raises:
        HTTPException: 400 Bad Request if email is already registered
    """
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=user_in.email, hashed_password=hash_password(user_in.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate a user and generate an access token.

    Validates the provided email and password credentials. If authentication
    is successful, generates and returns a JWT access token for API access.

    Args:
        form_data: OAuth2 form containing username (email) and password
        db: Database session dependency

    Returns:
        Token: Dictionary containing the access token and token type

    Raises:
        HTTPException: 401 Unauthorized if email or password is incorrect
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.

    Retrieves the profile information for the currently authenticated user
    based on the JWT access token provided in the request.

    Args:
        current_user: The authenticated user object injected by the dependency

    Returns:
        UserOut: The current user's profile information (without password)

    Raises:
        HTTPException: 401 Unauthorized if token is invalid or missing
    """
    return current_user
