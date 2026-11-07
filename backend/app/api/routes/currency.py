"""Currency conversion and exchange rates API endpoints."""

from fastapi import APIRouter, HTTPException, status
from app.schemas.currency import CurrencyRatesResponse, ConvertRequest, ConvertResponse
from app.services.currency_service import currency_service

router = APIRouter(prefix="/currency", tags=["Currency"])


@router.get("/rates", response_model=CurrencyRatesResponse)
async def get_currency_rates():
    """Retrieve all supported currencies, symbols, and exchange rates."""
    return currency_service.get_supported_rates()


@router.post("/convert", response_model=ConvertResponse)
async def convert_currency(payload: ConvertRequest):
    """Convert an amount from one currency to another."""
    try:
        return currency_service.convert(
            amount=payload.amount,
            from_curr=payload.from_currency,
            to_curr=payload.to_currency,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

