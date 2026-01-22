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
//import  XLSX from 'xlsx';
//import jsPDF from 'jspdf';
//import 'jspdf-autotable';

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

  // وظائف التصدير
/*  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPos = 10;

    // عنوان التقرير
    doc.setFontSize(18);
    doc.text('Electronic Logging Device (ELD) Report', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPos);
    yPos += 15;

    // ملخص البيانات
    doc.setFontSize(14);
    doc.text('Summary Statistics', 14, yPos);
    yPos += 8;

    const summaryData = logs.map(log => [
      `Day ${log.day_number}`,
      log.date,
      formatTime(log.driving_hours),
      formatTime(log.on_duty_hours),
      formatTime(log.off_duty_hours),
      log.compliance.is_compliant ? 'Compliant' : 'Violations'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Day', 'Date', 'Driving', 'On-Duty', 'Off-Duty', 'Compliance']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // تفاصيل كل يوم
    logs.forEach((log, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 10;
      }

      doc.setFontSize(14);
      doc.text(`Day ${log.day_number} - ${log.date}`, 14, yPos);
      yPos += 10;

      // جدول الأنشطة
      const activityData = log.activities.map(activity => [
        activity.status.replace('_', ' '),
        activity.start,
        activity.end,
        formatTime(activity.duration),
        activity.description
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Status', 'Start', 'End', 'Duration', 'Description']],
        body: activityData,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94], textColor: 255 }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // المخالفات إذا وجدت
      if (!log.compliance.is_compliant) {
        doc.setFontSize(12);
        doc.setTextColor(231, 76, 60);
        doc.text('HOS Violations Detected:', 14, yPos);
        yPos += 7;

        log.compliance.violations.forEach((violation, idx) => {
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.text(`• ${violation.rule}: ${violation.actual}h vs ${violation.limit}h limit`, 20, yPos);
          yPos += 5;
        });
        yPos += 10;
      }
    });

    // حفظ الملف
    doc.save(`ELD_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };
*/
  const exportToExcel = () => {
    // إنشاء مصنف Excel
   // const wb = XLSX.utils.book_new();
    
    // ورقة الملخص
    const summaryData = [
      ['ELD Logs Summary Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['Day', 'Date', 'Driving Hours', 'On-Duty Hours', 'Off-Duty Hours', 'Cycle Total (8-day)', 'Compliance', 'Violations Count']
    ];

    logs.forEach(log => {
      summaryData.push([
        `Day ${log.day_number}`,
        log.date,
        log.driving_hours,
        log.on_duty_hours,
        log.off_duty_hours,
        log.cycle_8day_total,
        log.compliance.is_compliant ? 'Compliant' : 'Non-Compliant',
        log.compliance.violations.length
      ]);
    });

  //  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  //  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // ورقة لكل يوم
    logs.forEach((log, index) => {
      const dayData = [
        [`Day ${log.day_number} - ${log.date}`],
        ['Compliance:', log.compliance.is_compliant ? 'Compliant' : 'Non-Compliant'],
        ['Driving Hours:', log.driving_hours],
        ['On-Duty Hours:', log.on_duty_hours],
        ['Off-Duty Hours:', log.off_duty_hours],
        ['Cycle Total (8-day):', log.cycle_8day_total],
        [],
        ['Activities'],
        ['Status', 'Start Time', 'End Time', 'Duration (hours)', 'Description']
      ];

      log.activities.forEach(activity => {
        dayData.push([
          activity.status.replace('_', ' '),
          activity.start,
          activity.end,
          activity.duration,
          activity.description
        ]);
      });

      dayData.push([]);
      dayData.push(['Remarks']);
      dayData.push(['Time', 'Location', 'Description']);

      if (log.remarks && log.remarks.length > 0) {
        log.remarks.forEach(remark => {
          dayData.push([remark.time, remark.location, remark.description]);
        });
      }

     // const wsDay = XLSX.utils.aoa_to_sheet(dayData);
     // XLSX.utils.book_append_sheet(wb, wsDay, `Day_${log.day_number}`);
    });

    // حفظ الملف
   // XLSX.writeFile(wb, `ELD_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printLogs = () => {
    const printContent = document.querySelector('.eld-logs-container');
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.outerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const saveToDatabase = async () => {
    try {
      // هنا يمكنك إضافة كود الحفظ إلى قاعدة البيانات
      const reportData = {
        logs,
        generatedAt: new Date().toISOString(),
        totalDays: logs.length,
        complianceStatus: logs.every(log => log.compliance.is_compliant) ? 'Compliant' : 'Has Violations'
      };

      // مثال للاتصال بقاعدة البيانات
      // const response = await fetch('/api/save-eld-logs', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(reportData)
      // });

      // if (response.ok) {
      alert('ELD logs saved to database successfully!');
      // } else {
      //   throw new Error('Failed to save logs');
      // }
    } catch (error) {
      alert(`Error saving to database: ${error.message}`);
    }
  };

  const emailReport = () => {
    const emailSubject = `ELD Report - ${new Date().toLocaleDateString()}`;
    const emailBody = `
ELD Report Summary
Generated: ${new Date().toLocaleString()}
Total Days: ${logs.length}

Summary:
${logs.map(log => 
  `Day ${log.day_number} (${log.date}):
  Driving: ${formatTime(log.driving_hours)}
  On-Duty: ${formatTime(log.on_duty_hours)}
  Off-Duty: ${formatTime(log.off_duty_hours)}
  Compliance: ${log.compliance.is_compliant ? 'Compliant' : 'Violations'}
  ${!log.compliance.is_compliant ? `Violations: ${log.compliance.violations.map(v => v.rule).join(', ')}` : ''}
  `
).join('\n')}

This report was generated automatically from the ELD system.
    `.trim();

    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
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
          <button className="btn btn-outline" onClick={exportToPDF}>
            📄 Download PDF
          </button>
          <button className="btn btn-outline" onClick={printLogs}>
            📋 Print Logs
          </button>
          <button className="btn btn-outline" onClick={exportToExcel}>
            📊 Export to Excel
          </button>
          <button className="btn btn-outline" onClick={saveToDatabase}>
            💾 Save to Database
          </button>
          <button className="btn btn-outline" onClick={emailReport}>
            📧 Email Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EldLogs;
