'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const TABS = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'unconfirmed', label: 'Unconfirmed' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'past', label: 'Past' },
    { id: 'cancelled', label: 'Canceled' },
];

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [rescheduleBooking, setRescheduleBooking] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let type = activeTab;
            if (activeTab === 'cancelled') type = 'cancelled';
            if (activeTab === 'unconfirmed' || activeTab === 'recurring') type = 'upcoming';

            const res = await fetch(`${API_URL}/api/bookings?type=${type}`);
            let data = await res.json();

            if (activeTab === 'cancelled') {
                data = data.filter(b => b.status === 'cancelled');
            } else if (activeTab === 'upcoming') {
                data = data.filter(b => b.status === 'confirmed');
            }

            setBookings(data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (uid) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await fetch(`${API_URL}/api/bookings/${uid}/cancel`, { method: 'POST' });
            fetchBookings();
        } catch (error) {
            console.error('Error canceling booking:', error);
        }
    };

    const handleReschedule = async (uid, startTime, endTime) => {
        try {
            await fetch(`${API_URL}/api/bookings/${uid}/reschedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start_time: startTime, end_time: endTime }),
            });
            setRescheduleBooking(null);
            fetchBookings();
        } catch (error) {
            console.error('Error rescheduling booking:', error);
            alert('Failed to reschedule. The time slot may no longer be available.');
        }
    };

    // Group bookings by date
    const groupedBookings = bookings.reduce((groups, booking) => {
        const date = format(parseISO(booking.start_time), 'yyyy-MM-dd');
        if (!groups[date]) groups[date] = [];
        groups[date].push(booking);
        return groups;
    }, {});

    const getDateLabel = (dateStr) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return 'TODAY';
        if (isTomorrow(date)) return 'TOMORROW';
        return format(date, 'EEEE, MMMM d').toUpperCase();
    };

    // Pagination
    const totalBookings = bookings.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalBookings);

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-container">
                    <div className="page-header" style={{ marginBottom: '24px' }}>
                        <h1>Bookings</h1>
                        <p>See upcoming and past events booked through your event type links.</p>
                    </div>

                    {/* Cal.com style tabs row */}
                    <div className="bookings-header-row">
                        <div className="bookings-tabs-inline">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`booking-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                            <button className="filter-btn">
                                <FilterIcon />
                                Filter
                            </button>
                        </div>
                        <button className="saved-btn">
                            <FilterIcon />
                            Saved
                            <ChevronDownIcon />
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-spinner" />
                    ) : bookings.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <CalendarIcon />
                                </div>
                                <h3>No {activeTab} bookings</h3>
                                <p>
                                    {activeTab === 'upcoming'
                                        ? "You don't have any upcoming meetings scheduled."
                                        : activeTab === 'past'
                                            ? "You don't have any past meetings to show."
                                            : `No ${activeTab} bookings found.`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="booking-list-cal">
                                {Object.entries(groupedBookings).map(([dateKey, dateBookings]) => (
                                    <div key={dateKey} className="date-section">
                                        <div className="date-header-bar">
                                            {getDateLabel(dateKey)}
                                        </div>
                                        <div className="bookings-container">
                                            {dateBookings.map(booking => {
                                                const startDate = parseISO(booking.start_time);
                                                const endDate = parseISO(booking.end_time);

                                                return (
                                                    <div key={booking.uid} className="booking-row">
                                                        <div className="booking-left-col">
                                                            <div className="booking-date-text">
                                                                {format(startDate, 'EEE, d MMM')}
                                                            </div>
                                                            <div className="booking-time-text">
                                                                {format(startDate, 'h:mma').toLowerCase()} - {format(endDate, 'h:mma').toLowerCase()}
                                                            </div>
                                                            <a href="#" className="video-link">
                                                                <VideoIcon />
                                                                Join Cal Video
                                                            </a>
                                                        </div>
                                                        <div className="booking-main-col">
                                                            <div className="booking-meeting-title">
                                                                {booking.event_title} between {booking.booker_name} and You
                                                            </div>
                                                            <div className="booking-attendee-text">
                                                                You and {booking.booker_name}
                                                            </div>
                                                        </div>
                                                        <div className="booking-action-col">
                                                            <div className="dropdown-container">
                                                                <button
                                                                    className="more-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenMenuId(openMenuId === booking.uid ? null : booking.uid);
                                                                    }}
                                                                >
                                                                    <MoreIcon />
                                                                </button>
                                                                {openMenuId === booking.uid && (
                                                                    <div className="dropdown-menu">
                                                                        {booking.status !== 'cancelled' && (
                                                                            <>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => setRescheduleBooking(booking)}
                                                                                >
                                                                                    <RescheduleIcon />
                                                                                    Reschedule
                                                                                </button>
                                                                                <button
                                                                                    className="dropdown-item delete"
                                                                                    onClick={() => cancelBooking(booking.uid)}
                                                                                >
                                                                                    <CancelIcon />
                                                                                    Cancel
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        <button className="dropdown-item">
                                                                            <EditIcon />
                                                                            Edit booking
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Footer */}
                            <div className="pagination-row">
                                <div className="pagination-left">
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                        className="rows-select"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="rows-label">rows per page</span>
                                </div>
                                <div className="pagination-right">
                                    <span className="pagination-text">{startIndex + 1}-{endIndex} of {totalBookings}</span>
                                    <button
                                        className="page-nav-btn"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                    >
                                        <ChevronLeftIcon />
                                    </button>
                                    <button
                                        className="page-nav-btn"
                                        disabled={endIndex >= totalBookings}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                    >
                                        <ChevronRightIcon />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {rescheduleBooking && (
                <RescheduleModal
                    booking={rescheduleBooking}
                    onClose={() => setRescheduleBooking(null)}
                    onSave={handleReschedule}
                />
            )}
        </div>
    );
}

function RescheduleModal({ booking, onClose, onSave }) {
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const startTime = new Date(`${newDate}T${newTime}`);
        const endTime = new Date(startTime.getTime() + booking.duration * 60000);
        onSave(booking.uid, startTime.toISOString(), endTime.toISOString());
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>Reschedule Booking</h2>
                    <button className="btn btn-ghost" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            Select a new date and time for this {booking.duration} minute meeting with {booking.booker_name}.
                        </p>
                        <div className="form-group">
                            <label className="form-label">New Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Time</label>
                            <input
                                type="time"
                                className="form-input"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Reschedule</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Icons
function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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

function FilterIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    );
}

function VideoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
    );
}

function MoreIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
        </svg>
    );
}

function RescheduleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    );
}

function CancelIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
