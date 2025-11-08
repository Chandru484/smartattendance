import React, { useState } from 'react';
import { Settings, Save, Bell, Clock, Shield, Database, Download, Upload } from 'lucide-react';
import { AttendanceSettings } from '../types';

interface SettingsPanelProps {
  settings: AttendanceSettings;
  onUpdateSettings: (settings: AttendanceSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState<AttendanceSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof AttendanceSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleNestedChange = (parent: keyof AttendanceSettings, key: string, value: any) => {
    const newSettings = {
      ...localSettings,
      [parent]: {
        ...localSettings[parent],
        [key]: value
      }
    };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setHasChanges(false);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance-settings.json';
    link.click();
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setLocalSettings(importedSettings);
          setHasChanges(true);
        } catch (error) {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Settings className="text-blue-600" size={28} />
            System Settings
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleExportSettings}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={18} />
              Export
            </button>
            <label className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
              <Upload size={18} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </label>
            {hasChanges && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save size={18} />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recognition Settings */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Shield className="text-green-600" size={24} />
            Recognition Settings
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Auto Recognition</label>
                <p className="text-sm text-gray-500">Automatically mark attendance when face is detected</p>
              </div>
              <button
                onClick={() => handleChange('autoMarkingEnabled', !localSettings.autoMarkingEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.autoMarkingEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.autoMarkingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Confidence Threshold: {Math.round(localSettings.confidenceThreshold * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={localSettings.confidenceThreshold}
                onChange={(e) => handleChange('confidenceThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Higher values require more accurate face matches
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Allow Multiple Marking</label>
                <p className="text-sm text-gray-500">Allow students to mark attendance multiple times per day</p>
              </div>
              <button
                onClick={() => handleChange('allowMultipleMarking', !localSettings.allowMultipleMarking)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.allowMultipleMarking ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.allowMultipleMarking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-orange-600" size={24} />
            Working Hours
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={localSettings.workingHours.start}
                onChange={(e) => handleNestedChange('workingHours', 'start', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={localSettings.workingHours.end}
                onChange={(e) => handleNestedChange('workingHours', 'end', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Schedule:</strong> {localSettings.workingHours.start} - {localSettings.workingHours.end}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Attendance marked outside these hours will be flagged
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Bell className="text-purple-600" size={24} />
            Notifications
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Email Notifications</label>
                <p className="text-sm text-gray-500">Send attendance reports via email</p>
              </div>
              <button
                onClick={() => handleNestedChange('notifications', 'email', !localSettings.notifications.email)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Browser Notifications</label>
                <p className="text-sm text-gray-500">Show notifications in browser</p>
              </div>
              <button
                onClick={() => handleNestedChange('notifications', 'browser', !localSettings.notifications.browser)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.notifications.browser ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.notifications.browser ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Database className="text-indigo-600" size={24} />
            Backup & Data
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Auto Backup</label>
                <p className="text-sm text-gray-500">Automatically backup attendance data</p>
              </div>
              <button
                onClick={() => handleNestedChange('backup', 'autoBackup', !localSettings.backup.autoBackup)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.backup.autoBackup ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.backup.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select
                value={localSettings.backup.frequency}
                onChange={(e) => handleNestedChange('backup', 'frequency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-800">
                <strong>Data Storage:</strong> All data is stored locally in your browser
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                Regular backups help prevent data loss
              </p>
            </div>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">You have unsaved changes</p>
          <p className="text-yellow-700 text-sm">Click "Save Changes" to apply your settings</p>
        </div>
      )}
    </div>
  );
};