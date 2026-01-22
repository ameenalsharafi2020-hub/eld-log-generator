import React, { useState } from 'react';
import './App.css';
import TripForm from './components/TripForm/TripForm';
import MapView from './components/MapView/MapView';
import EldLogs from './components/EldLogs/EldLogs';
import ComplianceCheck from './components/ComplianceCheck/ComplianceCheck';
import ExceptionsInfo from './components/ExceptionsInfo/ExceptionsInfo';
//import Header from './components/Header/Header';
//import Footer from './components/Footer/Footer';

function App() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTripSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Here you would make the API call to your Django backend
      const response = await fetch('/api/trip/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate trip');
      }

      const data = await response.json();
      setTripData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTripData(null);
    setError(null);
  };

  return (
    <div className="App">
       <header className="header">
        <div className="logo-container">
          <div className="logo-icon">
            <span>🚛</span>
            <span>⏰</span>
          </div>
          <div className="logo-text">
            <h1>FMCSA ELD Log Generator</h1>
            <p className="logo-subtitle">
              Hours of Service Compliance Tool • 49 CFR §395
            </p>
          </div>
        </div>
      </header>
      
      <main className="container">
        {!tripData ? (
          <div className="input-section">
            <h2>Plan Your Trip & Generate ELD Logs</h2>
            <p className="subtitle">
              Enter trip details to generate FMCSA-compliant ELD logs based on Hours of Service regulations
            </p>
            
            <TripForm 
              onSubmit={handleTripSubmit} 
              loading={loading}
            />
            
            {error && (
              <div className="error-alert">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="info-box">
              <h3>📋 Assumptions (Based on FMCSA PDF):</h3>
              <ul>
                <li>Property-carrying driver, 70hrs/8days schedule</li>
                <li>No adverse driving conditions (unless specified)</li>
                <li>Fueling at least once every 1,000 miles (1 hour stop)</li>
                <li>1 hour for pickup and 1 hour for drop-off</li>
                <li>Based on FMCSA regulations from provided PDF</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <h2>Trip Plan & ELD Logs Generated</h2>
              <button onClick={handleReset} className="btn btn-secondary">
                Plan Another Trip
              </button>
            </div>
            
            <div className="grid-container">
              <div className="map-section">
                <MapView route={tripData.route} />
              </div>
              
              <div className="compliance-section">
                <ComplianceCheck 
                  summary={tripData.compliance_summary} 
                  legalReferences={tripData.legal_references}
                />
              </div>
              
              <div className="exceptions-section">
                <ExceptionsInfo exceptions={tripData.exceptions} />
              </div>
              
              <div className="logs-section">
                <EldLogs logs={tripData.eld_logs} />
              </div>
            </div>
          </div>
        )}
      </main>
      
        <footer className="footer">
        <div className="footer-content">
          <p>FMCSA ELD Log Generator • Based on Hours of Service Regulations (49 CFR Part 395)</p>
          <p className="disclaimer">
            This tool is for educational purposes. Always verify compliance with current regulations.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;