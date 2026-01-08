'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function PublicBookingPage() {
    const params = useParams();
    const router = useRouter();
    const { username, slug } = params;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [step, setStep] = useState('calendar'); // calendar, form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        notes: '',
        answers: [],
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEventData();
    }, [username, slug]);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate]);

    const fetchEventData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/public/${username}/${slug}`);
            if (!res.ok) throw new Error('Event not found');
            const data = await res.json();
            setData(data);

            if (data.questions?.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    answers: data.questions.map(q => ({ question_id: q.id, answer: '' }))
                }));
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async (date) => {
        setLoadingSlots(true);
        setSelectedSlot(null);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const res = await fetch(`${API_URL}/api/public/${username}/${slug}/slots?date=${dateStr}`);
            const data = await res.json();
            setSlots(data.slots || []);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedSlot) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/public/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_type_id: data.eventType.id,
                    booker_name: formData.name,
                    booker_email: formData.email,
                    start_time: selectedSlot.start,
                    end_time: selectedSlot.end,
                    notes: formData.notes,
                    answers: formData.answers.filter(a => a.answer.trim()),
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to book');
            }

            const booking = await res.json();
            router.push(`/${username}/${slug}/success?uid=${booking.uid}`);
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getDaysInMonth = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        const startDay = start.getDay();
        const paddedDays = [];
        for (let i = 0; i < startDay; i++) {
            paddedDays.push(addDays(start, i - startDay));
        }

        return [...paddedDays, ...days];
    };

    if (loading) {
        return (
            <div className="booking-page">
                <div className="loading-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="booking-page">
                <div className="booking-container" style={{ maxWidth: '500px', flexDirection: 'column', alignItems: 'center', padding: '60px' }}>
                    <h2>Event Not Found</h2>
                    <p style={{ color: 'var(--text-subtle)', marginTop: '12px' }}>
                        This event type doesn't exist or is not currently available.
                    </p>
                </div>
            </div>
        );
    }

    const { user, eventType, questions } = data;

    return (
        <div className="booking-page">
            <div className="booking-container">
                {/* Left Sidebar - Event Info */}
                <div className="booking-sidebar">
                    <div className="host-info">
                        {step === 'form' ? (
                            <button
                                onClick={() => setStep('calendar')}
                                className="btn-ghost"
                                style={{ alignSelf: 'flex-start', marginBottom: '16px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <div style={{ transform: 'rotate(180deg)' }}><ChevronRightIcon /></div>
                                Back
                            </button>
                        ) : (
                            <div className="host-avatar-sm" style={{ marginBottom: '12px' }}>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                        )}
                        <div className="host-name">{user.name}</div>
                        <h1 className="event-title">{eventType.title}</h1>
                    </div>

                    <div className="event-details">
                        <div className="detail-item">
                            <ClockIcon />
                            <span>{eventType.duration} minutes</span>
                        </div>
                        <div className="detail-item">
                            <VideoIcon />
                            <span>Web conferencing</span>
                        </div>
                        <div className="detail-item">
                            <GlobeIcon />
                            <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                        </div>
                    </div>

                    {eventType.description && (
                        <p style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-subtle)', lineHeight: '1.6' }}>
                            {eventType.description}
                        </p>
                    )}

                    {selectedDate && selectedSlot && step === 'form' && (
                        <div style={{
                            marginTop: '24px',
                            padding: '16px',
                            borderLeft: '2px solid var(--brand-default)',
                            background: 'var(--bg-subtle)'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-default)' }}>
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div style={{ color: 'var(--text-subtle)', fontSize: '14px' }}>
                                {selectedSlot.time}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="booking-main">
                    {step === 'calendar' ? (
                        <div style={{ display: 'flex', height: '100%', alignItems: 'flex-start' }}>
                            {/* Calendar */}
                            <div className="calendar" style={{ flex: 1, paddingRight: selectedDate ? '24px' : '0' }}>
                                <div className="calendar-header">
                                    <h2 className="calendar-month">{format(currentMonth, 'MMMM yyyy')}</h2>
                                    <div className="calendar-nav">
                                        <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
                                            <ChevronLeftIcon />
                                        </button>
                                        <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>
                                            <ChevronRightIcon />
                                        </button>
                                    </div>
                                </div>

                                <div className="calendar-grid">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="calendar-weekday">{day}</div>
                                    ))}
                                    {getDaysInMonth().map((day, i) => {
                                        const isPast = isBefore(day, startOfDay(new Date()));
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                                        const dayOfWeek = day.getDay();
                                        const isUnavailable = dayOfWeek === 0 || dayOfWeek === 6;

                                        return (
                                            <div
                                                key={i}
                                                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''
                                                    } ${isPast || isUnavailable ? 'disabled' : 'available'} ${isSelected ? 'selected' : ''
                                                    } ${isToday(day) ? 'today' : ''}`}
                                                onClick={() => {
                                                    if (!isPast && !isUnavailable && isCurrentMonth) {
                                                        setSelectedDate(day);
                                                    }
                                                }}
                                            >
                                                {format(day, 'd')}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Slots */}

                            {selectedDate && (
                                <div className="time-slots-container">
                                    <div className="time-slots-header-row">
                                        <span className="time-slots-date">{format(selectedDate, 'EEEE, d')}</span>
                                        {/* Visual Toggle for 12h/24h (Optional) */}
                                        <div style={{ display: 'flex', gap: '4px', fontSize: '12px', background: '#f3f4f6', padding: '2px', borderRadius: '4px' }}>
                                            <button style={{ padding: '2px 6px', borderRadius: '2px', background: 'white', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'default' }}>12h</button>
                                            <button style={{ padding: '2px 6px', borderRadius: '2px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'default' }}>24h</button>
                                        </div>
                                    </div>

                                    {loadingSlots ? (
                                        <div className="loading-spinner" style={{ width: '20px', height: '20px', margin: '20px auto', borderWidth: '2px' }} />
                                    ) : slots.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
                                            No times available
                                        </p>
                                    ) : (
                                        <div className="time-slots-list">
                                            {slots.map((slot, i) => (
                                                <button
                                                    key={i}
                                                    className={`time-slot ${selectedSlot?.time === slot.time ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedSlot(slot);
                                                        setStep('form');
                                                    }}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Booking Form */
                        <div style={{ maxWidth: '420px', paddingLeft: '12px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: 'var(--text-default)' }}>
                                Enter your details
                            </h2>

                            <form onSubmit={handleBooking}>
                                <div className="form-group">
                                    <label className="form-label">Your name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email address *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                    />
                                </div>

                                {questions?.map((q, i) => (
                                    <div key={q.id} className="form-group">
                                        <label className="form-label">
                                            {q.question} {q.required ? '*' : ''}
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.answers[i]?.answer || ''}
                                            onChange={(e) => {
                                                const newAnswers = [...formData.answers];
                                                newAnswers[i] = { ...newAnswers[i], answer: e.target.value };
                                                setFormData(prev => ({ ...prev, answers: newAnswers }));
                                            }}
                                            required={q.required}
                                        />
                                    </div>
                                ))}

                                <div className="form-group">
                                    <label className="form-label">Additional notes</label>
                                    <textarea
                                        className="form-input"
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Please share anything that will help prepare for our meeting."
                                        rows={3}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setStep('calendar')}
                                        disabled={submitting}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Confirming...' : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Icons
function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function VideoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    );
}
