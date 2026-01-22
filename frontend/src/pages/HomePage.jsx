import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Schedule as ScheduleIcon,
  Map as MapIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  
  const features = [
    { icon: <MapIcon />, title: 'Route Planning', description: 'Plan optimal routes with stops and rests' },
    { icon: <ScheduleIcon />, title: 'ELD Compliance', description: 'Automatically calculate hours-of-service compliance' },
    { icon: <DescriptionIcon />, title: 'Log Generation', description: 'Generate FMCSA-compliant daily log sheets' },
    { icon: <CarIcon />, title: 'Fuel Stops', description: 'Calculate required fuel stops every 1,000 miles' },
  ];
  
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              ELD Log Generator
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
              FMCSA-Compliant Trip Planning Tool
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 800, margin: '0 auto', mb: 6, fontSize: '1.1rem' }}>
              Plan your trips while ensuring compliance with FMCSA regulations. 
              Automatically generate daily log sheets and calculate required rest stops.
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<PlayArrowIcon />}
              onClick={() => navigate('/trip')}
              sx={{
                backgroundColor: 'white',
                color: '#1a365d',
                '&:hover': {
                  backgroundColor: '#f7fafc',
                },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Start Planning Your Trip
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
            Key Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ color: 'primary.main', fontSize: 40, mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              How It Works
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Enter Trip Details" 
                  secondary="Provide current location, pickup, drop-off locations, and current cycle hours"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Route Calculation" 
                  secondary="System calculates optimal route with required rest stops"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Log Generation" 
                  secondary="Automatically generate FMCSA-compliant daily log sheets"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Export & Print" 
                  secondary="Download or print logs for your records"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: '#f0f9ff' }}>
            <Typography variant="h6" gutterBottom>
              FMCSA Regulations Applied
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  • 11-hour driving limit (14-hour on-duty limit)
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  • 70-hour/8-day cycle limit
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  • 30-minute break after 8 hours of driving
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  • 10-hour off-duty requirement
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  • Fuel stops every 1,000 miles
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2">
                  • 1-hour pickup/drop-off time
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
