from datetime import datetime, date
from typing import List, Tuple, Optional
from app.models.journey import (
    ReadinessBreakdown,
    Milestone,
    JourneyAlert,
    AlertSeverity,
)

def calculate_readiness(
    target_university: str,
    target_city: str,
    move_in_date_str: str,
    booking_data: Optional[dict] = None,
    logistics_data: Optional[dict] = None,
    essentials_data: Optional[dict] = None,
) -> Tuple[ReadinessBreakdown, List[Milestone], List[JourneyAlert]]:
    """
    Computes a deterministic, explainable AI Readiness Score (0-100)
    across Accommodation (35%), Logistics (25%), Essentials (20%), and Timeline Risk (20%).
    Generates tailored actionable alerts and milestone status objects.
    """
    # 1. Parse move-in date and calculate days remaining
    today = date.today()
    try:
        if move_in_date_str:
            move_in_date = datetime.strptime(move_in_date_str[:10], "%Y-%m-%d").date()
            days_until_move_in = (move_in_date - today).days
        else:
            days_until_move_in = 14
    except Exception:
        days_until_move_in = 14

    alerts: List[JourneyAlert] = []
    milestones: List[Milestone] = []

    # ----------------------------------------------------
    # Pillar 1: Accommodation (Max 35 points)
    # ----------------------------------------------------
    accommodation_score = 0.0
    booking_status = (booking_data or {}).get("status", "not_started")
    is_hostel_verified = (booking_data or {}).get("hostel_verified", False)
    hostel_name = (booking_data or {}).get("hostel_name", "your hostel")

    if booking_status == "confirmed":
        if is_hostel_verified:
            accommodation_score = 35.0
        else:
            accommodation_score = 26.0
            alerts.append(
                JourneyAlert(
                    id="alert-hostel-unverified",
                    title="Unverified Property Warning",
                    message=f"{hostel_name} is currently undergoing platform safety verification. Ensure you verify lease terms prior to move-in.",
                    severity=AlertSeverity.WARNING,
                    pillar="accommodation",
                    action_text="View Verification Details",
                    action_link="/app/hostels",
                )
            )
    elif booking_status == "pending":
        accommodation_score = 15.0
        alerts.append(
            JourneyAlert(
                id="alert-booking-pending",
                title="Booking Request Pending",
                message=f"Waiting for {hostel_name} management to accept your room request.",
                severity=AlertSeverity.INFO,
                pillar="accommodation",
                action_text="Check Booking Status",
                action_link="/app/dashboard",
            )
        )
    else: # not_started or rejected
        accommodation_score = 0.0
        if days_until_move_in <= 7:
            alerts.append(
                JourneyAlert(
                    id="alert-no-hostel-critical",
                    title="Urgent: No Accommodation Booked",
                    message=f"Your move-in is in {max(0, days_until_move_in)} days! Book a verified room near {target_university} immediately to avoid last-minute surge pricing.",
                    severity=AlertSeverity.CRITICAL,
                    pillar="accommodation",
                    action_text="Explore Verified Hostels",
                    action_link="/app/hostels",
                )
            )
        else:
            alerts.append(
                JourneyAlert(
                    id="alert-no-hostel-info",
                    title="Find Verified Accommodation",
                    message=f"Explore safe, verified PGs and hostels near {target_university} with verified student reviews.",
                    severity=AlertSeverity.INFO,
                    pillar="accommodation",
                    action_text="Browse Hostels",
                    action_link="/app/hostels",
                )
            )

    # Milestones for Accommodation
    milestones.append(
        Milestone(
            key="hostel_verified",
            label="Verified Hostel Selection",
            description=f"Select a 100% physically inspected & police-verified PG near {target_university}.",
            pillar="accommodation",
            status="completed" if is_hostel_verified else ("in_progress" if booking_status != "not_started" else "pending"),
            completed_at=(booking_data or {}).get("confirmed_at") if is_hostel_verified else None,
            detail=hostel_name if booking_status != "not_started" else None,
        )
    )
    milestones.append(
        Milestone(
            key="booking_confirmed",
            label="Room Booking Confirmed",
            description="Room reservation confirmed with security deposit and move-in date locked.",
            pillar="accommodation",
            status="completed" if booking_status == "confirmed" else ("in_progress" if booking_status == "pending" else "pending"),
            completed_at=(booking_data or {}).get("confirmed_at") if booking_status == "confirmed" else None,
            detail=f"Status: {booking_status.capitalize()}",
        )
    )

    # ----------------------------------------------------
    # Pillar 2: Logistics (Max 25 points)
    # ----------------------------------------------------
    logistics_score = 0.0
    logistics_status = (logistics_data or {}).get("status", "not_started")
    logistics_eta = (logistics_data or {}).get("estimated_delivery_date")
    tracking_number = (logistics_data or {}).get("tracking_number")

    if logistics_status == "delivered":
        logistics_score = 25.0
    elif logistics_status in ("in_transit", "out_for_delivery"):
        logistics_score = 22.0
    elif logistics_status in ("picked_up", "pickup_scheduled"):
        logistics_score = 18.0
    elif logistics_status == "booked":
        logistics_score = 14.0
    elif logistics_status == "delayed":
        logistics_score = 7.0
        alerts.append(
            JourneyAlert(
                id="alert-logistics-delayed",
                title="Luggage Transit Delay Alert",
                message=f"Consignment {tracking_number or ''} is facing highway transit delay. ETA has been revised.",
                severity=AlertSeverity.WARNING,
                pillar="logistics",
                action_text="Track Luggage Live",
                action_link="/app/logistics",
            )
        )
    else: # not_started
        logistics_score = 0.0
        if booking_status == "confirmed" and days_until_move_in <= 10:
            alerts.append(
                JourneyAlert(
                    id="alert-logistics-needed",
                    title="Schedule Inter-City Luggage Transport",
                    message=f"Avoid hauling heavy luggage on trains or flights. Book doorstep pickup to {hostel_name}.",
                    severity=AlertSeverity.WARNING if days_until_move_in <= 5 else AlertSeverity.INFO,
                    pillar="logistics",
                    action_text="Book Luggage Transport",
                    action_link="/app/logistics",
                )
            )

    # Check ETA vs Move-in Date
    if logistics_eta and move_in_date_str:
        try:
            eta_date = datetime.strptime(logistics_eta[:10], "%Y-%m-%d").date()
            move_in_d = datetime.strptime(move_in_date_str[:10], "%Y-%m-%d").date()
            if eta_date > move_in_d and logistics_status != "delivered":
                logistics_score = max(5.0, logistics_score - 8.0)
                alerts.append(
                    JourneyAlert(
                        id="alert-logistics-eta-conflict",
                        title="Luggage Arrives After Move-in!",
                        message=f"Your luggage delivery ETA ({logistics_eta[:10]}) is after your move-in date ({move_in_date_str[:10]}). Consider upgrading to Express Priority.",
                        severity=AlertSeverity.CRITICAL,
                        pillar="logistics",
                        action_text="Upgrade to Express Transit",
                        action_link="/app/logistics",
                    )
                )
        except Exception:
            pass

    # Milestones for Logistics
    milestones.append(
        Milestone(
            key="logistics_booked",
            label="Luggage Logistics Scheduled",
            description="Doorstep pickup and insured inter-city freight arranged.",
            pillar="logistics",
            status="completed" if logistics_status in ("booked", "pickup_scheduled", "picked_up", "in_transit", "out_for_delivery", "delivered") else "pending",
            completed_at=(logistics_data or {}).get("created_at") if logistics_status != "not_started" else None,
            detail=f"Tracking: {tracking_number}" if tracking_number else None,
        )
    )
    milestones.append(
        Milestone(
            key="luggage_dispatched",
            label="Luggage in Transit",
            description="Boxes picked up from home and moving through secure logistics hubs.",
            pillar="logistics",
            status="completed" if logistics_status in ("in_transit", "out_for_delivery", "delivered") else ("in_progress" if logistics_status in ("booked", "pickup_scheduled", "picked_up") else "pending"),
            completed_at=None,
            detail=f"ETA: {logistics_eta[:10]}" if logistics_eta else None,
        )
    )

    # ----------------------------------------------------
    # Pillar 3: Move-In Essentials (Max 20 points)
    # ----------------------------------------------------
    essentials_score = 0.0
    essentials_status = (essentials_data or {}).get("status", "not_started")
    essentials_order_ref = (essentials_data or {}).get("order_reference")

    if essentials_status == "delivered_to_room":
        essentials_score = 20.0
    elif essentials_status in ("dispatched", "packed"):
        essentials_score = 16.0
    elif essentials_status == "confirmed":
        essentials_score = 12.0
    else: # not_started
        essentials_score = 0.0
        if days_until_move_in <= 10:
            alerts.append(
                JourneyAlert(
                    id="alert-essentials-suggested",
                    title="Pre-Order Move-in Essentials Kit",
                    message="Save hours of shopping on Day 1. Pre-order bedding, study lamp, and bath essentials to be delivered directly to your room.",
                    severity=AlertSeverity.INFO,
                    pillar="essentials",
                    action_text="Order Dorm Essentials",
                    action_link="/app/essentials",
                )
            )

    # Milestones for Essentials
    milestones.append(
        Milestone(
            key="essentials_ordered",
            label="Move-In Essentials Kit Ordered",
            description="Bedding, study lamp, laundry gear, and room essentials kit reserved.",
            pillar="essentials",
            status="completed" if essentials_status in ("confirmed", "packed", "dispatched", "delivered_to_room") else "pending",
            completed_at=(essentials_data or {}).get("created_at") if essentials_status != "not_started" else None,
            detail=f"Ref: {essentials_order_ref}" if essentials_order_ref else None,
        )
    )
    milestones.append(
        Milestone(
            key="essentials_delivered",
            label="Essentials Placed in Room",
            description="Curated kit sanitized and placed in the student's assigned room before arrival.",
            pillar="essentials",
            status="completed" if essentials_status == "delivered_to_room" else ("in_progress" if essentials_status in ("packed", "dispatched") else "pending"),
            completed_at=None,
            detail="Pre-arrival room placement",
        )
    )

    # ----------------------------------------------------
    # Pillar 4: Timeline Risk & Proximity Buffer (Max 20 points)
    # ----------------------------------------------------
    timeline_score = 20.0
    all_three_ordered = (
        booking_status == "confirmed"
        and logistics_status != "not_started"
        and essentials_status != "not_started"
    )

    if all_three_ordered:
        timeline_score = 20.0
    else:
        # Penalties based on urgency
        if days_until_move_in <= 3:
            penalty = 0.0
            if booking_status != "confirmed":
                penalty += 14.0
            if logistics_status == "not_started":
                penalty += 6.0
            if essentials_status == "not_started":
                penalty += 4.0
            timeline_score = max(0.0, 20.0 - penalty)
        elif days_until_move_in <= 7:
            penalty = 0.0
            if booking_status != "confirmed":
                penalty += 10.0
            if logistics_status == "not_started":
                penalty += 5.0
            if essentials_status == "not_started":
                penalty += 3.0
            timeline_score = max(0.0, 20.0 - penalty)
        elif days_until_move_in <= 14:
            penalty = 0.0
            if booking_status != "confirmed":
                penalty += 5.0
            if logistics_status == "not_started":
                penalty += 3.0
            timeline_score = max(0.0, 20.0 - penalty)
        else:
            # Plenty of time
            timeline_score = 20.0

    # Final readiness milestone
    total_raw_score = accommodation_score + logistics_score + essentials_score + timeline_score
    total_score = int(round(min(100.0, max(0.0, total_raw_score))))

    milestones.append(
        Milestone(
            key="ready_for_move_in",
            label="Zero-Friction Relocation Ready",
            description="Room keys verified, luggage delivered, and room fully stocked for Day 1.",
            pillar="timeline",
            status="completed" if total_score >= 90 else ("in_progress" if total_score >= 60 else "pending"),
            completed_at=None,
            detail=f"Score: {total_score}/100",
        )
    )

    # Determine status tier & headline
    if total_score >= 80:
        status_tier = "On Track"
        headline = "All relocation systems green! Ready for stress-free arrival."
        if not any(a.severity == AlertSeverity.CRITICAL for a in alerts):
            alerts.insert(
                0,
                JourneyAlert(
                    id="alert-on-track-success",
                    title="Relocation On Track",
                    message=f"Awesome job! Your relocation setup to {target_city} ({target_university}) is 100% on schedule.",
                    severity=AlertSeverity.SUCCESS,
                    pillar="timeline",
                    action_text="View Summary",
                    action_link="/app/dashboard",
                ),
            )
    elif total_score >= 50:
        status_tier = "Needs Attention"
        headline = f"Action required: Complete remaining relocation tasks before move-in ({max(0, days_until_move_in)} days left)."
    else:
        status_tier = "Critical Risk"
        headline = f"Critical Risk: Missing key relocation pillars with only {max(0, days_until_move_in)} days remaining."

    breakdown = ReadinessBreakdown(
        accommodation_score=round(accommodation_score, 1),
        logistics_score=round(logistics_score, 1),
        essentials_score=round(essentials_score, 1),
        timeline_risk_score=round(timeline_score, 1),
        total_score=total_score,
        status_tier=status_tier,
        days_until_move_in=max(0, days_until_move_in),
        summary_headline=headline,
    )

    return breakdown, milestones, alerts
