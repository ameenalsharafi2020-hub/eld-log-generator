from django.urls import path
from . import views

urlpatterns = [
    path('trip/', views.TripCalculatorView.as_view(), name='trip-calculator'),
    path('trips/history/', views.TripHistoryView.as_view(), name='trip-history'),
]