'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
];

// Helper function to format schedule days nicely
function formatScheduleDays(schedules) {
    if (!schedules || schedules.length === 0) return 'No hours set';

    const sortedDays = schedules.map(s => s.day_of_week).sort((a, b) => a - b);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Check for common patterns
    const hasWeekdays = [1, 2, 3, 4, 5].every(d => sortedDays.includes(d));
    const hasWeekendOnly = sortedDays.length === 2 && sortedDays.includes(0) && sortedDays.includes(6);

    // Get time from first schedule
    const firstSchedule = schedules[0];
    const startTime = formatTime(firstSchedule.start_time);
    const endTime = formatTime(firstSchedule.end_time);

    if (hasWeekdays && sortedDays.length === 5) {
        return `Mon - Fri, ${startTime} - ${endTime}`;
    } else if (hasWeekendOnly) {
        return `Sat - Sun, ${startTime} - ${endTime}`;
    } else if (sortedDays.length === 7) {
        return `Every day, ${startTime} - ${endTime}`;
    } else {
        const dayList = sortedDays.map(d => dayNames[d]).join(', ');
        return `${dayList}, ${startTime} - ${endTime}`;
    }
}

function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export default function AvailabilityPage() {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('my'); // 'my' or 'team'
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [newModalOpen, setNewModalOpen] = useState(false);

    // Overrides state
    const [editingOverrides, setEditingOverrides] = useState([]);
    const [showOverrideForm, setShowOverrideForm] = useState(false);
    const [newOverride, setNewOverride] = useState({
        date: '',
        start_time: '09:00',
        end_time: '17:00',
        is_blocked: true
    });

    useEffect(() => {
        fetchAvailabilities();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClick = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [openMenuId]);

    const fetchAvailabilities = async () => {
        try {
            const res = await fetch(`${API_URL}/api/availability`);
            const data = await res.json();
            setAvailabilities(data);
        } catch (error) {
            console.error('Error fetching availabilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const createNewSchedule = async (name) => {
        try {
            await fetch(`${API_URL}/api/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                    schedules: [
                        { day_of_week: 1, start_time: '09:00', end_time: '17:00' },
                        { day_of_week: 2, start_time: '09:00', end_time: '17:00' },
                        { day_of_week: 3, start_time: '09:00', end_time: '17:00' },
                        { day_of_week: 4, start_time: '09:00', end_time: '17:00' },
                        { day_of_week: 5, start_time: '09:00', end_time: '17:00' },
                    ],
                }),
            });
            setNewModalOpen(false);
            fetchAvailabilities();
        } catch (error) {
            console.error('Error creating schedule:', error);
        }
    };

    const deleteSchedule = async (id) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await fetch(`${API_URL}/api/availability/${id}`, { method: 'DELETE' });
            fetchAvailabilities();
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    const setAsDefault = async (id) => {
        try {
            const avail = availabilities.find(a => a.id === id);
            await fetch(`${API_URL}/api/availability/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...avail,
                    is_default: true,
                    schedules: avail.schedules,
                }),
            });
            setOpenMenuId(null);
            fetchAvailabilities();
        } catch (error) {
            console.error('Error setting default:', error);
        }
    };

    const saveSchedule = async () => {
        if (!editingAvailability || !editingSchedule) return;
        try {
            await fetch(`${API_URL}/api/availability/${editingAvailability.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editingAvailability.name,
                    timezone: editingAvailability.timezone,
                    is_default: editingAvailability.is_default,
                    schedules: editingSchedule,
                }),
            });
            setEditModalOpen(false);
            setEditingAvailability(null);
            setEditingSchedule(null);
            fetchAvailabilities();
        } catch (error) {
            console.error('Error saving schedule:', error);
        }
    };

    const openEditModal = (availability) => {
        setEditingAvailability(availability);
        setEditingSchedule([...availability.schedules]);
        setEditingOverrides(availability.overrides || []);
        setShowOverrideForm(false);
        setEditModalOpen(true);
        setOpenMenuId(null);
    };

    const addOverride = async () => {
        if (!editingAvailability || !newOverride.date) return;

        try {
            const res = await fetch(`${API_URL}/api/availability/${editingAvailability.id}/overrides`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOverride),
            });
            const savedOverride = await res.json();

            setEditingOverrides([...editingOverrides, savedOverride]);
            setShowOverrideForm(false);
            setNewOverride({
                date: '',
                start_time: '09:00',
                end_time: '17:00',
                is_blocked: true
            });

            // Refresh main data
            fetchAvailabilities();
        } catch (error) {
            console.error('Error adding override:', error);
        }
    };

    const deleteOverride = async (overrideId) => {
        // if (!confirm('Remove this override?')) return; // Removing confirm for smoother UX
        try {
            await fetch(`${API_URL}/api/availability/${editingAvailability.id}/overrides/${overrideId}`, {
                method: 'DELETE'
            });
            setEditingOverrides(editingOverrides.filter(o => o.id !== overrideId));
            fetchAvailabilities();
        } catch (error) {
            console.error('Error deleting override:', error);
        }
    };

    const toggleDay = (dayIndex) => {
        const existing = editingSchedule.find(s => s.day_of_week === dayIndex);
        if (existing) {
            setEditingSchedule(editingSchedule.filter(s => s.day_of_week !== dayIndex));
        } else {
            setEditingSchedule([...editingSchedule, { day_of_week: dayIndex, start_time: '09:00', end_time: '17:00' }]);
        }
    };

    const updateDayTime = (dayIndex, field, value) => {
        setEditingSchedule(editingSchedule.map(s =>
            s.day_of_week === dayIndex ? { ...s, [field]: value } : s
        ));
    };

    const updateTimezone = (timezone) => {
        setEditingAvailability({ ...editingAvailability, timezone });
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-container">
                    {/* Header */}
                    <div className="availability-page-header">
                        <div className="availability-header-left">
                            <h1>Availability</h1>
                            <p>Configure times when you are available for bookings.</p>
                        </div>
                        <div className="availability-header-right">
                            <div className="availability-tab-toggle">
                                <button
                                    className={`toggle-btn ${activeView === 'my' ? 'active' : ''}`}
                                    onClick={() => setActiveView('my')}
                                >
                                    My Availability
                                </button>
                                <button
                                    className={`toggle-btn ${activeView === 'team' ? 'active' : ''}`}
                                    onClick={() => setActiveView('team')}
                                >
                                    Team Availability
                                </button>
                            </div>
                            <button className="btn btn-primary" onClick={() => setNewModalOpen(true)}>
                                + New
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-spinner" />
                    ) : (
                        <>
                            {/* Schedule Cards */}
                            <div className="availability-cards">
                                {availabilities.map(availability => (
                                    <div
                                        key={availability.id}
                                        className="availability-card"
                                        onClick={() => openEditModal(availability)}
                                    >
                                        <div className="availability-card-content">
                                            <div className="availability-card-header">
                                                <span className="availability-name">{availability.name}</span>
                                                {availability.is_default && (
                                                    <span className="default-badge">Default</span>
                                                )}
                                            </div>
                                            <div className="availability-card-body">
                                                <div className="availability-schedule">
                                                    {formatScheduleDays(availability.schedules)}
                                                </div>
                                                <div className="availability-timezone">
                                                    <GlobeIcon />
                                                    <span>{availability.timezone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="availability-card-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="menu-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === availability.id ? null : availability.id);
                                                }}
                                            >
                                                <MoreIcon />
                                            </button>
                                            {openMenuId === availability.id && (
                                                <div className="dropdown-menu">
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => openEditModal(availability)}
                                                    >
                                                        <EditIcon />
                                                        Edit
                                                    </button>
                                                    {!availability.is_default && (
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => setAsDefault(availability.id)}
                                                        >
                                                            <StarIcon />
                                                            Set as default
                                                        </button>
                                                    )}
                                                    {availabilities.length > 1 && (
                                                        <button
                                                            className="dropdown-item delete"
                                                            onClick={() => deleteSchedule(availability.id)}
                                                        >
                                                            <TrashIcon />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Out of Office Link */}
                            <div className="availability-redirect">
                                Temporarily Out-Of-Office? <a href="#">Add a redirect</a>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            {editModalOpen && editingAvailability && (
                <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>{editingAvailability.name}</h2>
                            <button className="btn btn-ghost" onClick={() => setEditModalOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group" style={{ maxWidth: '300px', marginBottom: '24px' }}>
                                <label className="form-label">Timezone</label>
                                <select
                                    className="form-input"
                                    value={editingAvailability.timezone}
                                    onChange={(e) => updateTimezone(e.target.value)}
                                >
                                    {TIMEZONES.map(tz => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                            </div>


                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: '24px' }}>Weekly Hours</h3>
                                {DAYS.map((day, index) => {
                                    const schedule = editingSchedule?.find(s => s.day_of_week === index);
                                    const isEnabled = !!schedule;

                                    return (
                                        <div key={day} className="schedule-day">
                                            <div
                                                className={`day-checkbox ${isEnabled ? 'checked' : ''}`}
                                                onClick={() => toggleDay(index)}
                                            >
                                                {isEnabled && <CheckIcon />}
                                            </div>
                                            <div className="day-name">{day}</div>
                                            {isEnabled ? (
                                                <div className="time-slots">
                                                    <input
                                                        type="time"
                                                        className="time-input"
                                                        value={schedule.start_time}
                                                        onChange={(e) => updateDayTime(index, 'start_time', e.target.value)}
                                                    />
                                                    <span className="time-separator">—</span>
                                                    <input
                                                        type="time"
                                                        className="time-input"
                                                        value={schedule.end_time}
                                                        onChange={(e) => updateDayTime(index, 'end_time', e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Unavailable</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Date Overrides Section */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Date Overrides</h3>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setShowOverrideForm(true)}
                                    >
                                        <PlusIcon /> Add Override
                                    </button>
                                </div>

                                {showOverrideForm && (
                                    <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Select Date</label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={newOverride.date}
                                                onChange={(e) => setNewOverride(prev => ({ ...prev, date: e.target.value }))}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <div className="day-checkbox-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <div
                                                    className={`day-checkbox ${!newOverride.is_blocked ? 'checked' : ''}`}
                                                    onClick={() => setNewOverride(prev => ({ ...prev, is_blocked: !prev.is_blocked }))}
                                                >
                                                    {!newOverride.is_blocked && <CheckIcon />}
                                                </div>
                                                <span style={{ fontSize: '14px' }}>Available on this date</span>
                                            </div>
                                        </div>

                                        {!newOverride.is_blocked && (
                                            <div className="time-slots" style={{ marginBottom: '16px' }}>
                                                <input
                                                    type="time"
                                                    className="time-input"
                                                    value={newOverride.start_time}
                                                    onChange={(e) => setNewOverride(prev => ({ ...prev, start_time: e.target.value }))}
                                                />
                                                <span className="time-separator">—</span>
                                                <input
                                                    type="time"
                                                    className="time-input"
                                                    value={newOverride.end_time}
                                                    onChange={(e) => setNewOverride(prev => ({ ...prev, end_time: e.target.value }))}
                                                />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowOverrideForm(false)}>Cancel</button>
                                            <button type="button" className="btn btn-primary btn-sm" onClick={addOverride} disabled={!newOverride.date}>Add</button>
                                        </div>
                                    </div>
                                )}

                                <div className="overrides-list">
                                    {editingOverrides?.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>No date-specific overrides.</p>
                                    ) : (
                                        editingOverrides?.map(override => (
                                            <div key={override.id} className="schedule-day" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <div className="day-name" style={{ width: 'auto', marginRight: '16px', fontWeight: '500' }}>
                                                    {new Date(override.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    {override.is_blocked ? (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Unavailable</span>
                                                    ) : (
                                                        <span style={{ fontSize: '14px' }}>
                                                            {formatTime(override.start_time)} - {formatTime(override.end_time)}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--accent-red)' }}
                                                    onClick={() => deleteOverride(override.id)}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveSchedule}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Schedule Modal */}
            {newModalOpen && (
                <NewScheduleModal
                    onClose={() => setNewModalOpen(false)}
                    onSave={createNewSchedule}
                />
            )}
        </div>
    );
}

function NewScheduleModal({ onClose, onSave }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>Add new schedule</h2>
                    <button className="btn btn-ghost" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Working Hours"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>Continue</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Icons
function GlobeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
    );
}

function MoreIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
    );
}

function StarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}
