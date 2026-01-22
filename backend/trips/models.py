from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Trip(models.Model):
    """Model for storing trip information"""
    
    TRIP_TYPE_CHOICES = [
        ('interstate', 'Interstate Commerce'),
        ('intrastate', 'Intrastate Commerce'),
    ]
    
    # Basic trip info
    trip_id = models.CharField(max_length=50, unique=True)
    trip_type = models.CharField(max_length=20, choices=TRIP_TYPE_CHOICES, default='interstate')
    state = models.CharField(max_length=2, blank=True, null=True)
    
    # Locations
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    
    # HOS Status
    current_cycle_used = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        default=0,
        help_text="Hours already used in current 8-day cycle (0-70)"
    )
    
    # Vehicle info (from PDF page 3)
    cmv_weight = models.IntegerField(
        default=10001,
        help_text="CMV weight in pounds (must be ≥10,001 lbs or placarded hazmat)"
    )
    requires_cdl = models.BooleanField(default=True)
    
    # Timing assumptions (from PDF assumptions)
    adverse_conditions = models.BooleanField(default=False)
    includes_hazmat = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Trip {self.trip_id}: {self.current_location} → {self.dropoff_location}"

class EldLog(models.Model):
    """Model for storing generated ELD logs"""
    
    STATUS_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper_berth', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty', 'On Duty (Not Driving)'),
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='eld_logs')
    day_number = models.IntegerField()
    date = models.DateField()
    
    # Time calculations (in hours)
    driving_hours = models.DecimalField(max_digits=4, decimal_places=2)
    on_duty_hours = models.DecimalField(max_digits=4, decimal_places=2)
    off_duty_hours = models.DecimalField(max_digits=4, decimal_places=2)
    sleeper_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    # HOS Compliance
    cycle_7day_total = models.DecimalField(max_digits=5, decimal_places=2)
    cycle_8day_total = models.DecimalField(max_digits=5, decimal_places=2)
    requires_restart = models.BooleanField(default=False)
    
    # ELD Grid Data (as JSON)
    activities = models.JSONField(default=list)
    remarks = models.JSONField(default=list)
    
    class Meta:
        ordering = ['trip', 'day_number']
        unique_together = ['trip', 'day_number']
    
    def __str__(self):
        return f"Day {self.day_number}: {self.driving_hours}h driving"