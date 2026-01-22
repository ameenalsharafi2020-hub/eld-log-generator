"""
HOS Calculator based on FMCSA regulations from PDF
References: Pages 3-11
"""

from datetime import datetime, timedelta
import math
from django.conf import settings

class HOSCalculator:
    """
    Main calculator for Hours of Service compliance
    Based on FMCSA regulations for property-carrying CMVs
    """
    
    def __init__(self, trip_data):
        self.trip_data = trip_data
        self.config = settings.HOS_CONFIG['PROPERTY_CARRYING']
        self.assumptions = settings.HOS_CONFIG['ASSUMPTIONS']
        
        # Initialize counters
        self.current_day = 1
        self.remaining_driving_hours = 0
        self.total_distance = 0
        self.eld_logs = []
        
        # From PDF page 10: 70-hour/8-day rule
        self.cycle_7day_hours = trip_data.get('current_cycle_used', 0)
        self.cycle_8day_hours = trip_data.get('current_cycle_used', 0)
        
        # From PDF page 7: Sleeper berth tracking
        self.sleeper_berth_time = 0
        self.last_sleeper_period = None
        
    def calculate_trip(self, distance_miles, driving_hours):
        """
        Calculate complete trip schedule with ELD logs
        """
        self.total_distance = distance_miles
        self.remaining_driving_hours = driving_hours
        
        # Calculate number of days needed
        total_days = math.ceil(driving_hours / self.config['MAX_DAILY_DRIVING'])
        
        for day in range(1, total_days + 1):
            day_log = self.calculate_day(day, total_days)
            self.eld_logs.append(day_log)
            
            # Update cycle totals (PDF page 10)
            self.update_cycle_totals(day_log)
        
        return self.eld_logs
    
    def calculate_day(self, day_number, total_days):
        """
        Calculate schedule for a single day based on FMCSA rules
        """
        # Determine driving hours for this day
        driving_hours = min(
            self.config['MAX_DAILY_DRIVING'],
            self.remaining_driving_hours
        )
        
        # Calculate on-duty hours (PDF page 5 definition)
        on_duty_hours = self.calculate_on_duty_hours(driving_hours, day_number, total_days)
        
        # Calculate required breaks (PDF page 10)
        breaks = self.calculate_breaks(driving_hours)
        
        # Calculate fuel stops based on distance (Assumption)
        fuel_stops = self.calculate_fuel_stops(day_number)
        
        # Calculate load/unload time (Assumption)
        load_unload_time = self.calculate_load_unload_time(day_number, total_days)
        
        # Calculate off-duty hours (must be at least 10 consecutive hours - PDF page 6)
        off_duty_hours = max(
            self.config['MIN_OFF_DUTY'],
            24 - (on_duty_hours + sum(breaks) + load_unload_time)
        )
        
        # Check for 34-hour restart requirement (PDF page 11)
        requires_restart = self.check_restart_requirement()
        
        # Generate activities for ELD grid
        activities = self.generate_activities(
            driving_hours, on_duty_hours, off_duty_hours,
            breaks, fuel_stops, load_unload_time
        )
        
        # Generate remarks (PDF page 17)
        remarks = self.generate_remarks(day_number, driving_hours, fuel_stops)
        
        # Create day log
        day_log = {
            'day_number': day_number,
            'date': (datetime.now() + timedelta(days=day_number-1)).strftime('%Y-%m-%d'),
            'driving_hours': driving_hours,
            'on_duty_hours': on_duty_hours,
            'off_duty_hours': off_duty_hours,
            'sleeper_hours': 0,  # Would be calculated if sleeper berth used
            'breaks': breaks,
            'fuel_stops': fuel_stops,
            'load_unload_time': load_unload_time,
            'cycle_7day_total': self.cycle_7day_hours,
            'cycle_8day_total': self.cycle_8day_hours,
            'requires_restart': requires_restart,
            'activities': activities,
            'remarks': remarks,
            'compliance': self.check_daily_compliance(
                driving_hours, on_duty_hours, off_duty_hours
            )
        }
        
        # Update remaining driving hours
        self.remaining_driving_hours -= driving_hours
        
        return day_log
    
    def calculate_on_duty_hours(self, driving_hours, day_number, total_days):
        """
        Calculate total on-duty hours per PDF page 5 definition
        """
        # Base on-duty includes driving time
        on_duty = driving_hours
        
        # Add time for vehicle inspection (pre/post trip)
        on_duty += 0.5  # 30 minutes inspection
        
        # Add time for paperwork
        on_duty += 0.25  # 15 minutes
        
        # Add time for loading/unloading if applicable
        if day_number == 1:  # Pickup day
            on_duty += self.assumptions['LOAD_UNLOAD_TIME']
        if day_number == total_days:  # Dropoff day
            on_duty += self.assumptions['LOAD_UNLOAD_TIME']
        
        # Ensure it doesn't exceed 14-hour window (PDF page 6)
        return min(on_duty, self.config['MAX_DAILY_WINDOW'])
    
    def calculate_breaks(self, driving_hours):
        """
        Calculate required breaks per PDF page 10
        """
        breaks = []
        
        # 30-minute break required after 8 hours driving (PDF page 10)
        if driving_hours > self.config['BREAK_AFTER_HOURS']:
            breaks.append({
                'type': '30_min_break',
                'duration': self.config['BREAK_DURATION'],
                'required': True,
                'description': 'Required 30-minute break after 8 hours driving (§395.3)'
            })
        
        # Lunch break (optional but realistic)
        if driving_hours > 6:
            breaks.append({
                'type': 'lunch_break',
                'duration': 0.5,
                'required': False,
                'description': 'Lunch break'
            })
        
        return breaks
    
    def calculate_fuel_stops(self, day_number):
        """
        Calculate fuel stops based on assumption: every 1000 miles
        """
        fuel_stops = []
        miles_per_day = self.total_distance / len(self.eld_logs) if self.eld_logs else 500
        
        # If this day would accumulate 1000+ miles since last fuel
        cumulative_miles = day_number * miles_per_day
        if cumulative_miles >= self.assumptions['FUEL_STOP_INTERVAL']:
            fuel_stops.append({
                'duration': self.assumptions['FUEL_STOP_DURATION'],
                'description': f'Fuel stop required every {self.assumptions["FUEL_STOP_INTERVAL"]} miles',
                'mileage': cumulative_miles
            })
        
        return fuel_stops
    
    def calculate_load_unload_time(self, day_number, total_days):
        """
        Calculate time for pickup and dropoff per assumptions
        """
        load_time = 0
        
        # Pickup on first day
        if day_number == 1:
            load_time += self.assumptions['LOAD_UNLOAD_TIME']
        
        # Dropoff on last day
        if day_number == total_days:
            load_time += self.assumptions['LOAD_UNLOAD_TIME']
        
        return load_time
    
    def check_restart_requirement(self):
        """
        Check if 34-hour restart is required per PDF page 11
        """
        return self.cycle_8day_hours >= self.config['MAX_8DAY_HOURS']
    
    def update_cycle_totals(self, day_log):
        """
        Update 7-day and 8-day cycle totals (PDF page 10)
        """
        # Add today's on-duty hours to cycle totals
        self.cycle_7day_hours += day_log['on_duty_hours']
        self.cycle_8day_hours += day_log['on_duty_hours']
        
        # Remove hours from 7/8 days ago (rolling calculation)
        # In a real system, we'd track daily history
        if len(self.eld_logs) > 7:
            self.cycle_7day_hours -= self.eld_logs[-7]['on_duty_hours']
        if len(self.eld_logs) > 8:
            self.cycle_8day_hours -= self.eld_logs[-8]['on_duty_hours']
    
    def generate_activities(self, driving_hours, on_duty_hours, off_duty_hours, 
                           breaks, fuel_stops, load_unload_time):
        """
        Generate activities for ELD grid (PDF page 15-18)
        """
        activities = []
        
        # Off-duty period (start of day)
        activities.append({
            'status': 'off_duty',
            'start': '00:00',
            'end': '05:00',
            'duration': 5,
            'description': 'Off duty - rest period'
        })
        
        # Pre-trip inspection (on-duty not driving)
        activities.append({
            'status': 'on_duty',
            'start': '05:00',
            'end': '05:30',
            'duration': 0.5,
            'description': 'Pre-trip vehicle inspection'
        })
        
        # Driving periods (simulated schedule)
        current_hour = 5.5
        hours_driven = 0
        
        while hours_driven < driving_hours:
            segment = min(4, driving_hours - hours_driven)  # Drive in 4-hour segments
            
            activities.append({
                'status': 'driving',
                'start': self.format_time(current_hour),
                'end': self.format_time(current_hour + segment),
                'duration': segment,
                'description': 'Driving'
            })
            
            current_hour += segment
            hours_driven += segment
            
            # Add break if needed
            if hours_driven >= self.config['BREAK_AFTER_HOURS'] and any(b['type'] == '30_min_break' for b in breaks):
                activities.append({
                    'status': 'off_duty',
                    'start': self.format_time(current_hour),
                    'end': self.format_time(current_hour + 0.5),
                    'duration': 0.5,
                    'description': '30-minute break required after 8 hours'
                })
                current_hour += 0.5
        
        # Fuel stop if needed
        if fuel_stops:
            activities.append({
                'status': 'on_duty',
                'start': self.format_time(current_hour),
                'end': self.format_time(current_hour + 1),
                'duration': 1,
                'description': 'Fuel stop - refueling vehicle'
            })
            current_hour += 1
        
        # Post-trip and off-duty
        activities.append({
            'status': 'on_duty',
            'start': self.format_time(current_hour),
            'end': self.format_time(current_hour + 0.5),
            'duration': 0.5,
            'description': 'Post-trip inspection and paperwork'
        })
        current_hour += 0.5
        
        # Remaining time off-duty
        remaining_off_duty = 24 - current_hour
        if remaining_off_duty > 0:
            activities.append({
                'status': 'off_duty',
                'start': self.format_time(current_hour),
                'end': '24:00',
                'duration': remaining_off_duty,
                'description': 'Off duty - required rest period'
            })
        
        return activities
    
    def generate_remarks(self, day_number, driving_hours, fuel_stops):
        """
        Generate remarks for ELD log per PDF page 17
        """
        remarks = []
        
        # Start of day
        remarks.append({
            'time': '05:00',
            'location': 'Terminal',
            'description': 'Reported for duty, began pre-trip inspection'
        })
        
        # Break remark if driving > 8 hours
        if driving_hours > self.config['BREAK_AFTER_HOURS']:
            remarks.append({
                'time': '13:30',
                'location': 'Rest Area',
                'description': '30-minute break as required by §395.3(a)(3)(ii)'
            })
        
        # Fuel stop remarks
        for stop in fuel_stops:
            remarks.append({
                'time': '15:00',  # Would be calculated
                'location': 'Truck Stop',
                'description': f'Fuel stop - {stop["description"]}'
            })
        
        # End of day
        remarks.append({
            'time': '20:00',
            'location': 'Destination',
            'description': 'End of duty day, began off-duty period'
        })
        
        return remarks
    
    def check_daily_compliance(self, driving_hours, on_duty_hours, off_duty_hours):
        """
        Check daily compliance with HOS regulations
        """
        violations = []
        
        # Check 11-hour driving limit (PDF page 6)
        if driving_hours > self.config['MAX_DAILY_DRIVING']:
            violations.append({
                'rule': '11-hour driving limit (§395.3(a)(3))',
                'limit': self.config['MAX_DAILY_DRIVING'],
                'actual': driving_hours,
                'status': 'VIOLATION'
            })
        
        # Check 14-hour window (PDF page 6)
        if on_duty_hours > self.config['MAX_DAILY_WINDOW']:
            violations.append({
                'rule': '14-hour driving window (§395.3(a)(2))',
                'limit': self.config['MAX_DAILY_WINDOW'],
                'actual': on_duty_hours,
                'status': 'VIOLATION'
            })
        
        # Check 10-hour off-duty (PDF page 6)
        if off_duty_hours < self.config['MIN_OFF_DUTY']:
            violations.append({
                'rule': '10-hour off-duty requirement (§395.3(a)(1))',
                'limit': self.config['MIN_OFF_DUTY'],
                'actual': off_duty_hours,
                'status': 'VIOLATION'
            })
        
        # Check 70-hour/8-day limit
        if self.cycle_8day_hours > self.config['MAX_8DAY_HOURS']:
            violations.append({
                'rule': '70-hour/8-day limit (§395.3(b))',
                'limit': self.config['MAX_8DAY_HOURS'],
                'actual': self.cycle_8day_hours,
                'status': 'VIOLATION',
                'action': '34-hour restart required'
            })
        
        return {
            'is_compliant': len(violations) == 0,
            'violations': violations,
            'summary': f"{len(violations)} violation(s) found" if violations else "Fully compliant"
        }
    
    def format_time(self, decimal_hours):
        """Convert decimal hours to HH:MM format"""
        hours = int(decimal_hours)
        minutes = int((decimal_hours - hours) * 60)
        return f"{hours:02d}:{minutes:02d}"