import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './TripForm.css';

const TripForm = ({ onSubmit, loading }) => {
  const initialValues = {
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: '0',
    cmv_weight: '10001',
    requires_cdl: 'true',
    adverse_conditions: 'false',
    includes_hazmat: 'false',
    trip_type: 'interstate',
    state: ''
  };

  const validationSchema = Yup.object({
    current_location: Yup.string()
      .required('Current location is required')
      .min(2, 'Location must be at least 2 characters'),
    pickup_location: Yup.string()
      .required('Pickup location is required')
      .min(2, 'Location must be at least 2 characters'),
    dropoff_location: Yup.string()
      .required('Dropoff location is required')
      .min(2, 'Location must be at least 2 characters'),
    current_cycle_used: Yup.number()
      .min(0, 'Cannot be negative')
      .max(70, 'Cannot exceed 70 hours')
      .required('Current cycle hours are required'),
    cmv_weight: Yup.number()
      .min(10001, 'CMV must be at least 10,001 lbs')
      .required('CMV weight is required'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const formattedData = {
      ...values,
      current_cycle_used: parseInt(values.current_cycle_used),
      cmv_weight: parseInt(values.cmv_weight),
      requires_cdl: values.requires_cdl === 'true',
      adverse_conditions: values.adverse_conditions === 'true',
      includes_hazmat: values.includes_hazmat === 'true',
    };
    
    onSubmit(formattedData);
    setSubmitting(false);
  };

  return (
    <div className="trip-form-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="trip-form">
            <div className="form-section">
              <h3>📍 Trip Locations</h3>
              
              <div className="form-group">
                <label htmlFor="current_location">
                  Current Location *
                  <span className="tooltip" title="Where the trip starts (city, state)">
                    ℹ️
                  </span>
                </label>
                <Field 
                  type="text" 
                  id="current_location" 
                  name="current_location" 
                  placeholder="e.g., New York, NY"
                  className="form-control"
                />
                <ErrorMessage name="current_location" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="pickup_location">
                  Pickup Location *
                  <span className="tooltip" title="Where you will load cargo">
                    ℹ️
                  </span>
                </label>
                <Field 
                  type="text" 
                  id="pickup_location" 
                  name="pickup_location" 
                  placeholder="e.g., Philadelphia, PA"
                  className="form-control"
                />
                <ErrorMessage name="pickup_location" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="dropoff_location">
                  Dropoff Location *
                  <span className="tooltip" title="Final destination">
                    ℹ️
                  </span>
                </label>
                <Field 
                  type="text" 
                  id="dropoff_location" 
                  name="dropoff_location" 
                  placeholder="e.g., Chicago, IL"
                  className="form-control"
                />
                <ErrorMessage name="dropoff_location" component="div" className="error-message" />
              </div>
            </div>
            
            <div className="form-section">
              <h3>⚙️ HOS Status & Vehicle Info</h3>
              
              <div className="form-group">
                <label htmlFor="current_cycle_used">
                  Current Cycle Used (Hours) *
                  <span className="tooltip" title="Hours already used in current 8-day cycle (0-70)">
                    ℹ️
                  </span>
                </label>
                <Field 
                  type="number" 
                  id="current_cycle_used" 
                  name="current_cycle_used" 
                  min="0" 
                  max="70"
                  step="0.5"
                  className="form-control"
                />
                <div className="helper-text">
                  {values.current_cycle_used}/70 hours used in 8-day cycle
                </div>
                <ErrorMessage name="current_cycle_used" component="div" className="error-message" />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cmv_weight">
                    CMV Weight (lbs) *
                    <span className="tooltip" title="Must be ≥10,001 lbs or placarded hazmat">
                      ℹ️
                    </span>
                  </label>
                  <Field 
                    type="number" 
                    id="cmv_weight" 
                    name="cmv_weight" 
                    min="10001"
                    className="form-control"
                  />
                  <ErrorMessage name="cmv_weight" component="div" className="error-message" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="trip_type">Trip Type</label>
                  <Field as="select" id="trip_type" name="trip_type" className="form-control">
                    <option value="interstate">Interstate Commerce</option>
                    <option value="intrastate">Intrastate Commerce</option>
                  </Field>
                </div>
              </div>
              
              {values.trip_type === 'intrastate' && (
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <Field 
                    type="text" 
                    id="state" 
                    name="state" 
                    placeholder="e.g., CA"
                    className="form-control"
                  />
                </div>
              )}
            </div>
            
            <div className="form-section">
              <h3>🎯 Conditions & Exceptions</h3>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <Field type="checkbox" name="requires_cdl" value="true" checked={values.requires_cdl === 'true'} />
                  <span className="checkbox-custom"></span>
                  CMV Requires CDL
                </label>
                
                <label className="checkbox-label">
                  <Field type="checkbox" name="adverse_conditions" value="true" checked={values.adverse_conditions === 'true'} />
                  <span className="checkbox-custom"></span>
                  Adverse Driving Conditions Expected
                </label>
                
                <label className="checkbox-label">
                  <Field type="checkbox" name="includes_hazmat" value="true" checked={values.includes_hazmat === 'true'} />
                  <span className="checkbox-custom"></span>
                  Transporting Placarded Hazardous Materials
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={isSubmitting || loading}
                className="btn btn-primary btn-lg"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Generating ELD Logs...
                  </>
                ) : 'Generate ELD Logs & Trip Plan'}
              </button>
              
              <div className="form-note">
                <small>
                  ⚖️ Based on FMCSA HOS Regulations (49 CFR Part 395) from provided PDF
                </small>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TripForm;