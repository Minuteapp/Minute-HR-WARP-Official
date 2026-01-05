import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, Calendar, Mail, Settings, Search, Plus, Filter, Download, Settings as SettingsIcon, Users, Folder } from 'lucide-react';

const CalendarPage = () => {
  // Current week days for August 25-31, 2025 exactly as shown in screenshot
  const currentWeekDays = [
    { day: 'Mo', date: '25.8', fullDate: '2025-08-25' },
    { day: 'Di', date: '26.8', fullDate: '2025-08-26' },
    { day: 'Mi', date: '27.8', fullDate: '2025-08-27' },
    { day: 'Do', date: '28.8', fullDate: '2025-08-28' },
    { day: 'Fr', date: '29.8', fullDate: '2025-08-29' },
    { day: 'Sa', date: '30.8', fullDate: '2025-08-30' },
    { day: 'So', date: '31.8', fullDate: '2025-08-31' }
  ];

  // Time slots - full day from 00:00 to 23:30 in 30-minute intervals
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Mini calendar for August 2025 - exactly matching screenshot layout
  const miniCalendarDays = [
    [27, 28, 29, 30, 31, 1, 2],
    [3, 4, 5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14, 15, 16],
    [17, 18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29, 30],
    [31, 1, 2, 3, 4, 5, 6]
  ];

  const weekDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - exactly as in screenshot */}
      <div className="bg-white border-b">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Navigation */}
            <div className="flex items-center space-x-6">
              {/* Logo Section */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-black" />
                <span className="font-semibold text-black">Enterprise Kalender</span>
                <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">v2.0</Badge>
                <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">Preview</Badge>
              </div>
              
              {/* Navigation Tabs - exactly as shown */}
              <div className="flex">
                <div className="flex items-center px-4 py-2 bg-gray-100 border-b-2 border-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Kalender</span>
                </div>
                <div className="flex items-center px-4 py-2 hover:bg-gray-50 relative">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">E-Mail Buchung</span>
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">5</Badge>
                </div>
                <div className="flex items-center px-4 py-2 hover:bg-gray-50">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="text-sm">Buchungsseiten</span>
                </div>
                <div className="flex items-center px-4 py-2 hover:bg-gray-50">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="text-sm">Buchungssystem</span>
                </div>
              </div>
            </div>
            
            {/* Right: Notification and Settings */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Badge className="bg-red-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">5</Badge>
              </div>
              <Settings className="h-5 w-5 text-gray-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar - exactly as in screenshot */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-6">
            {/* Calendar Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Kalender</h2>
              <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                <Plus className="h-3 w-3 mr-1" />
                Neu
              </Button>
            </div>

            {/* Search Field */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Termine durchsuchen..." 
                className="pl-9 text-sm border-gray-300"
              />
            </div>

            {/* Schnellzugriff */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Schnellzugriff</h3>
              <div className="space-y-1">
                <div className="px-3 py-2 bg-gray-100 rounded text-sm font-medium">
                  Heute
                </div>
                <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
                  Nächste Woche
                </div>
              </div>
            </div>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Kalender</h3>
                <div className="flex">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-center text-sm font-medium mb-3">August 2025</div>
              
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDayNames.map(day => (
                  <div key={day} className="text-center text-xs text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {miniCalendarDays.flat().map((day, index) => {
                  const isCurrentMonth = day <= 31 && day >= 1;
                  const isSelected = day === 28;
                  return (
                    <button
                      key={index}
                      className={`h-7 w-7 text-xs rounded flex items-center justify-center ${
                        isSelected 
                          ? 'bg-black text-white' 
                          : isCurrentMonth 
                            ? 'hover:bg-gray-100 text-gray-900'
                            : 'text-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meine Kalender */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Meine Kalender</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-sm">Mein Kalender</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* Teams */}
            <div className="mb-6">
              <div className="flex items-center space-x-1 mb-3">
                <Users className="h-4 w-4" />
                <h3 className="text-sm font-medium">Teams</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Team Engineering</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            {/* Projekte */}
            <div>
              <div className="flex items-center space-x-1">
                <Folder className="h-4 w-4" />
                <h3 className="text-sm font-medium">Projekte</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col">
          {/* Calendar Header */}
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              {/* Left: Date Navigation */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Heute</span>
                </div>
                <h1 className="text-xl font-semibold">25. August 2025 - 31. August 2025</h1>
                <span className="text-sm text-gray-500">Berlin</span>
              </div>
              
              {/* Right: Search and Create */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Schnellsuche oder 'new' für neuen Term" 
                    className="pl-9 w-80 text-sm"
                  />
                </div>
                <Button className="bg-black text-white hover:bg-gray-800 px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Termin erstellen
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 bg-white overflow-hidden">
            {/* Week Header */}
            <div className="grid grid-cols-8 border-b bg-gray-50">
              <div className="border-r"></div>
              {currentWeekDays.map(({ day, date }) => (
                <div key={date} className="p-3 text-center border-r">
                  <div className="text-sm text-gray-600 font-medium">{day}</div>
                  <div className="text-base font-semibold">{date}</div>
                </div>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="overflow-y-auto h-full">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b border-gray-100 h-16">
                  <div className="border-r bg-gray-50 p-3 text-right text-sm text-gray-500 font-medium w-20">
                    {time}
                  </div>
                  {currentWeekDays.map(({ date }) => (
                    <div 
                      key={`${time}-${date}`} 
                      className="border-r border-gray-100 hover:bg-blue-50 cursor-pointer relative"
                    >
                      {/* Events would be rendered here */}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-24 bg-white border-l">
          <div className="p-4 space-y-4 flex flex-col items-center">
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 text-sm py-2 px-3 font-medium">
              Woche
            </Button>
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <Filter className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <Download className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <SettingsIcon className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;