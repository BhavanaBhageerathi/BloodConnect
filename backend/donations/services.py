
from accounts.models import DonorProfile
from blood_requests.models import RequestStatusHistory
from verification.models import DonorVerification
from notifications.models import Notification
from django.db import transaction

from inventory.models import BloodUnit
from inventory.services import (
    check_low_stock,
    reserve_blood_units,
    calculate_expiry_date
)
from .models import DonationRequest, DonorInvitation, DonationRecord
from inventory.services import check_low_stock

def create_donation_request(blood_request, shortage):

    donation_request = DonationRequest.objects.create(
        blood_bank=blood_request.blood_bank,
        blood_request=blood_request,
        blood_group=blood_request.blood_group,
        units_required=shortage,
        priority=blood_request.priority,
        district=blood_request.district,
        status='OPEN'
    )

    return donation_request


def create_donor_invitations(donation_request):
    # Find donors with approved verification
    approved_donor_ids = DonorVerification.objects.filter(
        status='APPROVED'
    ).values_list('donor_id', flat=True)

    # Find donors matching the request
    donors = DonorProfile.objects.filter(
        id__in=approved_donor_ids,
        blood_group=donation_request.blood_group,
        district=donation_request.district,
        availability_status=True,
        user__is_active=True
    )

    created_invitations = []

    for donor in donors:
        # Check calculated donation eligibility
        if not donor.is_available_for_donation:
            continue

        invitation, created = DonorInvitation.objects.get_or_create(
            donation_request=donation_request,
            donor=donor
        )

        if created:
            created_invitations.append(invitation)

            Notification.objects.create(
                recipient=donor.user,
                title='New Blood Donation Invitation',
                message=(
                    f'You have received a donation invitation for '
                    f'{donation_request.blood_group} blood '
                    f'in {donation_request.district.name}. '
                    f'Please review and respond to the invitation.'
                ),
                notification_type='DONATION_INVITATION'
            )

    if created_invitations:
        blood_request = donation_request.blood_request

        if blood_request.status == 'ACCEPTED':
            blood_request.status = 'DONORS_NOTIFIED'
            blood_request.save(update_fields=['status'])

            RequestStatusHistory.objects.create(
                blood_request=blood_request,
                status='DONORS_NOTIFIED',
                updated_by=None
            )

    return created_invitations


@transaction.atomic
def complete_donation(invitation, donation_date):

    # Lock the donation request to prevent concurrent updates
    donation_request = DonationRequest.objects.select_for_update().get(
        id=invitation.donation_request_id
    )

    # Check whether the donation request is still active
    if donation_request.status in ['FULFILLED', 'CANCELLED']:
        raise ValueError(
            "This donation request is no longer accepting donations."
        )

    # Lock the invitation
    invitation = DonorInvitation.objects.select_for_update().get(
        id=invitation.id
    )

    # Only health-verified donors can complete donation
    if invitation.status != 'HEALTH_VERIFIED':
        raise ValueError(
            "Donor health must be verified before blood collection."
        )

    # Prevent duplicate donation records
    if DonationRecord.objects.filter(
        donor_invitation=invitation
    ).exists():
        raise ValueError(
            "A donation record already exists for this invitation."
        )

    # Lock donor profile
    donor = DonorProfile.objects.select_for_update().get(
        id=invitation.donor_id
    )

    # Check donation eligibility
    if (
        donor.next_eligible_date
        and donation_date < donor.next_eligible_date
    ):
        raise ValueError(
            "This donor was not eligible to donate on the selected date."
        )

    # Check age eligibility
    if not donor.is_age_eligible:
        raise ValueError(
            "Donor does not meet the age requirements."
        )

    # Check weight eligibility
    if not donor.is_weight_eligible:
        raise ValueError(
            "Donor does not meet the minimum weight requirement."
        )

    # Create donation record
    donation_record = DonationRecord.objects.create(
        donor=donor,
        blood_bank=donation_request.blood_bank,
        donor_invitation=invitation,
        blood_group=donor.blood_group,
        units_donated=1,
        donation_date=donation_date,
        status='COMPLETED'
    )

    # Calculate blood unit expiry date
    expiry_date = calculate_expiry_date(donation_date)

    # Add donated blood to inventory
    blood_unit = BloodUnit.objects.create(
        blood_bank=donation_request.blood_bank,
        donation_record=donation_record,
        blood_group=donor.blood_group,
        collection_date=donation_date,
        expiry_date=expiry_date,
        status='AVAILABLE'
    )

    # Check low inventory
    check_low_stock(donation_request.blood_bank)

    # Automatically reserve the newly donated unit
    # for the original blood request
    if donation_request.blood_request:

        reserved_count = reserve_blood_units(
            donation_request.blood_request
        )

        print(
            f"New donation unit {blood_unit.id} "
            f"reserved: {reserved_count}"
        )


    # Reserve newly donated blood for the original blood request
    if donation_request.blood_request:

        reserve_blood_units(
            donation_request.blood_request
        )

    # Update donor's last donation date
    donor.last_donation_date = donation_date

    donor.save(
        update_fields=['last_donation_date']
    )

    # Mark invitation as completed
    invitation.status = 'COMPLETED'

    invitation.save(
        update_fields=['status']
    )

    # Count completed donations for this request
    completed_count = DonorInvitation.objects.filter(
        donation_request=donation_request,
        status='COMPLETED'
    ).count()

    # Update donation request status
    if completed_count >= donation_request.units_required:
        donation_request.status = 'FULFILLED'
    else:
        donation_request.status = 'IN_PROGRESS'

    donation_request.save(
        update_fields=['status']
    )

    # Notify donor
    Notification.objects.create(
        recipient=donor.user,
        title='Donation Completed',
        message=(
            'Your blood donation has been successfully recorded.'
        ),
        notification_type='DONATION_COMPLETED'
    )

    return donation_record