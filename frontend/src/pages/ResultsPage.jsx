import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  Map as MapIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { tripService } from '../services/api';
import RouteMap from '../components/RouteMap';
import DailyLogSheet from '../components/DailyLogSheet';

const ResultsPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);
  
  useEffect(() => {
    fetchTrip();
  }, [tripId]);
  
  const fetchTrip = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrip(tripId);
      setTrip(response.data);
    } catch (err) {
      console.error('Failed to fetch trip:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const exportLogs = () => {
    // Implement export functionality
    alert('Export functionality would be implemented here');
  };
  
  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }
  
  if (!trip) {
    return (
      <Container>
        <Typography>Trip not found</Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Trip Results
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportLogs}
              sx={{ mr: 2 }}
            >
              Export Logs
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Distance
                </Typography>
                <Typography variant="h4">
                  {trip.total_distance?.toFixed(1) || 'N/A'}
                  <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                    miles
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Duration
                </Typography>
                <Typography variant="h4">
                  {trip.total_duration?.toFixed(1) || 'N/A'}
                  <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                    hours
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Required Days
                </Typography>
                <Typography variant="h4">
                  {trip.total_days || 'N/A'}
                  <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                    days
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Fuel Stops
                </Typography>
                <Typography variant="h4">
                  {trip.fuel_stops || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<MapIcon />} label="Route Map" />
            <Tab icon={<DescriptionIcon />} label="ELD Logs" />
          </Tabs>
        </Box>
        
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Route Visualization
            </Typography>
            <RouteMap trip={trip} />
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Log Sheets
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Array.from({ length: trip.total_days }, (_, i) => i + 1).map((day) => (
                  <Chip
                    key={day}
                    label={`Day ${day}`}
                    onClick={() => setSelectedDay(day)}
                    color={selectedDay === day ? 'primary' : 'default'}
                    variant={selectedDay === day ? 'filled' : 'outlined'}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
            
            {trip.daily_logs?.map((dailyLog) => (
              dailyLog.day_number === selectedDay && (
                <DailyLogSheet key={dailyLog.id} dailyLog={dailyLog} />
              )
            ))}
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Compliance Summary
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell align="right">Driving Hours</TableCell>
                      <TableCell align="right">On Duty Hours</TableCell>
                      <TableCell align="right">Off Duty Hours</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trip.daily_logs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>Day {log.day_number}</TableCell>
                        <TableCell align="right">{log.driving_hours.toFixed(1)}</TableCell>
                        <TableCell align="right">{log.on_duty_hours.toFixed(1)}</TableCell>
                        <TableCell align="right">{log.off_duty_hours.toFixed(1)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={log.driving_hours <= 11 ? 'Compliant' : 'Violation'}
                            color={log.driving_hours <= 11 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ResultsPage;