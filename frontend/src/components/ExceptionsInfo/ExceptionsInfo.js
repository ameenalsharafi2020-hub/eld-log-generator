import React, { useState } from 'react';
import './ExceptionsInfo.css';
import { 
  FaInfoCircle, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const ExceptionsInfo = ({ exceptions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // FMCSA exceptions from Appendix A
  const allExceptions = [
    {
      id: 'short-haul-cdl',
      name: '150 Air-Mile Radius (CDL)',
      cfr: '§395.1(e)(1)',
      description: 'Exception for CDL drivers operating within 150 air-mile radius',
      conditions: [
        'Return to work location within 14 consecutive hours',
        'Stay within 150 air-mile radius',
        '10+ hours off duty between shifts',
        'Employer maintains time records for 6 months'
      ],
      benefits: [
        'No ELD or logbook required',
        '30-minute break not required',
        'Time records instead of RODS'
      ],
      page: 'Page 12',
      category: 'short-haul'
    },
    {
      id: 'short-haul-non-cdl',
      name: '150 Air-Mile Radius (Non-CDL)',
      cfr: '§395.1(e)(2)',
      description: 'Exception for non-CDL drivers operating short distances',
      conditions: [
        'Vehicle does not require CDL',
        'Work within 150 air-mile radius',
        'Return to work location daily',
        'Specific hour limitations apply'
      ],
      benefits: [
        'No logbook required',
        '16-hour window allowed twice per week',
        'Time records maintained by employer'
      ],
      page: 'Page 13',
      category: 'short-haul'
    },
    {
      id: 'adverse-conditions',
      name: 'Adverse Driving Conditions',
      cfr: '§395.1(b)(1)',
      description: 'Allows extra driving time for unexpected conditions',
      conditions: [
        'Conditions could not be anticipated',
        'Not typical rush hour traffic',
        'Driver must annotate in RODS'
      ],
      benefits: [
        'Up to 2 additional hours driving',
        'Extension of 14-hour window by 2 hours',
        'Complete current run despite conditions'
      ],
      page: 'Page 12',
      category: 'conditions'
    },
    {
      id: '16-hour',
      name: '16-Hour Short-Haul',
      cfr: '§395.1(o)',
      description: 'Extend driving window to 16 hours once per week',
      conditions: [
        'Return to work reporting location',
        'Released within 16 hours',
        'Once every 7 consecutive days',
        'Not eligible for non-CDL exception'
      ],
      benefits: [
        'Extend 14-hour window to 16 hours',
        'Once every 7 consecutive days',
        'After 34-hour restart can use again'
      ],
      page: 'Page 14',
      category: 'short-haul'
    },
    {
      id: 'agricultural',
      name: 'Agricultural Operations',
      cfr: '§395.1(k)',
      description: 'Exemption for transporting agricultural commodities',
      conditions: [
        'Transporting agricultural commodities',
        'Within 150 air-miles of source',
        'During planting/harvesting season'
      ],
      benefits: [
        'Exempt from HOS regulations',
        'Within specified distance',
        'Seasonal application'
      ],
      page: 'Page 21',
      category: 'special'
    },
    {
      id: 'construction',
      name: 'Construction Materials',
      cfr: '§395.1(m)',
      description: 'Exception for construction material transportation',
      conditions: [
        'Transporting construction materials',
        'Within 75 air-mile radius',
        'To/from active construction site',
        'No placarded hazmat'
      ],
      benefits: [
        '24-hour restart available',
        'Limited distance requirements',
        'Construction site operations'
      ],
      page: 'Page 22',
      category: 'special'
    }
  ];
  
  const filteredExceptions = allExceptions.filter(exception => {
    const matchesSearch = exception.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exception.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exception.cfr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || exception.category === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  const isExceptionApplicable = (exceptionId) => {
    if (!exceptions) return false;
    return exceptions.some(e => e.name.includes(exceptionId));
  };
  
  return (
    <div className="exceptions-container">
      <div className="exceptions-header">
        <h2>📋 FMCSA HOS Exceptions</h2>
        <p className="subtitle">
          Based on Appendix A (Pages 20-26) of the FMCSA HOS Guide
        </p>
      </div>
      
      <div className="controls-row">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search exceptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Exceptions
          </button>
          <button 
            className={`filter-btn ${filter === 'short-haul' ? 'active' : ''}`}
            onClick={() => setFilter('short-haul')}
          >
            Short-Haul
          </button>
          <button 
            className={`filter-btn ${filter === 'conditions' ? 'active' : ''}`}
            onClick={() => setFilter('conditions')}
          >
            Conditions
          </button>
          <button 
            className={`filter-btn ${filter === 'special' ? 'active' : ''}`}
            onClick={() => setFilter('special')}
          >
            Special Operations
          </button>
        </div>
      </div>
      
      {/* Applicable Exceptions */}
      {exceptions && exceptions.length > 0 && (
        <div className="applicable-section">
          <h3>
            <FaCheckCircle className="icon applicable" />
            Applicable to Your Trip
          </h3>
          <div className="applicable-grid">
            {exceptions.map((exception, index) => (
              <div key={index} className="exception-card applicable">
                <div className="exception-header">
                  <h4>{exception.name}</h4>
                  <span className="cfr-badge">{exception.cfr_section}</span>
                </div>
                <p className="exception-desc">{exception.description}</p>
                <div className="exception-benefits">
                  <strong>Benefits:</strong>
                  <ul>
                    {exception.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* All Exceptions List */}
      <div className="all-exceptions-section">
        <h3>
          <FaInfoCircle className="icon" />
          All FMCSA HOS Exceptions
        </h3>
        
        <div className="exceptions-grid">
          {filteredExceptions.map((exception) => {
            const isApplicable = isExceptionApplicable(exception.id);
            
            return (
              <div 
                key={exception.id} 
                className={`exception-card ${isApplicable ? 'highlighted' : ''}`}
              >
                <div className="exception-header">
                  <h4>{exception.name}</h4>
                  <div className="header-right">
                    <span className="cfr-badge">{exception.cfr}</span>
                    <span className="page-badge">{exception.page}</span>
                    {isApplicable && (
                      <span className="applicable-badge">
                        <FaCheckCircle /> Applicable
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="exception-desc">{exception.description}</p>
                
                <div className="exception-details">
                  <div className="detail-section">
                    <strong>Conditions:</strong>
                    <ul>
                      {exception.conditions.map((condition, idx) => (
                        <li key={idx}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="detail-section">
                    <strong>Benefits:</strong>
                    <ul>
                      {exception.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="exception-footer">
                  <span className="category-badge">{exception.category}</span>
                  <button className="learn-more-btn">
                    Learn More
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredExceptions.length === 0 && (
          <div className="no-results">
            <FaExclamationTriangle />
            <p>No exceptions found matching your search criteria.</p>
          </div>
        )}
      </div>
      
      {/* Exception Statistics */}
      <div className="exception-stats">
        <div className="stat-card">
          <div className="stat-number">{allExceptions.length}</div>
          <div className="stat-label">Total Exceptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {exceptions ? exceptions.length : 0}
          </div>
          <div className="stat-label">Applicable to Trip</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">6</div>
          <div className="stat-label">Short-Haul Related</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">20+</div>
          <div className="stat-label">Pages in Appendix A</div>
        </div>
      </div>
      
      {/* Important Notes */}
      <div className="important-notes">
        <h4>
          <FaExclamationTriangle className="icon warning" />
          Important Notes About Exceptions
        </h4>
        <div className="notes-content">
          <p>
            <strong>Documentation Required:</strong> Even when using exceptions, 
            motor carriers must maintain accurate time records for at least 
            6 months as specified in §395.8.
          </p>
          <p>
            <strong>State Variations:</strong> Some states may have additional 
            restrictions or different interpretations of these exceptions. 
            Always check state-specific regulations for intrastate commerce.
          </p>
          <p>
            <strong>Safety First:</strong> Exceptions do not relieve drivers 
            or carriers from the responsibility to operate safely. Fatigue 
            management should always be the priority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExceptionsInfo;