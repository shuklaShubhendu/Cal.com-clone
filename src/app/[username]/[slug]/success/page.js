'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function SuccessContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { username, slug } = params;
    const uid = searchParams.get('uid');

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (uid) {
            fetchBooking();
        }
    }, [uid]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/${uid}`);
            if (res.ok) {
                const data = await res.json();
                setBooking(data);
            }
        } catch (error) {
            console.error('Error fetching booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReschedule = () => {
        // In a real app, this would go to a reschedule flow
        alert('Reschedule functionality would go here');
    };

    const handleCancel = async (e) => {
        if (e) e.preventDefault();

        if (!uid) {
            alert('Error: Booking UID not found.');
            return;
        }

        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const res = await fetch(`${API_URL}/api/bookings/${uid}/cancel`, {
                method: 'POST'
            });
            if (res.ok) {
                alert('Booking cancelled successfully');
                router.push(`${window.location.pathname}?uid=${uid}&refresh=${Date.now()}`); // Refresh or redirect
                // Ideally, reload data to show updated status, but success page is static mostly. 
                // Let's redirect to daily/bookings page or just reload current to show "Cancelled" state if we had one.
                // For now, redirecting to the booking page itself to book again might be confusing.
                // Redirecting to bookings dashboard is safe.
                router.push('/bookings');
            } else {
                const data = await res.json();
                alert(`Failed to cancel: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('An error occurred while cancelling.');
        }
    };

    if (loading) {
        return (
            <div className="confirmation-wrapper">
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="confirmation-wrapper">
                <div className="confirmation-card">
                    <h2>Booking not found</h2>
                </div>
            </div>
        );
    }

    const startDate = parseISO(booking.start_time);
    const endDate = parseISO(booking.end_time);

    return (
        <div className="confirmation-wrapper">
            <Link href="/bookings" className="back-to-bookings">
                <ChevronLeftIcon /> Back to bookings
            </Link>
            <div className="confirmation-card">
                <div className="confirmation-header">
                    <div className="success-icon-wrapper">
                        <CheckIcon />
                    </div>
                    <h1 className="confirmation-title">This meeting is scheduled</h1>
                    <p className="confirmation-subtitle">
                        We sent an email with a calendar invitation with the details to everyone.
                    </p>
                </div>

                <div className="confirmation-divider"></div>

                <div className="confirmation-grid">
                    <div className="conf-label">What</div>
                    <div className="conf-value">{booking.event_title} between {booking.host_name} and {booking.booker_name}</div>

                    <div className="conf-label">When</div>
                    <div className="conf-value">
                        {format(startDate, 'EEEE, MMMM d, yyyy')}
                        <br />
                        {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')} ({booking.timezone || 'India Standard Time'})
                    </div>

                    <div className="conf-label">Who</div>
                    <div className="conf-value">
                        <div className="attendee-block">
                            <strong>{booking.host_name}</strong> <span className="host-badge">Host</span>
                            <span className="email-text">{booking.host_email}</span>
                        </div>
                        <div className="attendee-block">
                            <strong>{booking.booker_name}</strong>
                            <span className="email-text">{booking.booker_email}</span>
                        </div>
                    </div>

                    <div className="conf-label">Where</div>
                    <div className="conf-value">
                        <a href="#" className="location-link">
                            Cal Video <ExternalLinkIcon />
                        </a>
                    </div>
                </div>

                <div className="conf-footer">
                    Need to make a change?{' '}
                    <button onClick={handleReschedule}>Reschedule</button>
                    {' '}or{' '}
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="confirmation-wrapper"><div className="loading-spinner" /></div>}>
            <SuccessContent />
        </Suspense>
    );
}

// Icons
function ChevronLeftIcon() {
    return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

function ExternalLinkIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}
