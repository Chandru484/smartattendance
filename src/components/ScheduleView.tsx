import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Edit3, Trash2 } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  students: string[];
  location?: string;
  description?: string;
}

interface ScheduleViewProps {
  students: Student[];
  records: AttendanceRecord[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ students, records }) => {
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: 'Morning Assembly',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '09:30',
      students: students.slice(0, 5).map(s => s.id),
      location: 'Main Hall',
      description: 'Daily morning assembly for all students'
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    students: [] as string[],
    location: '',
    description: ''
  });

  const handleAddEvent = () => {
    const newEvent: ScheduleEvent = {
      id: Date.now().toString(),
      ...formData
    };
    setEvents(prev => [...prev, newEvent]);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      students: [],
      location: '',
      description: ''
    });
    setShowAddForm(false);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setFormData(event);
    setShowAddForm(true);
  };

  const handleUpdateEvent = () => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...formData, id: editingEvent.id } : e));
      setEditingEvent(null);
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        students: [],
        location: '',
        description: ''
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const getAttendanceForEvent = (event: ScheduleEvent) => {
    const eventDate = new Date(event.date);
    const eventRecords = records.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate.toDateString() === eventDate.toDateString() &&
             event.students.includes(record.studentId);
    });
    return {
      present: new Set(eventRecords.map(r => r.studentId)).size,
      total: event.students.length
    };
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="text-blue-600" size={28} />
            Schedule & Events
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = getEventsForDate(dateStr);
              const isToday = date.toDateString() === today.toDateString();
              const isCurrentMonth = date.getMonth() === today.getMonth();
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-2 min-h-[80px] border border-gray-200 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'
                  } ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''} ${
                    isToday ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events for Selected Date */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Events for {new Date(selectedDate).toLocaleDateString()}
          </h3>

          <div className="space-y-4">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                <p>No events scheduled</p>
              </div>
            ) : (
              getEventsForDate(selectedDate).map(event => {
                const attendance = getAttendanceForEvent(event);
                return (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{event.title}</h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {event.startTime} - {event.endTime}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {event.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        {attendance.present}/{attendance.total} attended
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    )}

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${attendance.total > 0 ? (attendance.present / attendance.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Event description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Students ({formData.students.length} selected)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {students.map(student => (
                    <label key={student.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.students.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, students: [...prev.students, student.id] }));
                          } else {
                            setFormData(prev => ({ ...prev, students: prev.students.filter(id => id !== student.id) }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{student.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEvent(null);
                  setFormData({
                    title: '',
                    date: new Date().toISOString().split('T')[0],
                    startTime: '09:00',
                    endTime: '10:00',
                    students: [],
                    location: '',
                    description: ''
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                disabled={!formData.title || formData.students.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {editingEvent ? 'Update' : 'Add'} Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};