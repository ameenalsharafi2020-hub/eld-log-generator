from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Trip
from .hos_calculator import HOSCalculator
import json

class HOSCalculatorTestCase(TestCase):
    """Test HOS calculator logic"""
    
    def setUp(self):
        self.calculator = HOSCalculator({
            'current_cycle_used': 0,
            'requires_cdl': True,
            'adverse_conditions': False
        })
    
    def test_daily_driving_limit(self):
        """Test 11-hour daily driving limit"""
        result = self.calculator.calculate_trip(distance_miles=500, driving_hours=12)
        self.assertLessEqual(result[0]['driving_hours'], 11)
    
    def test_14_hour_window(self):
        """Test 14-hour duty window"""
        result = self.calculator.calculate_trip(distance_miles=300, driving_hours=8)
        self.assertLessEqual(result[0]['on_duty_hours'], 14)
    
    def test_30_minute_break(self):
        """Test 30-minute break after 8 hours"""
        result = self.calculator.calculate_trip(distance_miles=600, driving_hours=10)
        has_break = any(b['type'] == '30_min_break' for b in result[0]['breaks'])
        self.assertTrue(has_break)


class TripAPITestCase(APITestCase):
    """Test API endpoints"""
    
    def test_create_trip(self):
        """Test trip creation API"""
        url = reverse('trip-calculator')
        data = {
            'current_location': 'New York, NY',
            'pickup_location': 'Philadelphia, PA',
            'dropoff_location': 'Chicago, IL',
            'current_cycle_used': 45,
            'cmv_weight': 26000,
            'requires_cdl': True,
            'adverse_conditions': False,
            'includes_hazmat': False,
            'trip_type': 'interstate'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('eld_logs', response.data)
        self.assertIn('compliance_summary', response.data)
    
    def test_invalid_weight(self):
        """Test validation for CMV weight"""
        url = reverse('trip-calculator')
        data = {
            'current_location': 'NY',
            'pickup_location': 'PA',
            'dropoff_location': 'IL',
            'current_cycle_used': 0,
            'cmv_weight': 5000,  # Invalid: less than 10001
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_cycle_hours_validation(self):
        """Test validation for cycle hours"""
        url = reverse('trip-calculator')
        data = {
            'current_location': 'NY',
            'pickup_location': 'PA',
            'dropoff_location': 'IL',
            'current_cycle_used': 80,  # Invalid: more than 70
            'cmv_weight': 12000,
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ModelTestCase(TestCase):
    """Test database models"""
    
    def test_trip_creation(self):
        """Test Trip model creation"""
        trip = Trip.objects.create(
            current_location='New York, NY',
            pickup_location='Philadelphia, PA',
            dropoff_location='Chicago, IL',
            current_cycle_used=30,
            cmv_weight=15000
        )
        
        self.assertIsNotNone(trip.trip_id)
        self.assertTrue(trip.trip_id.startswith('TRIP-'))
        self.assertEqual(trip.current_cycle_used, 30)
    
    def test_eld_log_creation(self):
        """Test EldLog model creation"""
        trip = Trip.objects.create(
            current_location='NY',
            pickup_location='PA',
            dropoff_location='IL',
            current_cycle_used=0,
            cmv_weight=12000
        )
        
        eld_log = trip.eld_logs.create(
            day_number=1,
            date='2024-01-01',
            driving_hours=10.5,
            on_duty_hours=13.5,
            off_duty_hours=10.5,
            cycle_7day_total=45.0,
            cycle_8day_total=45.0,
            activities=[{'status': 'driving', 'start': '06:00', 'end': '16:00'}],
            remarks=[{'time': '06:00', 'location': 'Terminal', 'description': 'Start'}]
        )
        
        self.assertEqual(eld_log.trip, trip)
        self.assertEqual(eld_log.day_number, 1)