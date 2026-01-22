from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from datetime import datetime, timedelta
import math

class TripCalculatorView(APIView):
    """
    API endpoint to calculate trip and generate ELD logs
    """
    
    def post(self, request):
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ['current_location', 'pickup_location', 'dropoff_location', 'current_cycle_used']
            for field in required_fields:
                if field not in data:
                    return Response(
                        {'error': f'Missing required field: {field}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Validate current_cycle_used
            try:
                current_cycle_used = float(data['current_cycle_used'])
                if current_cycle_used < 0 or current_cycle_used > 70:
                    return Response(
                        {'error': 'current_cycle_used must be between 0 and 70 hours'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except ValueError:
                return Response(
                    {'error': 'current_cycle_used must be a number'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate trip ID
            import uuid
            trip_id = f"TRIP-{uuid.uuid4().hex[:8].upper()}"
            
            # Calculate route information (simplified for now)
            route_info = self.calculate_route_info(data)
            
            # Calculate ELD logs
            eld_logs = self.calculate_eld_logs(data, route_info)
            
            # Prepare response
            response_data = {
                'trip_id': trip_id,
                'route': route_info,
                'eld_logs': eld_logs,
                'compliance_summary': self.generate_compliance_summary(eld_logs),
                'legal_references': [
                    {
                        'section': '49 CFR §395.3(a)(3)',
                        'title': '11-Hour Driving Limit',
                        'reference': 'PDF Page 6'
                    },
                    {
                        'section': '49 CFR §395.3(a)(2)',
                        'title': '14-Hour Driving Window',
                        'reference': 'PDF Page 6'
                    },
                    {
                        'section': '49 CFR §395.3(a)(3)(ii)',
                        'title': '30-Minute Break Requirement',
                        'reference': 'PDF Page 10'
                    },
                    {
                        'section': '49 CFR §395.3(b)',
                        'title': '70-Hour/8-Day Limit',
                        'reference': 'PDF Page 10'
                    }
                ],
                'generated_at': datetime.now().isoformat()
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def calculate_route_info(self, data):
        """Calculate simplified route information"""
        # For demo purposes, we'll use estimated values
        # In production, you would integrate with a mapping API
        
        estimated_distance = 1200  # miles
        estimated_hours = estimated_distance / 55  # Assuming 55 mph average
        estimated_days = math.ceil(estimated_hours / 11)  # Max 11 hours per day
        
        return {
            'distance_miles': estimated_distance,
            'driving_hours': estimated_hours,
            'estimated_days': estimated_days,
            'average_speed': 55,
            'note': 'Using estimated values for demo purposes'
        }
    
    def calculate_eld_logs(self, data, route_info):
        """Calculate ELD logs based on HOS regulations"""
        current_cycle_used = float(data.get('current_cycle_used', 0))
        total_driving_hours = route_info['driving_hours']
        days_needed = math.ceil(total_driving_hours / 11)
        
        eld_logs = []
        remaining_hours = total_driving_hours
        cycle_total = current_cycle_used
        
        for day in range(1, days_needed + 1):
            # Calculate driving hours for this day (max 11)
            driving_hours = min(11, remaining_hours)
            
            # Calculate on-duty hours (driving + other duties)
            on_duty_hours = min(14, driving_hours + 2.5)  # Add 2.5 hours for other duties
            
            # Calculate off-duty hours (must be at least 10)
            off_duty_hours = max(10, 24 - on_duty_hours)
            
            # Update cycle totals
            cycle_total += on_duty_hours
            
            # Check if 30-minute break is needed
            requires_break = driving_hours > 8
            
            # Check for fuel stop (every 1000 miles)
            has_fuel_stop = (day * 1200 / days_needed) >= 1000
            
            # Generate activities
            activities = self.generate_activities(driving_hours, requires_break, has_fuel_stop)
            
            # Generate remarks
            remarks = self.generate_remarks(day, data)
            
            day_log = {
                'day_number': day,
                'date': (datetime.now() + timedelta(days=day-1)).strftime('%Y-%m-%d'),
                'driving_hours': driving_hours,
                'on_duty_hours': on_duty_hours,
                'off_duty_hours': off_duty_hours,
                'sleeper_hours': 0,
                'cycle_7day_total': cycle_total if day <= 7 else cycle_total - eld_logs[day-8]['on_duty_hours'] if day > 8 else cycle_total,
                'cycle_8day_total': cycle_total if day <= 8 else cycle_total - eld_logs[day-9]['on_duty_hours'] if day > 9 else cycle_total,
                'requires_restart': cycle_total >= 70,
                'requires_break': requires_break,
                'has_fuel_stop': has_fuel_stop,
                'activities': activities,
                'remarks': remarks,
                'compliance': self.check_day_compliance(driving_hours, on_duty_hours, off_duty_hours, cycle_total)
            }
            
            eld_logs.append(day_log)
            remaining_hours -= driving_hours
        
        return eld_logs
    
    def generate_activities(self, driving_hours, requires_break, has_fuel_stop):
        """Generate activities for the day"""
        activities = []
        
        # Off duty (sleep)
        activities.append({
            'status': 'off_duty',
            'start': '00:00',
            'end': '05:00',
            'duration': 5,
            'description': 'Off duty - rest period'
        })
        
        # Pre-trip inspection
        activities.append({
            'status': 'on_duty',
            'start': '05:00',
            'end': '05:30',
            'duration': 0.5,
            'description': 'Pre-trip vehicle inspection'
        })
        
        # First driving segment
        first_segment = min(4, driving_hours)
        activities.append({
            'status': 'driving',
            'start': '05:30',
            'end': self.format_time(5.5 + first_segment),
            'duration': first_segment,
            'description': 'Driving'
        })
        
        current_time = 5.5 + first_segment
        remaining_driving = driving_hours - first_segment
        
        # 30-minute break if needed
        if requires_break:
            activities.append({
                'status': 'off_duty',
                'start': self.format_time(current_time),
                'end': self.format_time(current_time + 0.5),
                'duration': 0.5,
                'description': '30-minute break required after 8 hours'
            })
            current_time += 0.5
        
        # Second driving segment
        if remaining_driving > 0:
            second_segment = remaining_driving
            activities.append({
                'status': 'driving',
                'start': self.format_time(current_time),
                'end': self.format_time(current_time + second_segment),
                'duration': second_segment,
                'description': 'Driving'
            })
            current_time += second_segment
        
        # Fuel stop if needed
        if has_fuel_stop:
            activities.append({
                'status': 'on_duty',
                'start': self.format_time(current_time),
                'end': self.format_time(current_time + 1),
                'duration': 1,
                'description': 'Fuel stop - every 1000 miles'
            })
            current_time += 1
        
        # Post-trip and off-duty
        activities.append({
            'status': 'on_duty',
            'start': self.format_time(current_time),
            'end': self.format_time(current_time + 0.5),
            'duration': 0.5,
            'description': 'Post-trip inspection and paperwork'
        })
        
        return activities
    
    def generate_remarks(self, day, data):
        """Generate remarks for the ELD log"""
        remarks = [
            {
                'time': '05:00',
                'location': 'Terminal',
                'description': 'Reported for duty, began pre-trip inspection'
            }
        ]
        
        if day == 1:
            remarks.append({
                'time': '08:00',
                'location': data.get('pickup_location', 'Pickup Location'),
                'description': 'Arrived for pickup, 1 hour loading time'
            })
        
        return remarks
    
    def check_day_compliance(self, driving_hours, on_duty_hours, off_duty_hours, cycle_total):
        """Check HOS compliance for the day"""
        violations = []
        
        # Check 11-hour driving limit
        if driving_hours > 11:
            violations.append({
                'rule': '11-hour driving limit (§395.3(a)(3))',
                'limit': 11,
                'actual': driving_hours,
                'status': 'VIOLATION'
            })
        
        # Check 14-hour window
        if on_duty_hours > 14:
            violations.append({
                'rule': '14-hour driving window (§395.3(a)(2))',
                'limit': 14,
                'actual': on_duty_hours,
                'status': 'VIOLATION'
            })
        
        # Check 10-hour off-duty
        if off_duty_hours < 10:
            violations.append({
                'rule': '10-hour off-duty requirement (§395.3(a)(1))',
                'limit': 10,
                'actual': off_duty_hours,
                'status': 'VIOLATION'
            })
        
        # Check 70-hour/8-day limit
        if cycle_total > 70:
            violations.append({
                'rule': '70-hour/8-day limit (§395.3(b))',
                'limit': 70,
                'actual': cycle_total,
                'status': 'VIOLATION',
                'action': '34-hour restart required'
            })
        
        return {
            'is_compliant': len(violations) == 0,
            'violations': violations
        }
    
    def generate_compliance_summary(self, eld_logs):
        """Generate compliance summary for all logs"""
        total_violations = sum(len(log['compliance']['violations']) for log in eld_logs)
        requires_restart = any(log['requires_restart'] for log in eld_logs)
        
        return {
            'is_compliant': total_violations == 0,
            'violation_count': total_violations,
            'total_trip_hours': sum(log['driving_hours'] for log in eld_logs),
            'total_days': len(eld_logs),
            'requires_34hr_restart': requires_restart
        }
    
    def format_time(self, decimal_hours):
        """Format decimal hours to HH:MM"""
        hours = int(decimal_hours)
        minutes = int((decimal_hours - hours) * 60)
        return f"{hours:02d}:{minutes:02d}"


class TripHistoryView(APIView):
    """View to get trip history (simplified for now)"""
    
    def get(self, request):
        return Response({
            'message': 'Trip history endpoint',
            'note': 'This would return trip history from database in production'
        })