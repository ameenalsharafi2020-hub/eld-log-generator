import React from 'react';
import './ComplianceCheck.css';

const ComplianceCheck = ({ summary, legalReferences }) => {
  return (
    <div className="compliance-container">
      <h2>⚖️ HOS Compliance Check</h2>
      
      <div className={`compliance-status ${summary.is_compliant ? 'compliant' : 'non-compliant'}`}>
        <div className="status-header">
          <h3>
            {summary.is_compliant ? '✅ COMPLIANT' : '⚠️ NON-COMPLIANT'}
          </h3>
          <div className="status-badge">
            {summary.violation_count} violation(s)
          </div>
        </div>
        
        <div className="status-summary">
          <p>
            {summary.is_compliant 
              ? 'Trip plan is fully compliant with FMCSA Hours of Service regulations.'
              : 'Trip plan has violations that must be addressed before dispatch.'
            }
          </p>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{summary.total_trip_hours?.toFixed(1) || '0'}</div>
          <div className="metric-label">Total Driving Hours</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{summary.total_days || '0'}</div>
          <div className="metric-label">Days Required</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{summary.violation_count || '0'}</div>
          <div className="metric-label">HOS Violations</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {summary.requires_34hr_restart ? 'Yes' : 'No'}
          </div>
          <div className="metric-label">34-Hour Restart</div>
        </div>
      </div>
      
      {/* Violations List */}
      {summary.violations && summary.violations.length > 0 && (
        <div className="violations-list">
          <h4>⚠️ Detected Violations</h4>
          <ul>
            {summary.violations.map((violation, index) => (
              <li key={index} className="violation-item">
                <strong>{violation.rule}:</strong> {violation.actual}h vs {violation.limit}h limit
                {violation.action && <span className="action"> - {violation.action}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* HOS Rules Summary */}
      <div className="rules-summary">
        <h4>📋 Applied HOS Rules (Property-Carrying)</h4>
        <div className="rules-grid">
          <div className="rule-item">
            <div className="rule-icon">⏰</div>
            <div className="rule-content">
              <strong>11-Hour Driving Limit</strong>
              <small>§395.3(a)(3) - Max 11 hours driving after 10+ hours off</small>
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-icon">🪟</div>
            <div className="rule-content">
              <strong>14-Hour Driving Window</strong>
              <small>§395.3(a)(2) - Max 14 consecutive hours on duty</small>
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-icon">☕</div>
            <div className="rule-content">
              <strong>30-Minute Break</strong>
              <small>§395.3(a)(3)(ii) - Required after 8 hours driving</small>
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-icon">📅</div>
            <div className="rule-content">
              <strong>70-Hour/8-Day Limit</strong>
              <small>§395.3(b) - Max 70 hours on duty in 8 consecutive days</small>
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-icon">🛌</div>
            <div className="rule-content">
              <strong>10-Hour Off Duty</strong>
              <small>§395.3(a)(1) - Min 10 consecutive hours off duty</small>
            </div>
          </div>
          <div className="rule-item">
            <div className="rule-icon">🔄</div>
            <div className="rule-content">
              <strong>34-Hour Restart</strong>
              <small>§395.3(c) - Resets 70-hour clock after 34+ hours off</small>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legal References */}
      {legalReferences && (
        <div className="legal-references">
          <h4>📚 FMCSA Legal References</h4>
          <div className="references-list">
            {legalReferences.map((ref, index) => (
              <div key={index} className="reference-item">
                <div className="reference-section">{ref.section}</div>
                <div className="reference-title">{ref.title}</div>
                <div className="reference-source">{ref.reference}</div>
              </div>
            ))}
          </div>
          <div className="reference-note">
            <small>
              Based on FMCSA Hours of Service Regulations (49 CFR Part 395) from provided PDF document
            </small>
          </div>
        </div>
      )}
      
      {/* Compliance Actions */}
      <div className="compliance-actions">
        <h4>Recommended Actions</h4>
        <div className="actions-list">
          {summary.is_compliant ? (
            <div className="action-item success">
              <div className="action-icon">✅</div>
              <div className="action-content">
                <strong>Ready for Dispatch</strong>
                <small>Trip plan is compliant with all HOS regulations</small>
              </div>
            </div>
          ) : (
            <>
              <div className="action-item warning">
                <div className="action-icon">⚠️</div>
                <div className="action-content">
                  <strong>Review Violations</strong>
                  <small>Address identified HOS violations before dispatch</small>
                </div>
              </div>
              {summary.requires_34hr_restart && (
                <div className="action-item critical">
                  <div className="action-icon">🔄</div>
                  <div className="action-content">
                    <strong>Schedule 34-Hour Restart</strong>
                    <small>Driver has exceeded 70-hour/8-day limit</small>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="action-item info">
            <div className="action-icon">📋</div>
            <div className="action-content">
              <strong>Maintain ELD Records</strong>
              <small>Keep logs for minimum 6 months as required by §395.8</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCheck;