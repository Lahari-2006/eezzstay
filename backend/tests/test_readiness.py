import pytest
from datetime import datetime, timedelta
from app.services.readiness_score import calculate_readiness
from app.models.journey import AlertSeverity

def test_readiness_initial_unstarted_journey():
    today = datetime.utcnow()
    move_in_str = (today + timedelta(days=14)).strftime("%Y-%m-%d")
    
    breakdown, milestones, alerts = calculate_readiness(
        target_university="KL University Hyderabad",
        target_city="Hyderabad",
        move_in_date_str=move_in_str,
        booking_data={"status": "not_started"},
        logistics_data={"status": "not_started"},
        essentials_data={"status": "not_started"},
    )
    
    # Accommodation: 0, Logistics: 0, Essentials: 0, Timeline: 20 -> Total: 20
    assert breakdown.accommodation_score == 0.0
    assert breakdown.logistics_score == 0.0
    assert breakdown.essentials_score == 0.0
    assert breakdown.total_score <= 25
    assert breakdown.status_tier == "Critical Risk"
    assert len(milestones) == 7

def test_readiness_fully_confirmed_journey():
    today = datetime.utcnow()
    move_in_str = (today + timedelta(days=7)).strftime("%Y-%m-%d")
    
    breakdown, milestones, alerts = calculate_readiness(
        target_university="KL University Hyderabad",
        target_city="Hyderabad",
        move_in_date_str=move_in_str,
        booking_data={
            "status": "confirmed",
            "hostel_verified": True,
            "hostel_name": "Stanza Living Kyoto House",
            "confirmed_at": today.strftime("%Y-%m-%d")
        },
        logistics_data={
            "status": "delivered",
            "tracking_number": "EZL-HYD-12345",
            "estimated_delivery_date": (today + timedelta(days=5)).strftime("%Y-%m-%d")
        },
        essentials_data={
            "status": "delivered_to_room",
            "order_reference": "EZK-2026-9999"
        },
    )
    
    # Accommodation: 35, Logistics: 25, Essentials: 20, Timeline: 20 -> Total: 100
    assert breakdown.accommodation_score == 35.0
    assert breakdown.logistics_score == 25.0
    assert breakdown.essentials_score == 20.0
    assert breakdown.timeline_risk_score == 20.0
    assert breakdown.total_score == 100
    assert breakdown.status_tier == "On Track"

def test_readiness_urgent_cliff_missing_booking():
    today = datetime.utcnow()
    # Move-in is in 2 days, but no hostel or logistics!
    move_in_str = (today + timedelta(days=2)).strftime("%Y-%m-%d")
    
    breakdown, milestones, alerts = calculate_readiness(
        target_university="IIT Hyderabad",
        target_city="Hyderabad",
        move_in_date_str=move_in_str,
        booking_data={"status": "not_started"},
        logistics_data={"status": "not_started"},
        essentials_data={"status": "not_started"},
    )
    
    assert breakdown.total_score < 10
    assert breakdown.status_tier == "Critical Risk"
    # Should have a critical alert
    has_critical = any(a.severity == AlertSeverity.CRITICAL for a in alerts)
    assert has_critical is True
