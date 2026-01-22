import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './EldLogs.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EldLogs = ({ logs }) => {
  const formatTime = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  const renderTimeline = (activities) => {
    const timeline = Array(24).fill('off-duty');
    
    activities.forEach(activity => {
      const startHour = parseInt(activity.start.split(':')[0]);
      const endHour = parseInt(activity.end.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        if (hour >= 0 && hour < 24) {
          timeline[hour] = activity.status;
        }
      }
    });
    
    return timeline;
  };

  const getStatusColor = (status) => {
    const colors = {
      'off_duty': '#4CAF50',      // Green
      'sleeper_berth': '#2196F3', // Blue
      'driving': '#F44336',       // Red
      'on_duty': '#FFC107',       // Yellow
    };
    return colors[status] || '#9E9E9E';
  };

  // Prepare data for charts
  const chartData = {
    labels: logs.map(log => `Day ${log.day_number}`),
    datasets: [
      {
        label: 'Driving Hours',
        data: logs.map(log => log.driving_hours),
        backgroundColor: '#F44336',
        borderColor: '#D32F2F',
        borderWidth: 1,
      },
      {
        label: 'On-Duty Hours',
        data: logs.map(log => log.on_duty_hours),
        backgroundColor: '#FFC107',
        borderColor: '#FFA000',
        borderWidth: 1,
      },
      {
        label: 'Off-Duty Hours',
        data: logs.map(log => log.off_duty_hours),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily HOS Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 24,
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
  };

  return (
    <div className="eld-logs-container">
      <h2>📋 Electronic Logging Device (ELD) Records</h2>
      <p className="subtitle">
        Generated according to FMCSA HOS Regulations (49 CFR §395)
      </p>
      
      {/* Summary Chart */}
      <div className="summary-chart">
        <Bar data={chartData} options={chartOptions} />
      </div>
      
      {/* Individual Day Logs */}
      {logs.map((log, index) => (
        <div key={index} className="log-day-card">
          <div className="log-day-header">
            <h3>Day {log.day_number} - {log.date}</h3>
            <div className={`compliance-badge ${log.compliance.is_compliant ? 'compliant' : 'non-compliant'}`}>
              {log.compliance.is_compliant ? '✅ Compliant' : '⚠️ Violations'}
            </div>
          </div>
          
          <div className="log-summary">
            <div className="summary-item">
              <span className="label">Driving:</span>
              <span className={`value ${log.driving_hours > 11 ? 'exceeded' : ''}`}>
                {formatTime(log.driving_hours)} / 11 hours max
              </span>
            </div>
            <div className="summary-item">
              <span className="label">On-Duty:</span>
              <span className={`value ${log.on_duty_hours > 14 ? 'exceeded' : ''}`}>
                {formatTime(log.on_duty_hours)} / 14 hours max
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Off-Duty:</span>
              <span className={`value ${log.off_duty_hours < 10 ? 'exceeded' : ''}`}>
                {formatTime(log.off_duty_hours)} / 10 hours min
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Cycle (8-day):</span>
              <span className={`value ${log.cycle_8day_total > 70 ? 'exceeded' : ''}`}>
                {formatTime(log.cycle_8day_total)} / 70 hours max
              </span>
            </div>
          </div>
          
          {/* 24-Hour Timeline */}
          <div className="timeline-section">
            <h4>24-Hour Activity Timeline</h4>
            <div className="timeline">
              {renderTimeline(log.activities).map((status, hour) => (
                <div key={hour} className="timeline-hour">
                  <div 
                    className="timeline-block"
                    style={{ backgroundColor: getStatusColor(status) }}
                    title={`${hour}:00 - ${status.replace('_', ' ')}`}
                  >
                    {hour % 3 === 0 ? hour : ''}
                  </div>
                  {hour % 3 === 0 && (
                    <div className="hour-label">{hour}:00</div>
                  )}
                </div>
              ))}
            </div>
            <div className="timeline-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
                <span>Driving</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FFC107' }}></div>
                <span>On Duty</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
                <span>Off Duty</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#2196F3' }}></div>
                <span>Sleeper Berth</span>
              </div>
            </div>
          </div>
          
          {/* Detailed Activities */}
          <div className="activities-section">
            <h4>Detailed Activities</h4>
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Duration</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {log.activities.map((activity, idx) => (
                  <tr key={idx} className={`activity-row ${activity.status}`}>
                    <td>
                      <span className="status-badge">
                        {activity.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{activity.start}</td>
                    <td>{activity.end}</td>
                    <td>{formatTime(activity.duration)}</td>
                    <td>{activity.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Remarks */}
          {log.remarks && log.remarks.length > 0 && (
            <div className="remarks-section">
              <h4>Remarks</h4>
              <div className="remarks-list">
                {log.remarks.map((remark, idx) => (
                  <div key={idx} className="remark-item">
                    <span className="remark-time">{remark.time}</span>
                    <span className="remark-location">{remark.location}:</span>
                    <span className="remark-description">{remark.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Compliance Status */}
          {!log.compliance.is_compliant && (
            <div className="violations-section">
              <h4>⚠️ HOS Violations Detected</h4>
              <ul className="violations-list">
                {log.compliance.violations.map((violation, idx) => (
                  <li key={idx}>
                    <strong>{violation.rule}:</strong> {violation.actual}h vs {violation.limit}h limit
                    {violation.action && ` - ${violation.action}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {log.requires_restart && (
            <div className="restart-warning">
              ⚠️ <strong>34-Hour Restart Required:</strong> Driver has reached/exceeded 70-hour/8-day limit
            </div>
          )}
        </div>
      ))}
      
      {/* Export Options */}
      <div className="export-section">
        <h3>Export ELD Logs</h3>
        <div className="export-buttons">
          <button className="btn btn-outline">📄 Download PDF</button>
          <button className="btn btn-outline">📋 Print Logs</button>
          <button className="btn btn-outline">💾 Save to Database</button>
          <button className="btn btn-outline">📧 Email Report</button>
        </div>
      </div>
    </div>
  );
};

export default EldLogs;