import React, { useState, useRef } from 'react';
import { UserPlus, Users, Trash2, User, Search, Filter, Eye, EyeOff, Camera, CameraOff, Check, X } from 'lucide-react';
import { Student } from '../types';

interface StudentRegistryProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'registeredAt' | 'isActive'>) => void;
  onRemoveStudent: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const StudentRegistry: React.FC<StudentRegistryProps> = ({
  students,
  onAddStudent,
  onRemoveStudent,
  onToggleStatus
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      alert('Failed to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoData);
    stopCamera();
    setShowCamera(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onAddStudent({
        name: name.trim(),
        email: email.trim(),
        studentId: studentId.trim() || undefined,
        department: department.trim() || undefined,
        year: year.trim() || undefined,
        photo: capturedPhoto || undefined
      });
      setName('');
      setEmail('');
      setStudentId('');
      setDepartment('');
      setYear('');
      setCapturedPhoto(null);
    }
  };

  const handleCameraOpen = () => {
    setShowCamera(true);
    setTimeout(() => startCamera(), 100);
  };

  const handleCameraClose = () => {
    stopCamera();
    setShowCamera(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && student.isActive) ||
                         (filterStatus === 'inactive' && !student.isActive);

    return matchesSearch && matchesFilter;
  });

  const activeCount = students.filter(s => s.isActive).length;
  const inactiveCount = students.filter(s => !s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <Users size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Students</p>
              <p className="text-3xl font-bold">{activeCount}</p>
            </div>
            <Eye size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">Inactive Students</p>
              <p className="text-3xl font-bold">{inactiveCount}</p>
            </div>
            <EyeOff size={32} className="text-gray-200" />
          </div>
        </div>
      </div>

      {/* Add Student Form */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <UserPlus className="text-blue-600" size={28} />
          Add New Student
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="student@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., STU001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year/Grade
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., 2024, Grade 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Face Photo *
              </label>
              {capturedPhoto ? (
                <div className="relative">
                  <img
                    src={capturedPhoto}
                    alt="Student face"
                    className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCameraOpen}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  <Camera size={20} />
                  Capture Face Photo
                </button>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={!capturedPhoto}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
          >
            <UserPlus size={20} />
            Add Student
          </button>
        </form>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Capture Face Photo</h3>
              <button
                onClick={handleCameraClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover"
              />
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-green-400 rounded-lg">
                    <div className="absolute -top-6 left-0 bg-green-400 text-white px-2 py-1 rounded text-sm">
                      Position your face in the frame
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCameraClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                disabled={!cameraActive}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            Student Registry
          </h2>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Students</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {searchTerm || filterStatus !== 'all' ? 'No students match your criteria' : 'No students registered'}
              </p>
              <p className="text-sm">
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Add students to start tracking attendance'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  student.isActive
                    ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    : 'bg-gray-50 border-gray-300 opacity-75'
                }`}
              >
                <div className="flex items-center gap-4">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      student.isActive ? 'bg-blue-600' : 'bg-gray-500'
                    }`}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{student.name}</h3>
                      {!student.isActive && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                      {student.photo && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                          Face Registered
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      {student.studentId && <span>ID: {student.studentId}</span>}
                      {student.department && <span>Dept: {student.department}</span>}
                      {student.year && <span>Year: {student.year}</span>}
                      <span>Registered: {student.registeredAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleStatus(student.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      student.isActive
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    title={student.isActive ? 'Deactivate student' : 'Activate student'}
                  >
                    {student.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => onRemoveStudent(student.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Remove student"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
