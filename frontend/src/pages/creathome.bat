(
echo import React from 'react';
echo import { useNavigate } from 'react-router-dom';
echo import {
echo   Container,
echo   Grid,
echo   Paper,
echo   Typography,
echo   Button,
echo   Box,
echo   Card,
echo   CardContent,
echo   List,
echo   ListItem,
echo   ListItemIcon,
echo   ListItemText,
echo } from '@mui/material';
echo import {
echo   DirectionsCar as CarIcon,
echo   Schedule as ScheduleIcon,
echo   Map as MapIcon,
echo   Description as DescriptionIcon,
echo   CheckCircle as CheckCircleIcon,
echo   PlayArrow as PlayArrowIcon,
echo } from '@mui/icons-material';
echo.
echo const HomePage = () => {
echo   const navigate = useNavigate();
echo   
echo   const features = [
echo     { icon: <MapIcon />, title: 'Route Planning', description: 'Plan optimal routes with stops and rests' },
echo     { icon: <ScheduleIcon />, title: 'ELD Compliance', description: 'Automatically calculate hours-of-service compliance' },
echo     { icon: <DescriptionIcon />, title: 'Log Generation', description: 'Generate FMCSA-compliant daily log sheets' },
echo     { icon: <CarIcon />, title: 'Fuel Stops', description: 'Calculate required fuel stops every 1,000 miles' },
echo   ];
echo   
echo   return (
echo     <Container maxWidth="lg" sx={{ py: 8 }}>
echo       <Grid container spacing={6}>
echo         <Grid item xs={12}>
echo           <Paper
echo             elevation={0}
echo             sx={{
echo               p: 6,
echo               textAlign: 'center',
echo               background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
echo               color: 'white',
echo               borderRadius: 4,
echo             }}
echo           >
echo             <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
echo               ELD Log Generator
echo             </Typography>
echo             <Typography variant="h5" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
echo               FMCSA-Compliant Trip Planning Tool
echo             </Typography>
echo             <Typography variant="body1" sx={{ maxWidth: 800, margin: '0 auto', mb: 6, fontSize: '1.1rem' }}>
echo               Plan your trips while ensuring compliance with FMCSA regulations. 
echo               Automatically generate daily log sheets and calculate required rest stops.
echo             </Typography>
echo             <Button
echo               variant="contained"
echo               size="large"
echo               endIcon={<PlayArrowIcon />}
echo               onClick={() => navigate('/trip')}
echo               sx={{
echo                 backgroundColor: 'white',
echo                 color: '#1a365d',
echo                 '&:hover': {
echo                   backgroundColor: '#f7fafc',
echo                 },
echo                 px: 4,
echo                 py: 1.5,
echo                 fontSize: '1.1rem',
echo               }}
echo             >
echo               Start Planning Your Trip
echo             </Button>
echo           </Paper>
echo         </Grid>
echo         
echo         <Grid item xs={12}>
echo           <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
echo             Key Features
echo           </Typography>
echo           <Grid container spacing={4}>
echo             {features.map((feature, index) => (
echo               <Grid item xs={12} sm={6} md={3} key={index}>
echo                 <Card sx={{ height: '100%', borderRadius: 2 }}>
echo                   <CardContent sx={{ textAlign: 'center', p: 3 }}>
echo                     <Box sx={{ color: 'primary.main', fontSize: 40, mb: 2 }}>
echo                       {feature.icon}
echo                     </Box>
echo                     <Typography variant="h6" gutterBottom>
echo                       {feature.title}
echo                     </Typography>
echo                     <Typography variant="body2" color="text.secondary">
echo                       {feature.description}
echo                     </Typography>
echo                   </CardContent>
echo                 </Card>
echo               </Grid>
echo             ))}
echo           </Grid>
echo         </Grid>
echo         
echo         <Grid item xs={12}>
echo           <Paper sx={{ p: 4, borderRadius: 2 }}>
echo             <Typography variant="h5" gutterBottom>
echo               How It Works
echo             </Typography>
echo             <List>
echo               <ListItem>
echo                 <ListItemIcon>
echo                   <CheckCircleIcon color="primary" />
echo                 </ListItemIcon>
echo                 <ListItemText 
echo                   primary="Enter Trip Details" 
echo                   secondary="Provide current location, pickup, drop-off locations, and current cycle hours"
echo                 />
echo               </ListItem>
echo               <ListItem>
echo                 <ListItemIcon>
echo                   <CheckCircleIcon color="primary" />
echo                 </ListItemIcon>
echo                 <ListItemText 
echo                   primary="Route Calculation" 
echo                   secondary="System calculates optimal route with required rest stops"
echo                 />
echo               </ListItem>
echo               <ListItem>
echo                 <ListItemIcon>
echo                   <CheckCircleIcon color="primary" />
echo                 </ListItemIcon>
echo                 <ListItemText 
echo                   primary="Log Generation" 
echo                   secondary="Automatically generate FMCSA-compliant daily log sheets"
echo                 />
echo               </ListItem>
echo               <ListItem>
echo                 <ListItemIcon>
echo                   <CheckCircleIcon color="primary" />
echo                 </ListItemIcon>
echo                 <ListItemText 
echo                   primary="Export & Print" 
echo                   secondary="Download or print logs for your records"
echo                 />
echo               </ListItem>
echo             </List>
echo           </Paper>
echo         </Grid>
echo         
echo         <Grid item xs={12}>
echo           <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: '#f0f9ff' }}>
echo             <Typography variant="h6" gutterBottom>
echo               FMCSA Regulations Applied
echo             </Typography>
echo             <Grid container spacing={2}>
echo               <Grid item xs={12} md={4}>
echo                 <Typography variant="body2">
echo                   • 11-hour driving limit (14-hour on-duty limit)
echo                 </Typography>
echo               </Grid>
echo               <Grid item xs={12} md={4}>
echo                 <Typography variant="body2">
echo                   • 70-hour/8-day cycle limit
echo                 </Typography>
echo               </Grid>
echo               <Grid item xs={12} md={4}>
echo                 <Typography variant="body2">
echo                   • 30-minute break after 8 hours of driving
echo                 </Typography>
echo               </Grid>
echo               <Grid item xs={12} md={4}>
echo                 <Typography variant="body2">
echo                   • 10-hour off-duty requirement
echo                 </Typography>
echo               </Grid>
echo               <Grid item xs={12} md={4}>
echo                 <Typography variant="body2">
echo                   • Fuel stops every 1,000 miles
echo                 </Typography>
echo               </Grid>
echo               <Grid item xs={12} md={4}>
echo                 <Typography variant="body2">
echo                   • 1-hour pickup/drop-off time
echo                 </Typography>
echo               </Grid>
echo             </Grid>
echo           </Paper>
echo         </Grid>
echo       </Grid>
echo     </Container>
echo   );
echo };
echo.
echo export default HomePage;
) > HomePage.jsx