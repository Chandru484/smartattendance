import { Student, AttendanceRecord } from '../types';

// Simulated face recognition for demo purposes
// In a real application, this would use a face recognition library like face-api.js or TensorFlow.js
export const simulateFaceRecognition = async (
  imageData: string,
  students: Student[],
  confidenceThreshold: number = 0.75
): Promise<{ student: Student; confidence: number } | null> => {
  // Filter students who have face photos registered
  const studentsWithPhotos = students.filter(s => s.photo);

  if (studentsWithPhotos.length === 0) {
    return null;
  }

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Simulate face matching by comparing image data
  // In production, this would use actual face recognition algorithms
  // For now, we'll use a simple pixel comparison simulation

  let bestMatch: { student: Student; confidence: number } | null = null;

  for (const student of studentsWithPhotos) {
    // Simulate face comparison with varying confidence levels
    // Higher confidence for students who were recently registered
    const timeSinceRegistration = Date.now() - student.registeredAt.getTime();
    const baseConfidence = 0.6 + Math.random() * 0.35;

    // Slightly favor more recently registered students (simulating better training data)
    const timeBonus = Math.max(0, 0.1 - (timeSinceRegistration / (1000 * 60 * 60 * 24 * 30))); // Decay over 30 days

    const confidence = Math.min(0.98, baseConfidence + timeBonus);

    if (confidence >= confidenceThreshold && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { student, confidence: parseFloat(confidence.toFixed(2)) };
    }
  }

  // Simulate occasional false negatives (face not detected/recognized)
  if (Math.random() < 0.15) {
    return null;
  }

  return bestMatch;
};

export const exportToCSV = (records: AttendanceRecord[]): void => {
  const headers = ['Student Name', 'Date', 'Time', 'Confidence', 'Location', 'Device'];
  const csvContent = [
    headers.join(','),
    ...records.map(record => [
      record.studentName,
      record.timestamp.toLocaleDateString(),
      record.timestamp.toLocaleTimeString(),
      `${(record.confidence * 100).toFixed(1)}%`,
      record.location || 'N/A',
      record.deviceInfo || 'N/A'
    ].join(','))
  ].join('\n');

  downloadFile(csvContent, `attendance_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const exportDetailedReport = (records: AttendanceRecord[], students: Student[]): void => {
  const studentMap = new Map(students.map(s => [s.id, s]));
  
  const headers = [
    'Student Name', 'Student ID', 'Email', 'Department', 'Year',
    'Date', 'Time', 'Confidence', 'Location', 'Device'
  ];
  
  const csvContent = [
    headers.join(','),
    ...records.map(record => {
      const student = studentMap.get(record.studentId);
      return [
        record.studentName,
        student?.studentId || 'N/A',
        student?.email || 'N/A',
        student?.department || 'N/A',
        student?.year || 'N/A',
        record.timestamp.toLocaleDateString(),
        record.timestamp.toLocaleTimeString(),
        `${(record.confidence * 100).toFixed(1)}%`,
        record.location || 'N/A',
        record.deviceInfo || 'N/A'
      ].join(',');
    })
  ].join('\n');

  downloadFile(csvContent, `detailed_attendance_report_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const generateAttendanceReport = (
  records: AttendanceRecord[], 
  students: Student[], 
  period: string
): void => {
  const studentMap = new Map(students.map(s => [s.id, s]));
  const attendanceMap = new Map<string, AttendanceRecord[]>();
  
  // Group records by student
  records.forEach(record => {
    const studentRecords = attendanceMap.get(record.studentId) || [];
    studentRecords.push(record);
    attendanceMap.set(record.studentId, studentRecords);
  });

  // Calculate statistics
  const reportData = students.map(student => {
    const studentRecords = attendanceMap.get(student.id) || [];
    const uniqueDays = new Set(studentRecords.map(r => r.timestamp.toDateString())).size;
    const avgConfidence = studentRecords.length > 0 
      ? studentRecords.reduce((sum, r) => sum + r.confidence, 0) / studentRecords.length 
      : 0;
    
    return {
      name: student.name,
      studentId: student.studentId || 'N/A',
      email: student.email,
      department: student.department || 'N/A',
      year: student.year || 'N/A',
      totalRecords: studentRecords.length,
      uniqueDays,
      avgConfidence: (avgConfidence * 100).toFixed(1),
      firstRecord: studentRecords.length > 0 
        ? new Date(Math.min(...studentRecords.map(r => r.timestamp.getTime()))).toLocaleDateString()
        : 'N/A',
      lastRecord: studentRecords.length > 0 
        ? new Date(Math.max(...studentRecords.map(r => r.timestamp.getTime()))).toLocaleDateString()
        : 'N/A'
    };
  });

  const headers = [
    'Student Name', 'Student ID', 'Email', 'Department', 'Year',
    'Total Records', 'Days Attended', 'Avg Confidence (%)',
    'First Record', 'Last Record'
  ];

  const csvContent = [
    `Attendance Report - ${period}`,
    `Generated on: ${new Date().toLocaleString()}`,
    `Total Students: ${students.length}`,
    `Total Records: ${records.length}`,
    '',
    headers.join(','),
    ...reportData.map(row => [
      row.name, row.studentId, row.email, row.department, row.year,
      row.totalRecords, row.uniqueDays, row.avgConfidence,
      row.firstRecord, row.lastRecord
    ].join(','))
  ].join('\n');

  downloadFile(csvContent, `attendance_report_${period}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};