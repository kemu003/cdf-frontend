import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Users,
  Home,
  Award,
  DollarSign,
  Clock,
  MapPin,
  Bell,
  CheckCircle,
  AlertCircle,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  type: 'meeting' | 'deadline' | 'event' | 'disbursement' | 'review';
  location: string;
  attendees: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  reminder_sent: boolean;
  created_by: string;
  color: string;
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const eventTypes = [
    { value: 'meeting', label: 'Meeting', color: 'bg-blue-500' },
    { value: 'deadline', label: 'Deadline', color: 'bg-red-500' },
    { value: 'event', label: 'Event', color: 'bg-green-500' },
    { value: 'disbursement', label: 'Disbursement', color: 'bg-purple-500' },
    { value: 'review', label: 'Review', color: 'bg-yellow-500' }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/calendar/events/');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Mock data
      setEvents([
        {
          id: 1,
          title: 'CDF Committee Meeting',
          description: 'Monthly committee meeting to review applications',
          start_date: '2024-01-15',
          end_date: '2024-01-15',
          start_time: '10:00',
          end_time: '12:00',
          type: 'meeting',
          location: 'County Hall, Room 201',
          attendees: ['Admin', 'Committee Members'],
          status: 'scheduled',
          reminder_sent: true,
          created_by: 'System Admin',
          color: 'bg-blue-500'
        },
        {
          id: 2,
          title: 'Student Bursary Disbursement',
          description: 'Q1 Bursary disbursement for university students',
          start_date: '2024-01-20',
          end_date: '2024-01-20',
          start_time: '09:00',
          end_time: '17:00',
          type: 'disbursement',
          location: 'CDF Office',
          attendees: ['Finance Team', 'Students'],
          status: 'scheduled',
          reminder_sent: true,
          created_by: 'Finance Dept',
          color: 'bg-purple-500'
        },
        {
          id: 3,
          title: 'Application Deadline',
          description: 'Deadline for submitting Q2 project proposals',
          start_date: '2024-01-31',
          end_date: '2024-01-31',
          start_time: '23:59',
          end_time: '23:59',
          type: 'deadline',
          location: 'Online Portal',
          attendees: ['All Applicants'],
          status: 'scheduled',
          reminder_sent: false,
          created_by: 'System',
          color: 'bg-red-500'
        },
        {
          id: 4,
          title: 'Community Project Inspection',
          description: 'Site visit to ongoing health center project',
          start_date: '2024-01-18',
          end_date: '2024-01-18',
          start_time: '08:00',
          end_time: '14:00',
          type: 'review',
          location: 'Nyangores Health Center Site',
          attendees: ['Committee Members', 'Contractor'],
          status: 'scheduled',
          reminder_sent: true,
          created_by: 'Project Manager',
          color: 'bg-yellow-500'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.start_date === dateString);
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({
        date: prevDate,
        isCurrentMonth: false,
        events: getEventsForDate(prevDate)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date)
      });
    }
    
    // Next month days to complete grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, days.length - daysInMonth - firstDay + 1);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: getEventsForDate(nextDate)
      });
    }
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-32 border border-gray-200 rounded-lg p-2 ${
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${
              day.date.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${
                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${
                day.date.toDateString() === new Date().toDateString() ? 'text-blue-600' : ''
              }`}>
                {day.date.getDate()}
              </span>
              {day.events.length > 0 && (
                <span className="text-xs font-medium text-gray-500">
                  {day.events.length}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              {day.events.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-90 ${event.color} text-white`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs opacity-90 truncate">{event.start_time}</div>
                </div>
              ))}
              {day.events.length > 2 && (
                <div className="text-xs text-gray-500 text-center">
                  +{day.events.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const upcomingEvents = events
    .filter(event => new Date(event.start_date) >= new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500 mt-2">Please login to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">Schedule and track Chepalungu CDF activities and events</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900">{getMonthName(currentDate)}</h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Today
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                view === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                view === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                view === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            {view === 'month' && renderMonthView()}
            {view === 'week' && (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Week view coming soon</p>
              </div>
            )}
            {view === 'day' && (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Day view coming soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events & Event Types */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${event.color} text-white`}>
                      <CalendarIcon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock size={12} className="mr-1" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString()} • {event.start_time}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin size={12} className="mr-1" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Types */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Event Types</h3>
            <div className="space-y-3">
              {eventTypes.map(type => {
                const count = events.filter(e => e.type === type.value).length;
                return (
                  <div key={type.value} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${type.color}`}></div>
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">This Month</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-xl font-bold text-gray-900">
                  {events.filter(e => {
                    const eventDate = new Date(e.start_date);
                    return eventDate.getMonth() === currentDate.getMonth() && 
                           eventDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">
                  {events.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Event Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Title:</span>
                      <span className="font-medium">{selectedEvent.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="font-medium">
                        {eventTypes.find(t => t.value === selectedEvent.type)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Description:</span>
                      <span className="font-medium text-right">{selectedEvent.description}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Time & Location</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedEvent.start_date).toLocaleDateString()}
                        {selectedEvent.start_date !== selectedEvent.end_date && 
                         ` to ${new Date(selectedEvent.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="font-medium">
                        {selectedEvent.start_time} - {selectedEvent.end_time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="font-medium">{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEvent.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        selectedEvent.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                        selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reminder Sent:</span>
                      <span className="font-medium">
                        {selectedEvent.reminder_sent ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created By:</span>
                      <span className="font-medium">{selectedEvent.created_by}</span>
                    </div>
                  </div>
                </div>

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Attendees</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {attendee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {user.role === 'admin' && (
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Edit Event
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;