from django.contrib import admin
from .models import Trip, EldLog

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('trip_id', 'current_location', 'dropoff_location', 'current_cycle_used', 'created_at')
    list_filter = ('trip_type', 'requires_cdl', 'adverse_conditions')
    search_fields = ('trip_id', 'current_location', 'dropoff_location')
    readonly_fields = ('trip_id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Trip Information', {
            'fields': ('trip_id', 'trip_type', 'state')
        }),
        ('Locations', {
            'fields': ('current_location', 'pickup_location', 'dropoff_location')
        }),
        ('HOS Status', {
            'fields': ('current_cycle_used', 'cmv_weight', 'requires_cdl')
        }),
        ('Conditions', {
            'fields': ('adverse_conditions', 'includes_hazmat')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(EldLog)
class EldLogAdmin(admin.ModelAdmin):
    list_display = ('get_trip_id', 'day_number', 'date', 'driving_hours', 'on_duty_hours', 'requires_restart')
    list_filter = ('requires_restart', 'date')
    search_fields = ('trip__trip_id', 'remarks')
    readonly_fields = ('trip', 'day_number', 'date', 'driving_hours', 'on_duty_hours', 
                       'off_duty_hours', 'sleeper_hours', 'cycle_7day_total', 
                       'cycle_8day_total', 'requires_restart', 'activities', 'remarks')
    
    def get_trip_id(self, obj):
        return obj.trip.trip_id
    get_trip_id.short_description = 'Trip ID'
    get_trip_id.admin_order_field = 'trip__trip_id'
    
    def has_add_permission(self, request):
        return False  # ELD logs should only be created via API
    
    def has_change_permission(self, request, obj=None):
        return False  # ELD logs should not be manually edited