import React, { useState, useEffect } from 'react';
import { Camera, CameraOff, UserCheck, Loader, Settings, AlertTriangle } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { simulateFaceRecognition } from '../utils/faceRecognition';
import { Student, AttendanceRecord, AttendanceSettings } from '../types';

interface CameraViewProps {
  students: Student[];
  settings: AttendanceSettings;
  onAttendanceMarked: (record: Omit<AttendanceRecord, 'id'>) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ students, settings, onAttendanceMarked }) => {
  const { videoRef, isActive, error, startCamera, stopCamera, captureFrame } = useCamera();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRecognition, setLastRecognition] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [autoMode, setAutoMode] = useState(settings.autoMarkingEnabled);
  const [confidenceThreshold, setConfidenceThreshold] = useState(settings.confidenceThreshold);

  // Simulate face detection overlay
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setFaceDetected(Math.random() > 0.4);
      
      // Auto-marking when face is detected and auto mode is enabled
      if (autoMode && Math.random() > 0.7 && !isProcessing) {
        handleRecognition();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, autoMode, isProcessing]);

  const handleRecognition = async () => {
    if (!isActive || isProcessing) return;

    setIsProcessing(true);
    const frameData = captureFrame();
    
    if (frameData) {
      try {
        const result = await simulateFaceRecognition(frameData, students, confidenceThreshold);
        
        if (result && result.confidence >= confidenceThreshold) {
          const record: Omit<AttendanceRecord, 'id'> = {
            studentId: result.student.id,
            studentName: result.student.name,
            timestamp: new Date(),
            confidence: result.confidence,
            photo: frameData,
            location: 'Main Campus',
            deviceInfo: navigator.userAgent.split(' ')[0]
          };

          onAttendanceMarked(record);
          setLastRecognition(result.student.name);
          
          setTimeout(() => setLastRecognition(null), 4000);
        } else if (result) {
          // Low confidence warning
          console.warn(`Low confidence recognition: ${result.confidence}`);
        }
      } catch (error) {
        console.error('Recognition failed:', error);
      }
    }
    
    setIsProcessing(false);
  };

  const isWithinWorkingHours = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = parseInt(settings.workingHours.start.split(':')[0]) * 60 + parseInt(settings.workingHours.start.split(':')[1]);
    const endTime = parseInt(settings.workingHours.end.split(':')[0]) * 60 + parseInt(settings.workingHours.end.split(':')[1]);
    return currentTime >= startTime && currentTime <= endTime;
  };

  return (
    <div className="space-y-6">
      {/* Camera Controls */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Camera Feed</h2>
          <div className="flex gap-3">
            {!isActive ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Camera size={20} />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <CameraOff size={20} />
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Working Hours Warning */}
        {!isWithinWorkingHours() && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="text-yellow-600" size={20} />
            <div>
              <p className="text-yellow-800 font-medium">Outside Working Hours</p>
              <p className="text-yellow-700 text-sm">
                Current working hours: {settings.workingHours.start} - {settings.workingHours.end}
              </p>
            </div>
          </div>
        )}

        <div className="relative">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <CameraOff className="mx-auto mb-4 text-red-500" size={48} />
              <p className="text-red-700 text-lg">{error}</p>
            </div>
          ) : (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover"
                style={{ display: isActive ? 'block' : 'none' }}
              />
              
              {!isActive && (
                <div className="w-full h-96 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Camera size={64} className="mx-auto mb-4" />
                    <p className="text-lg">Camera is off</p>
                    <p className="text-sm">Click "Start Camera" to begin</p>
                  </div>
                </div>
              )}

              {/* Face detection overlay */}
              {isActive && faceDetected && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-green-400 rounded-lg animate-pulse">
                    <div className="absolute -top-6 left-0 bg-green-400 text-white px-2 py-1 rounded text-sm">
                      Face Detected
                    </div>
                  </div>
                </div>
              )}

              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 text-center">
                    <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                    <p className="text-gray-700">Processing...</p>
                  </div>
                </div>
              )}

              {/* Success notification */}
              {lastRecognition && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-bounce">
                  <UserCheck size={20} />
                  <span>Welcome, {lastRecognition}!</span>
                </div>
              )}
            </div>
          )}

          {isActive && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleRecognition}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserCheck size={20} />
                      Mark Attendance
                    </>
                  )}
                </button>
              </div>

              {/* Camera Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Settings size={18} />
                  Camera Settings
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto Recognition</label>
                    <button
                      onClick={() => setAutoMode(!autoMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confidence Threshold: {Math.round(confidenceThreshold * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="0.95"
                      step="0.05"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Students</p>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Recognition Mode</p>
              <p className="text-lg font-semibold text-gray-800">
                {autoMode ? 'Automatic' : 'Manual'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Settings className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Confidence Level</p>
              <p className="text-lg font-semibold text-gray-800">
                {Math.round(confidenceThreshold * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Camera className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};