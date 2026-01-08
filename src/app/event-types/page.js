'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const COLORS = [
    '#7C3AED', '#2563EB', '#059669', '#DC2626', '#EA580C', '#D97706', '#0891B2', '#6366F1'
];

export default function EventTypesPage() {
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [user, setUser] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        fetchEventTypes();
        fetchUser();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuId && !event.target.closest('.dropdown-container')) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openMenuId]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${API_URL}/api/user`);
            const data = await res.json();
            setUser(data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchEventTypes = async () => {
        try {
            const res = await fetch(`${API_URL}/api/event-types`);
            const data = await res.json();
            setEventTypes(data);
        } catch (error) {
            console.error('Error fetching event types:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleEventType = async (id, isActive) => {
        const event = eventTypes.find(e => e.id === id);
        try {
            await fetch(`${API_URL}/api/event-types/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...event, is_active: !isActive }),
            });
            fetchEventTypes();
        } catch (error) {
            console.error('Error toggling event type:', error);
        }
    };

    const deleteEventType = async (id) => {
        if (!confirm('Are you sure you want to delete this event type?')) return;
        try {
            await fetch(`${API_URL}/api/event-types/${id}`, { method: 'DELETE' });
            fetchEventTypes();
        } catch (error) {
            console.error('Error deleting event type:', error);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingEvent) {
                await fetch(`${API_URL}/api/event-types/${editingEvent.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, is_active: editingEvent.is_active }),
                });
            } else {
                await fetch(`${API_URL}/api/event-types`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            }
            setModalOpen(false);
            setEditingEvent(null);
            fetchEventTypes();
        } catch (error) {
            console.error('Error saving event type:', error);
        }
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setModalOpen(true);
    };

    const copyLink = (slug) => {
        const link = `${window.location.origin}/${user?.username || 'shubhendu'}/${slug}`;
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
    };

    const duplicateEvent = async (event) => {
        try {
            await fetch(`${API_URL}/api/event-types`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `${event.title} (Copy)`,
                    slug: `${event.slug}-copy-${Date.now()}`,
                    duration: event.duration,
                    description: event.description,
                    color: event.color,
                    is_active: false,
                }),
            });
            fetchEventTypes();
            setOpenMenuId(null);
        } catch (error) {
            console.error('Error duplicating event type:', error);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    const filteredEventTypes = eventTypes.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-container">
                    <div className="page-header">
                        <div className="header-content">
                            <div className="header-text">
                                <h1>Event Types</h1>
                                <p>Create events to share for people to book on your calendar.</p>
                            </div>
                            <button
                                className="btn btn-primary new-event-btn"
                                onClick={() => { setEditingEvent(null); setModalOpen(true); }}
                            >
                                <PlusIcon /> New
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <SearchIcon />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-spinner" />
                    ) : eventTypes.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <CalendarIcon />
                                </div>
                                <h3>No event types yet</h3>
                                <p>Create your first event type to start accepting bookings.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setModalOpen(true)}
                                >
                                    Create Event Type
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="event-type-list-container">
                                {filteredEventTypes.map(event => (
                                    <div key={event.id} className={`event-type-card ${!event.is_active ? 'hidden-event' : ''}`}>
                                        {/* Drag handle placeholder if needed, or just left padding */}
                                        <div className="event-type-info">
                                            <div className="event-type-main">
                                                <span className="event-type-title">{event.title}</span>
                                                <span className="event-type-slug">/{user?.username || 'shubhendu'}/{event.slug}</span>
                                            </div>
                                            <div className="event-type-meta">
                                                <span className="duration-pill">
                                                    <ClockIcon /> {event.duration}m
                                                </span>
                                            </div>
                                        </div>

                                        <div className="event-type-actions-wrapper">
                                            {!event.is_active && (
                                                <div className="status-badge hidden">Hidden</div>
                                            )}

                                            <div className="switch-wrapper">
                                                <div
                                                    className={`toggle-switch ${event.is_active ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleEventType(event.id, event.is_active); }}
                                                    title={event.is_active ? 'Disable' : 'Enable'}
                                                />
                                            </div>

                                            <div className="action-btn-group">
                                                <button
                                                    className="action-btn"
                                                    onClick={(e) => { e.stopPropagation(); window.open(`/${user?.username || 'shubhendu'}/${event.slug}`, '_blank'); }}
                                                    title="Preview"
                                                >
                                                    <ExternalLinkIcon />
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    onClick={(e) => { e.stopPropagation(); copyLink(event.slug); }}
                                                    title="Copy link"
                                                >
                                                    <CopyIcon />
                                                </button>
                                                <div className="dropdown-container">
                                                    <button
                                                        className="action-btn"
                                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === event.id ? null : event.id); }}
                                                        title="More options"
                                                    >
                                                        <MoreIcon />
                                                    </button>
                                                    {openMenuId === event.id && (
                                                        <div className="dropdown-menu">
                                                            <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); openEditModal(event); setOpenMenuId(null); }}>
                                                                <EditIcon /> Edit
                                                            </button>
                                                            <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); duplicateEvent(event); }}>
                                                                <DuplicateIcon /> Duplicate
                                                            </button>
                                                            <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); alert('Embed code copied!'); setOpenMenuId(null); }}>
                                                                <EmbedIcon /> Embed
                                                            </button>
                                                            <button className="dropdown-item delete" onClick={(e) => { e.stopPropagation(); deleteEventType(event.id); setOpenMenuId(null); }}>
                                                                <TrashIcon /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="no-more-results">No more results</div>
                        </>
                    )}
                </div>
            </main>

            {modalOpen && (
                <EventTypeModal
                    event={editingEvent}
                    onClose={() => { setModalOpen(false); setEditingEvent(null); }}
                    onSave={handleSave}
                    username={user?.username || 'shubhendu'}
                />
            )}
        </div>
    );
}

function EventTypeModal({ event, onClose, onSave, username }) {
    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        duration: event?.duration || 30,
        slug: event?.slug || '',
        color: event?.color || '#7C3AED',
        buffer_before: event?.buffer_before || 0,
        buffer_after: event?.buffer_after || 0,
        questions: [],
    });
    const [newQuestion, setNewQuestion] = useState('');

    useEffect(() => {
        if (event?.id) {
            fetch(`${API_URL}/api/event-types/${event.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.questions) {
                        setFormData(prev => ({ ...prev, questions: data.questions }));
                    }
                });
        }
    }, [event]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
        if (name === 'title' && !event) {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const addQuestion = () => {
        if (!newQuestion.trim()) return;
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { question: newQuestion, required: false, question_type: 'text' }]
        }));
        setNewQuestion('');
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{event ? 'Edit Event Type' : 'Create Event Type'}</h2>
                    <button className="btn btn-ghost" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. 30 Minute Meeting"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">URL Slug</label>
                            <div className="input-group">
                                <span className="input-prefix">/{username}/</span>
                                <input
                                    type="text"
                                    name="slug"
                                    className="form-input"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="30min"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-input"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="A brief description of this event type..."
                                rows={3}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Duration (minutes)</label>
                                <select
                                    name="duration"
                                    className="form-input"
                                    value={formData.duration}
                                    onChange={handleChange}
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>60 minutes</option>
                                    <option value={90}>90 minutes</option>
                                    <option value={120}>120 minutes</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Color</label>
                                <div className="color-options">
                                    {COLORS.map(color => (
                                        <div
                                            key={color}
                                            className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Buffer before (minutes)</label>
                                <input
                                    type="number"
                                    name="buffer_before"
                                    className="form-input"
                                    value={formData.buffer_before}
                                    onChange={handleChange}
                                    min="0"
                                    max="60"
                                />
                                <p className="form-hint">Time blocked before the event</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Buffer after (minutes)</label>
                                <input
                                    type="number"
                                    name="buffer_after"
                                    className="form-input"
                                    value={formData.buffer_after}
                                    onChange={handleChange}
                                    min="0"
                                    max="60"
                                />
                                <p className="form-hint">Time blocked after the event</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Custom Questions (Optional)</label>
                            <div style={{ marginBottom: '12px' }}>
                                {formData.questions.map((q, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ flex: 1, fontSize: '14px' }}>{q.question}</span>
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeQuestion(i)}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="Add a question..."
                                />
                                <button type="button" className="btn btn-secondary" onClick={addQuestion}>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {event ? 'Save Changes' : 'Create Event Type'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Icons
function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function ExternalLinkIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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

function SearchIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--text-muted)">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
    );
}

function CopyIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    );
}

function MoreIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function DuplicateIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

function EmbedIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    );
}
