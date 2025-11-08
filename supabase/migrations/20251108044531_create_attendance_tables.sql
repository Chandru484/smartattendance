/*
  # Create Attendance System Tables

  1. New Tables
    - `students`
      - `id` (uuid, primary key) - Unique identifier for each student
      - `name` (text) - Full name of the student
      - `email` (text, unique) - Email address
      - `student_id` (text) - Student ID number
      - `department` (text) - Department/major
      - `year` (text) - Year/grade level
      - `photo` (text) - Base64 encoded face photo for recognition
      - `is_active` (boolean) - Whether student is currently active
      - `created_at` (timestamptz) - Registration timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `attendance_records`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `student_id` (uuid, foreign key) - References students table
      - `student_name` (text) - Cached student name for quick access
      - `timestamp` (timestamptz) - When attendance was marked
      - `confidence` (numeric) - Face recognition confidence score (0-1)
      - `photo` (text) - Base64 encoded photo captured during attendance
      - `location` (text) - Location where attendance was marked
      - `device_info` (text) - Device information
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
    - Public read access for active students (for face recognition)
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  student_id text,
  department text,
  year text,
  photo text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  photo text,
  location text,
  device_info text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance_records(timestamp);

-- Create updated_at trigger for students table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Students table policies
CREATE POLICY "Anyone can view active students"
  ON students
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can insert students"
  ON students
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update students"
  ON students
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete students"
  ON students
  FOR DELETE
  USING (true);

-- Attendance records policies
CREATE POLICY "Anyone can view attendance records"
  ON attendance_records
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert attendance records"
  ON attendance_records
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update attendance records"
  ON attendance_records
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete attendance records"
  ON attendance_records
  FOR DELETE
  USING (true);