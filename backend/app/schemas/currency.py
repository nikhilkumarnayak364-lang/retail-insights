"""Pydantic schemas for currency conversion and exchange rates."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CurrencyInfo(BaseModel):
    """Information regarding a supported currency."""
    code: str = Field(..., description="ISO 4217 Currency Code (e.g., USD, INR)")
    name: str = Field(..., description="Full descriptive name of the currency")
    symbol: str = Field(..., description="Currency symbol (e.g., $, ₹, €, £)")
    rate_to_usd: float = Field(..., description="Exchange rate relative to 1 USD base")
    flag: str = Field(..., description="Country flag emoji or indicator")


class CurrencyRatesResponse(BaseModel):
    """API response containing all active currency exchange rates."""
    base_currency: str = "USD"
    last_updated: str
    currencies: List[CurrencyInfo]


class ConvertRequest(BaseModel):
    """Request payload for converting an amount between currencies."""
    amount: float = Field(..., description="Amount to convert")
    from_currency: str = Field(default="USD", description="Source currency code")
    to_currency: str = Field(default="INR", description="Target currency code")


class ConvertResponse(BaseModel):
    """API response for a currency conversion calculation."""
    original_amount: float
    from_currency: str
    to_currency: str
    exchange_rate: float
    converted_amount: float
    formatted_result: str

