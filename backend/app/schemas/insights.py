"""Pydantic schemas for automated business insights and prescriptive recommendations."""

from typing import List, Optional
from pydantic import BaseModel, Field


class InsightItem(BaseModel):
    id: str
    category: str  # "pricing", "inventory", "customer", "operations", "checkout"
    severity: str  # "critical", "high", "medium", "opportunity"
    title: str
    summary: str
    impact_metric: str
    recommendation: str
    estimated_financial_gain: float
    confidence_score: float = Field(ge=0.0, le=1.0)


class HealthScoreCategory(BaseModel):
    name: str
    score: int = Field(ge=0, le=25)
    max_score: int = 25
    benchmark: str
    status: str  # "excellent", "healthy", "warning", "critical"


class BusinessHealthScore(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    grade: str  # "A+", "A", "B", "C", "Needs Attention"
    status_summary: str
    breakdown: List[HealthScoreCategory]
    key_strengths: List[str]
    urgent_priorities: List[str]


class InsightsResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    retail_type: str
    health_score: BusinessHealthScore
    total_insights: int
    critical_count: int
    opportunity_count: int
    total_potential_gain: float
    insights: List[InsightItem]

