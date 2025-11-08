import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student, AttendanceRecord } from '../types';

export const useDatabase = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStudents: Student[] = (data || []).map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        studentId: student.student_id,
        department: student.department,
        year: student.year,
        photo: student.photo,
        registeredAt: new Date(student.created_at),
        isActive: student.is_active
      }));

      setStudents(formattedStudents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
      console.error('Error fetching students:', err);
    }
  };

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const formattedRecords: AttendanceRecord[] = (data || []).map(record => ({
        id: record.id,
        studentId: record.student_id,
        studentName: record.student_name,
        timestamp: new Date(record.timestamp),
        confidence: parseFloat(record.confidence),
        photo: record.photo,
        location: record.location,
        deviceInfo: record.device_info
      }));

      setRecords(formattedRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
      console.error('Error fetching records:', err);
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'registeredAt' | 'isActive'>) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: studentData.name,
          email: studentData.email,
          student_id: studentData.studentId,
          department: studentData.department,
          year: studentData.year,
          photo: studentData.photo,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchStudents();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add student');
      console.error('Error adding student:', err);
      throw err;
    }
  };

  const removeStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchStudents();
      await fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student');
      console.error('Error removing student:', err);
      throw err;
    }
  };

  const toggleStudentStatus = async (id: string) => {
    try {
      const student = students.find(s => s.id === id);
      if (!student) return;

      const { error } = await supabase
        .from('students')
        .update({ is_active: !student.isActive })
        .eq('id', id);

      if (error) throw error;

      await fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student status');
      console.error('Error updating student status:', err);
      throw err;
    }
  };

  const addAttendanceRecord = async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert([{
          student_id: record.studentId,
          student_name: record.studentName,
          timestamp: record.timestamp.toISOString(),
          confidence: record.confidence,
          photo: record.photo,
          location: record.location,
          device_info: record.deviceInfo
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchRecords();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add attendance record');
      console.error('Error adding attendance record:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudents(), fetchRecords()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    students,
    records,
    loading,
    error,
    addStudent,
    removeStudent,
    toggleStudentStatus,
    addAttendanceRecord,
    refreshStudents: fetchStudents,
    refreshRecords: fetchRecords
  };
};
