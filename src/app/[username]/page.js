'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function UserProfilePage() {
    const params = useParams();
    const { username } = params;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, [username]);

    const fetchUserData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/public/${username}`);
            if (!res.ok) throw new Error('User not found');
            const data = await res.json();
            setData(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
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
                <div className="booking-container" style={{ maxWidth: '480px', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600' }}>User Not Found</h2>
                    <p style={{ color: 'var(--text-subtle)', marginTop: '8px' }}>
                        This user doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    const { user, eventTypes } = data;

    return (
        <div className="booking-page">
            <div className="booking-container" style={{ maxWidth: '640px', flexDirection: 'column' }}>
                <div style={{ padding: '40px 24px', textAlign: 'center', borderBottom: '1px solid var(--border-default)' }}>
                    <div className="host-avatar-lg" style={{ margin: '0 auto 16px' }}>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-default)' }}>
                        {user.name}
                    </h1>
                    <p style={{ color: 'var(--text-subtle)' }}>@{user.username}</p>

                    {user.bio && (
                        <p style={{ marginTop: '12px', color: 'var(--text-subtle)', fontSize: '14px', maxWidth: '400px', margin: '16px auto 0' }}>
                            {user.bio}
                        </p>
                    )}
                </div>

                <div style={{ padding: '24px' }}>
                    {eventTypes.length === 0 ? (
                        <div className="no-more-results">
                            No event types available
                        </div>
                    ) : (
                        <div className="event-type-list-container">
                            {eventTypes.map(event => (
                                <Link
                                    key={event.id}
                                    href={`/${username}/${event.slug}`}
                                    className="event-type-card"
                                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                                >
                                    <div className="event-type-info">
                                        <div className="event-type-header">
                                            <span className="event-type-title">{event.title}</span>
                                        </div>
                                        <div className="event-type-meta">
                                            <div className="duration-badge">
                                                <ClockIcon />
                                                {event.duration}m
                                            </div>
                                        </div>
                                        {event.description && (
                                            <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-subtle)', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ color: 'var(--text-default)' }}>
                                        <ChevronRightIcon />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '12px', height: '12px', opacity: 0.7 }}>
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '16px', height: '16px', opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    );
}
