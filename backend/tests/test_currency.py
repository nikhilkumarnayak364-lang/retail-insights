"""Unit and integration tests for currency conversion and exchange rates."""

import pytest
from starlette.testclient import TestClient
from app.main import app
from app.services.currency_service import currency_service


def test_currency_service_rates():
    """Verify supported currencies include USD, INR, EUR, and GBP."""
    rates = currency_service.get_supported_rates()
    assert rates.base_currency == "USD"
    codes = [c.code for c in rates.currencies]
    assert "USD" in codes
    assert "INR" in codes
    assert "EUR" in codes
    assert "GBP" in codes

    inr = next(c for c in rates.currencies if c.code == "INR")
    assert inr.symbol == "₹"
    assert inr.rate_to_usd > 1.0


def test_currency_service_convert():
    """Verify currency conversion calculation logic."""
    # $100 USD to INR
    res_inr = currency_service.convert(100.0, "USD", "INR")
    assert res_inr.original_amount == 100.0
    assert res_inr.from_currency == "USD"
    assert res_inr.to_currency == "INR"
    assert res_inr.converted_amount == 8650.0
    assert "₹" in res_inr.formatted_result

    # INR to USD
    res_usd = currency_service.convert(8650.0, "INR", "USD")
    assert round(res_usd.converted_amount, 1) == 100.0
    assert "$" in res_usd.formatted_result


def test_currency_endpoints(client: TestClient):
    """Test /api/currency/rates and /api/currency/convert endpoints."""
    # GET /rates
    res = client.get("/api/currency/rates")
    assert res.status_code == 200
    data = res.json()
    assert data["base_currency"] == "USD"
    assert len(data["currencies"]) >= 4

    # POST /convert (USD to INR)
    convert_res = client.post(
        "/api/currency/convert",
        json={"amount": 250.0, "from_currency": "USD", "to_currency": "INR"},
    )
    assert convert_res.status_code == 200
    c_data = convert_res.json()
    assert c_data["to_currency"] == "INR"
    assert c_data["converted_amount"] == round(250.0 * 86.50, 2)
    assert "₹" in c_data["formatted_result"]

    # Invalid currency error handling
    invalid_res = client.post(
        "/api/currency/convert",
        json={"amount": 50.0, "from_currency": "XYZ", "to_currency": "INR"},
    )
    assert invalid_res.status_code == 400

