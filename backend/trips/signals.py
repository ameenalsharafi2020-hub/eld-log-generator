"""
Signals for the trips app
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Trip, EldLog
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Trip)
def log_trip_creation(sender, instance, created, **kwargs):
    """Log when a new trip is created"""
    if created:
        logger.info(f'New trip created: {instance.trip_id} - {instance.current_location} to {instance.dropoff_location}')

@receiver(post_save, sender=EldLog)
def log_eld_creation(sender, instance, created, **kwargs):
    """Log when ELD logs are generated"""
    if created:
        logger.info(f'ELD log created for Trip {instance.trip.trip_id}, Day {instance.day_number}')