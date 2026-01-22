import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { tripService } from '../services/api';

const steps = ['Trip Details', 'Review', 'Results'];

const TripDetailsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [tripData, setTripData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: 0,
  });
  
  const [routeInfo, setRouteInfo] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripData(prev => ({
      ...prev,
      [name]: name === 'current_cycle_used' ? parseFloat(value) || 0 : value
    }));
  };
  
  const calculateRoute = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await tripService.calculateRoute(tripData);
      setRouteInfo(response.data);
      setActiveStep(1);
    } catch (err) {
      setError('Failed to calculate route. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const submitTrip = async () => {
    try {
      setLoading(true);
      const response = await tripService.createTrip(tripData);
      navigate(`/results/${response.data.id}`);
    } catch (err) {
      setError('Failed to create trip. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
          ELD Trip Planner
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Enter Trip Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Location"
                  name="current_location"
                  value={tripData.current_location}
                  onChange={handleInputChange}
                  placeholder="e.g., Chicago, IL"
                  required
                  InputProps={{
                    startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  name="pickup_location"
                  value={tripData.pickup_location}
                  onChange={handleInputChange}
                  placeholder="e.g., Dallas, TX"
                  required
                  InputProps={{
                    startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Drop-off Location"
                  name="dropoff_location"
                  value={tripData.dropoff_location}
                  onChange={handleInputChange}
                  placeholder="e.g., Los Angeles, CA"
                  required
                  InputProps={{
                    startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Cycle Used (Hours)"
                  name="current_cycle_used"
                  type="number"
                  value={tripData.current_cycle_used}
                  onChange={handleInputChange}
                  placeholder="e.g., 35"
                  InputProps={{
                    startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />,
                    inputProps: { min: 0, max: 70, step: 0.5 }
                  }}
                  helperText="70-hour/8-day cycle"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={calculateRoute}
                  disabled={loading || !tripData.current_location || !tripData.pickup_location || !tripData.dropoff_location}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Calculating...' : 'Calculate Route'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {activeStep === 1 && routeInfo && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Route Overview
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Route Summary
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Total Distance:</strong> {routeInfo.route.distance.toFixed(1)} miles
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Estimated Duration:</strong> {routeInfo.route.duration.toFixed(1)} hours
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Number of Legs:</strong> {routeInfo.route.legs.length}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Rest Stops:</strong> {routeInfo.rest_stops.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Trip Details
                    </Typography>
                    {routeInfo.route.legs.map((leg, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Leg {index + 1}: {leg.start} → {leg.end}
                        </Typography>
                        <Typography variant="body2">
                          {leg.distance.toFixed(1)} miles ({leg.duration.toFixed(1)} hours)
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={submitTrip}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Generate ELD Logs'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TripDetailsPage;