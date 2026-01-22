from rest_framework import serializers
from .models import Trip, EldLog
import re

class LocationField(serializers.CharField):
    """Custom field for location validation"""
    
    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        # Basic validation for location format
        if not re.match(r'^[A-Za-z\s,.-]+$', value):
            raise serializers.ValidationError("Invalid location format")
        return value

class TripSerializer(serializers.ModelSerializer):
    """Serializer for Trip model with validation"""
    
    current_location = LocationField(max_length=255)
    pickup_location = LocationField(max_length=255)
    dropoff_location = LocationField(max_length=255)
    
    class Meta:
        model = Trip
        fields = [
            'trip_id', 'trip_type', 'state',
            'current_location', 'pickup_location', 'dropoff_location',
            'current_cycle_used', 'cmv_weight', 'requires_cdl',
            'adverse_conditions', 'includes_hazmat'
        ]
        read_only_fields = ['trip_id']
    
    def validate_current_cycle_used(self, value):
        """Validate cycle hours (0-70)"""
        if value < 0 or value > 70:
            raise serializers.ValidationError(
                "Current cycle used must be between 0 and 70 hours"
            )
        return value
    
    def validate_cmv_weight(self, value):
        """Validate CMV weight according to FMCSA rules"""
        if value < 10001:
            raise serializers.ValidationError(
                "CMV must weigh at least 10,001 lbs or transport placarded hazmat"
            )
        return value
    
    def create(self, validated_data):
        """Generate unique trip ID"""
        import uuid
        validated_data['trip_id'] = f"TRIP-{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)

class EldLogSerializer(serializers.ModelSerializer):
    """Serializer for ELD logs"""
    
    class Meta:
        model = EldLog
        fields = '__all__'
        read_only_fields = ['trip', 'day_number', 'date']