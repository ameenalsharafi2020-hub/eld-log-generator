from datetime import datetime, timedelta, time
import math

class ELDCalculator:
    def __init__(self, trip):
        self.trip = trip
        self.current_time = datetime.now()
        self.cycle_hours_used = trip.current_cycle_used
        self.max_daily_driving = 11  # hours
        self.max_cycle_hours = 70  # hours over 8 days
        self.min_break = 0.5  # 30 minutes break required after 8 hours
        self.driving_speed = 60  # mph average
        
    def calculate_trip(self):
        # Mock calculation - in production, use actual distance API
        total_distance = 850  # miles from API
        total_hours = total_distance / self.driving_speed
        
        # Calculate fuel stops
        fuel_stops = math.floor(total_distance / 1000)
        
        # Calculate number of days needed
        hours_per_day = min(self.max_daily_driving, 
                           self.max_cycle_hours - self.cycle_hours_used)
        
        if hours_per_day <= 0:
            hours_per_day = self.max_daily_driving
        
        total_days = math.ceil(total_hours / hours_per_day)
        
        # Generate daily logs
        daily_logs = self.generate_daily_logs(total_hours, total_days)
        
        # Generate legs
        legs = self.generate_legs(total_distance, total_hours)
        
        return {
            'success': True,
            'total_distance': total_distance,
            'total_duration': total_hours,
            'fuel_stops': fuel_stops,
            'total_days': total_days,
            'legs': legs,
            'daily_logs': daily_logs
        }
    
    def generate_legs(self, total_distance, total_hours):
        legs = []
        segment_distance = total_distance / 3
        segment_hours = total_hours / 3
        
        legs.append({
            'start': self.trip.current_location,
            'end': self.trip.pickup_location,
            'distance': segment_distance,
            'duration': segment_hours
        })
        
        legs.append({
            'start': self.trip.pickup_location,
            'end': self.trip.dropoff_location,
            'distance': segment_distance * 1.5,
            'duration': segment_hours * 1.5
        })
        
        legs.append({
            'start': self.trip.dropoff_location,
            'end': 'Final Destination',
            'distance': segment_distance * 0.5,
            'duration': segment_hours * 0.5
        })
        
        return legs
    
    def generate_daily_logs(self, total_hours, total_days):
        daily_logs = []
        current_date = self.current_time.date()
        hours_remaining = total_hours
        cycle_hours_used = self.cycle_hours_used
        
        for day in range(1, total_days + 1):
            # Calculate available driving hours for the day
            available_daily_hours = min(self.max_daily_driving, 
                                       self.max_cycle_hours - cycle_hours_used)
            
            if available_daily_hours <= 0:
                # Reset cycle
                cycle_hours_used = 0
                available_daily_hours = self.max_daily_driving
            
            # Determine hours for this day
            day_driving_hours = min(hours_remaining, available_daily_hours)
            hours_remaining -= day_driving_hours
            
            # Generate log entries for the day
            entries = self.generate_log_entries(day_driving_hours, day, current_date)
            
            # Calculate duty hours
            on_duty_hours = day_driving_hours + 2  # Include pickup/dropoff time
            off_duty_hours = 24 - on_duty_hours
            
            daily_log = {
                'day': day,
                'date': current_date,
                'total_hours': 24,
                'driving_hours': day_driving_hours,
                'on_duty_hours': on_duty_hours,
                'off_duty_hours': off_duty_hours,
                'sleeper_berth_hours': 10,
                'entries': entries
            }
            
            daily_logs.append(daily_log)
            
            # Update for next day
            current_date += timedelta(days=1)
            cycle_hours_used += day_driving_hours
            
            if cycle_hours_used >= self.max_cycle_hours:
                cycle_hours_used = 0
        
        return daily_logs
    
    def generate_log_entries(self, driving_hours, day_number, current_date):
        entries = []
        
        # Start of day - Off Duty
        entries.append({
            'start_time': '00:00',
            'end_time': '06:00',
            'activity': 'OFF',
            'location': 'Rest Area',
            'remarks': '10-hour break'
        })
        
        # On Duty - Pre-trip
        entries.append({
            'start_time': '06:00',
            'end_time': '06:30',
            'activity': 'ON',
            'location': 'Yard',
            'remarks': 'Pre-trip inspection'
        })
        
        # Driving
        start_hour = 6.5
        end_hour = start_hour + driving_hours
        
        # Break into segments with breaks
        if driving_hours > 8:
            # First segment
            entries.append({
                'start_time': self.time_from_hours(start_hour),
                'end_time': self.time_from_hours(start_hour + 8),
                'activity': 'D',
                'location': f'Day {day_number} Route',
                'remarks': 'Driving segment 1'
            })
            
            # 30-minute break
            entries.append({
                'start_time': self.time_from_hours(start_hour + 8),
                'end_time': self.time_from_hours(start_hour + 8.5),
                'activity': 'ON',
                'location': 'Rest Stop',
                'remarks': '30-minute break'
            })
            
            # Second segment
            entries.append({
                'start_time': self.time_from_hours(start_hour + 8.5),
                'end_time': self.time_from_hours(end_hour),
                'activity': 'D',
                'location': f'Day {day_number} Route',
                'remarks': 'Driving segment 2'
            })
        else:
            entries.append({
                'start_time': self.time_from_hours(start_hour),
                'end_time': self.time_from_hours(end_hour),
                'activity': 'D',
                'location': f'Day {day_number} Route',
                'remarks': 'Driving'
            })
        
        # On Duty - Post-trip
        entries.append({
            'start_time': self.time_from_hours(end_hour),
            'end_time': self.time_from_hours(end_hour + 0.5),
            'activity': 'ON',
            'location': 'Destination',
            'remarks': 'Post-trip and paperwork'
        })
        
        # Off Duty for rest
        entries.append({
            'start_time': self.time_from_hours(end_hour + 0.5),
            'end_time': '23:59',
            'activity': 'OFF',
            'location': 'Hotel',
            'remarks': 'Off duty'
        })
        
        return entries
    
    def time_from_hours(self, hours):
        hour = int(hours)
        minute = int((hours - hour) * 60)
        return f"{hour:02d}:{minute:02d}"