"""
FMCSA HOS Exceptions based on the provided PDF document.
Reference: Appendix A (Pages 20-26)
"""

class HOSException:
    """Base class for HOS exceptions"""
    
    def __init__(self, name, cfr_section, description, conditions):
        self.name = name
        self.cfr_section = cfr_section
        self.description = description
        self.conditions = conditions
    
    def check_eligibility(self, trip_data):
        """Check if trip qualifies for this exception"""
        raise NotImplementedError

class ShortHaulException(HOSException):
    """
    Short-haul exception for CDL drivers
    PDF Reference: Page 12, §395.1(e)(1)
    """
    
    def __init__(self):
        super().__init__(
            name="150 Air-Mile Radius (CDL)",
            cfr_section="49 CFR §395.1(e)(1)",
            description="Exception for drivers operating within 150 air-mile radius",
            conditions=[
                "Return to normal work location within 14 consecutive hours",
                "Stay within 150 air-mile radius of work location",
                "Have at least 10 consecutive hours off duty between shifts",
                "Employer maintains time records for 6 months"
            ]
        )
    
    def check_eligibility(self, trip_data):
        """Check eligibility based on PDF page 12 requirements"""
        # Calculate air-mile distance
        from geopy.distance import geodesic
        
        try:
            # This would require geocoding in real implementation
            distance = self.calculate_distance(
                trip_data['current_location'],
                trip_data['dropoff_location']
            )
            
            conditions_met = [
                distance <= 150,  # Within 150 air-miles
                trip_data.get('requires_cdl', True),  # Requires CDL
                # Additional checks based on PDF
            ]
            
            return all(conditions_met), self.get_benefits()
        except:
            return False, []
    
    def get_benefits(self):
        """Benefits per PDF page 12-13"""
        return [
            "No ELD or logbook required (time records only)",
            "30-minute break not required",
            "No RODS required if conditions met"
        ]

class NonCDLShortHaulException(HOSException):
    """
    Short-haul exception for non-CDL drivers
    PDF Reference: Page 13, §395.1(e)(2)
    """
    
    def __init__(self):
        super().__init__(
            name="150 Air-Mile Radius (Non-CDL)",
            cfr_section="49 CFR §395.1(e)(2)",
            description="Exception for non-CDL drivers operating short distances",
            conditions=[
                "CMV does not require CDL",
                "Work within 150 air-mile radius",
                "Return to work location daily",
                "Specific hour limitations apply"
            ]
        )
    
    def check_eligibility(self, trip_data):
        """Check eligibility based on PDF page 13"""
        conditions_met = [
            not trip_data.get('requires_cdl', True),  # Does NOT require CDL
            # Distance calculation would go here
            # Additional hour limitations from PDF
        ]
        
        return all(conditions_met), self.get_benefits()
    
    def get_benefits(self):
        return [
            "No logbook required",
            "Specific hour limitations instead of standard HOS",
            "Time records maintained by employer"
        ]

class AdverseConditionsException(HOSException):
    """
    Adverse driving conditions exception
    PDF Reference: Page 12, §395.1(b)(1)
    """
    
    def __init__(self):
        super().__init__(
            name="Adverse Driving Conditions",
            cfr_section="49 CFR §395.1(b)(1)",
            description="Allows extra driving time for unexpected conditions",
            conditions=[
                "Conditions could not be anticipated",
                "Not typical rush hour traffic",
                "Driver must annotate in RODS"
            ]
        )
    
    def check_eligibility(self, trip_data):
        """Check if adverse conditions apply"""
        conditions_met = [
            trip_data.get('adverse_conditions', False),
            # Additional checks based on PDF definition
        ]
        
        return all(conditions_met), self.get_benefits()
    
    def get_benefits(self):
        return [
            "Up to 2 additional hours of driving time",
            "Extension of 14-hour driving window by 2 hours",
            "Complete current run despite conditions"
        ]

class SixteenHourException(HOSException):
    """
    16-hour short-haul exception
    PDF Reference: Page 14, §395.1(o)
    """
    
    def __init__(self):
        super().__init__(
            name="16-Hour Short-Haul",
            cfr_section="49 CFR §395.1(o)",
            description="Extend driving window to 16 hours once per week",
            conditions=[
                "Return to work reporting location",
                "Released within 16 hours",
                "Once every 7 consecutive days",
                "Not eligible for non-CDL exception"
            ]
        )
    
    def check_eligibility(self, trip_data):
        """Check eligibility for 16-hour exception"""
        conditions_met = [
            trip_data.get('requires_cdl', True),  # CDL required
            # Additional checks from PDF
        ]
        
        return all(conditions_met), self.get_benefits()
    
    def get_benefits(self):
        return [
            "Extend 14-hour window to 16 hours",
            "Once every 7 consecutive days",
            "After 34-hour restart can use again"
        ]

class ExceptionChecker:
    """Main class to check all applicable exceptions"""
    
    def __init__(self):
        self.exceptions = [
            ShortHaulException(),
            NonCDLShortHaulException(),
            AdverseConditionsException(),
            SixteenHourException(),
            # Add other exceptions from Appendix A
        ]
    
    def check_all_exceptions(self, trip_data):
        """Check all exceptions and return applicable ones"""
        applicable = []
        
        for exception in self.exceptions:
            is_eligible, benefits = exception.check_eligibility(trip_data)
            if is_eligible:
                applicable.append({
                    'name': exception.name,
                    'cfr_section': exception.cfr_section,
                    'description': exception.description,
                    'conditions': exception.conditions,
                    'benefits': benefits
                })
        
        return applicable