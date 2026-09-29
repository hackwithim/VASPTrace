from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_user
from app.models import User
from app.schemas import ApiResponse, LoginRequest, TokenResponse, UserOut

router = APIRouter()


@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_req.email.strip().lower()).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or unauthorized personnel account",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Investigator account has been suspended or deactivated",
        )

    token = create_access_token(subject=user.id, role=user.role)
    user_data = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "badge_number": user.badge_number,
        "role": user.role,
    }

    return ApiResponse(
        success=True,
        data=TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user_data
        ),
        meta={"message": "Authentication successful. Access granted."}
    )


@router.get("/me", response_model=ApiResponse[UserOut])
def get_current_investigator_profile(current_user: User = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        data=UserOut.model_validate(current_user)
    )
