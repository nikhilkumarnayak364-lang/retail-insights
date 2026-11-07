"""Retail Insights - Currency Conversion Service.

Manages exchange rates, currency conversion calculations, and formatting.
Supported currencies include USD (Base), INR (Rupees), EUR (Euro), and GBP (Pound).
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.schemas.currency import CurrencyInfo, CurrencyRatesResponse, ConvertResponse


class CurrencyService:
    """Service handling multi-currency conversions and live exchange rates."""

    # Default supported rates relative to USD (1.00 base)
    SUPPORTED_CURRENCIES: Dict[str, Dict] = {
        "USD": {
            "name": "US Dollar",
            "symbol": "$",
            "rate_to_usd": 1.0,
            "flag": "🇺🇸",
        },
        "INR": {
            "name": "Indian Rupee",
            "symbol": "₹",
            "rate_to_usd": 86.50,
            "flag": "🇮🇳",
        },
        "EUR": {
            "name": "Euro",
            "symbol": "€",
            "rate_to_usd": 0.92,
            "flag": "🇪🇺",
        },
        "GBP": {
            "name": "British Pound",
            "symbol": "£",
            "rate_to_usd": 0.79,
            "flag": "🇬🇧",
        },
    }

    @classmethod
    def get_supported_rates(cls) -> CurrencyRatesResponse:
        """Returns all configured currencies with current exchange rates."""
        currency_list: List[CurrencyInfo] = [
            CurrencyInfo(
                code=code,
                name=info["name"],
                symbol=info["symbol"],
                rate_to_usd=info["rate_to_usd"],
                flag=info["flag"],
            )
            for code, info in cls.SUPPORTED_CURRENCIES.items()
        ]

        return CurrencyRatesResponse(
            base_currency="USD",
            last_updated=datetime.now(timezone.utc).isoformat(),
            currencies=currency_list,
        )

    @classmethod
    def convert(
        cls,
        amount: float,
        from_curr: str = "USD",
        to_curr: str = "INR",
    ) -> ConvertResponse:
        """Converts an amount from one currency to another using the USD pivot rate."""
        from_code = from_curr.upper()
        to_code = to_curr.upper()

        if from_code not in cls.SUPPORTED_CURRENCIES:
            raise ValueError(f"Unsupported source currency: {from_code}")
        if to_code not in cls.SUPPORTED_CURRENCIES:
            raise ValueError(f"Unsupported target currency: {to_code}")

        # Convert from source to USD base
        rate_from = cls.SUPPORTED_CURRENCIES[from_code]["rate_to_usd"]
        rate_to = cls.SUPPORTED_CURRENCIES[to_code]["rate_to_usd"]

        amount_in_usd = amount / rate_from
        converted = amount_in_usd * rate_to
        effective_rate = rate_to / rate_from

        symbol = cls.SUPPORTED_CURRENCIES[to_code]["symbol"]
        formatted = f"{symbol}{converted:,.2f}"

        return ConvertResponse(
            original_amount=round(amount, 2),
            from_currency=from_code,
            to_currency=to_code,
            exchange_rate=round(effective_rate, 4),
            converted_amount=round(converted, 2),
            formatted_result=formatted,
        )


currency_service = CurrencyService()

