/*const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;*/

// frontend/src/reportWebVitals.js
// Comment out or simplify the file
const reportWebVitals = (onPerfEntry) => {
  // Simplified version - doesn't require web-vitals
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // You can add performance tracking here if needed
    // For now, just do nothing
  }
};

export default reportWebVitals;