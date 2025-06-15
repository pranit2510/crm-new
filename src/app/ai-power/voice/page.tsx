'use client';

import React, { useState } from 'react';
import { Phone, Settings, Play, Pause, RefreshCw, Volume2, Mic, Headphones } from 'lucide-react';

const VoiceAgentPage = () => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(80);
  const [voice, setVoice] = useState('en-US-Neural2-F');
  const [greeting, setGreeting] = useState('Thank you for calling our service center. How may I assist you today?');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsActive(!isActive);
    } catch (error) {
      console.error('Failed to toggle voice agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (section: string) => {
    if (isEditing === section) {
      // Save logic would go here
      setIsEditing(null);
    } else {
      setIsEditing(section);
    }
  };

  return (
    <div>
      {/* Coming Soon Banner */}
      <div className="w-full bg-yellow-100 text-yellow-800 text-center py-3 font-semibold text-sm sm:text-base shadow-md">
        Coming Soon: This Voice Agent feature is under development. Stay tuned!
      </div>
  
      {/* Main Content Container */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center">
          <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-[#1877F2] mr-2 sm:mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Voice Agent</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
            } transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]`}
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            ) : isActive ? (
              <Pause className="h-5 w-5 mr-2" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            {isActive ? 'Stop Agent' : 'Start Agent'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Selection
                </label>
                <select
                  id="voice"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2] transition-colors"
                >
                  <option value="en-US-Neural2-F">Female (US)</option>
                  <option value="en-US-Neural2-M">Male (US)</option>
                  <option value="en-GB-Neural2-F">Female (UK)</option>
                  <option value="en-GB-Neural2-M">Male (UK)</option>
                </select>
              </div>

              <div>
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                  Volume
                </label>
                <div className="flex items-center space-x-4">
                  <Volume2 className="h-5 w-5 text-gray-400" />
                  <input
                    type="range"
                    id="volume"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                  <span className="text-sm text-gray-500 w-12">{volume}%</span>
                </div>
              </div>

              <div>
                <label htmlFor="greeting" className="block text-sm font-medium text-gray-700 mb-2">
                  Greeting Message
                </label>
                <textarea
                  id="greeting"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Call Handling Rules</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-[#1877F2] mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Business Hours</h3>
                    <p className="text-sm text-gray-500">9:00 AM - 5:00 PM EST</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleEdit('business-hours')}
                  className="text-[#1877F2] hover:text-[#166FE5] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] rounded-md px-2 py-1"
                >
                  {isEditing === 'business-hours' ? 'Save' : 'Edit'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Mic className="h-5 w-5 text-[#1877F2] mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Voice Recognition</h3>
                    <p className="text-sm text-gray-500">High accuracy mode</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleEdit('voice-recognition')}
                  className="text-[#1877F2] hover:text-[#166FE5] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] rounded-md px-2 py-1"
                >
                  {isEditing === 'voice-recognition' ? 'Save' : 'Edit'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Headphones className="h-5 w-5 text-[#1877F2] mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Call Transfer</h3>
                    <p className="text-sm text-gray-500">Transfer to human agent after 2 minutes</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleEdit('call-transfer')}
                  className="text-[#1877F2] hover:text-[#166FE5] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] rounded-md px-2 py-1"
                >
                  {isEditing === 'call-transfer' ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Analytics */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Stats</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-500">Total Calls</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-500">Average Duration</p>
                <p className="text-2xl font-semibold text-gray-900">3m 45s</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">92%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-gray-900">New Appointment</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Service Inquiry</p>
                  <p className="text-sm text-gray-500">15 minutes ago</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Transferred
                </span>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Emergency Call</p>
                  <p className="text-sm text-gray-500">1 hour ago</p>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Urgent
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div></div>
  );
};

export default VoiceAgentPage; 