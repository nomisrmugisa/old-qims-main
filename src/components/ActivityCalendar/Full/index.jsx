/**
 * Created by fulle on 2025/07/16.
 */
// components/ActivityCalendar.jsx
import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {
    Card,
    ButtonGroup,
    Button,
    Spinner,
    OverlayTrigger,
    Popover,
    Badge
} from 'react-bootstrap';
import {
    Calendar,
    Grid,
    List,
    ChevronLeft,
    ChevronRight,
    Plus,
    XCircle
} from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import {InspectionService} from '../../../services';

const ActivityCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState('dayGridMonth');
    const calendarRef = useRef(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const getInspectionSchedule = async() => {
        try {
            const response = await InspectionService.schedule();
            window.console.log("---*");
            window.console.log(response);
            window.console.log("inspection-schedule-result-***")
        }
        catch(error) {

        }
        finally {

        }
    };

    // Fetch activities (replace with your API call)
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                // Simulated API call
                await new Promise(resolve => setTimeout(resolve, 800));

                // Mock data
                const mockEvents = [
                    {
                        id: '1',
                        title: 'Facility Inspection',
                        start: new Date(),
                        end: new Date(Date.now() + 2 * 60 * 60 * 1000),
                        facility: 'Main Hospital',
                        type: 'inspection',
                        status: 'scheduled',
                        assignedTo: 'John Doe'
                    },
                    {
                        id: '2',
                        title: 'Staff Training',
                        start: new Date(Date.now() + 86400000), // Tomorrow
                        end: new Date(Date.now() + 86400000 + 3 * 60 * 60 * 1000),
                        facility: 'Training Center',
                        type: 'training',
                        status: 'confirmed',
                        assignedTo: 'Jane Smith'
                    },
                    // Add more events...
                ];

                setEvents(mockEvents);
            } catch (error) {
                console.error('Failed to fetch activities:', error);
            } finally {
                setLoading(false);
            }
        };

        getInspectionSchedule();
        fetchActivities();
    }, []);

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
    };

    const handleViewChange = (view) => {
        setViewType(view);
        if (calendarRef.current) {
            calendarRef.current.getApi().changeView(view);
        }
    };

    const handleNavigation = (direction) => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            if (direction === 'prev') {
                calendarApi.prev();
            } else if (direction === 'next') {
                calendarApi.next();
            } else {
                calendarApi.today();
            }
        }
    };

    const renderEventContent = (eventInfo) => {
        const eventType = eventInfo.event.extendedProps.type;
        const status = eventInfo.event.extendedProps.status;

        // Color coding based on event type
        const typeColors = {
            inspection: 'primary',
            training: 'success',
            meeting: 'warning',
            maintenance: 'info',
            default: 'secondary'
        };

        const statusBadges = {
            scheduled: 'primary',
            confirmed: 'success',
            canceled: 'danger',
            completed: 'secondary'
        };

        return (
            <div className={`fc-event-content p-1 bg-${typeColors[eventType] || typeColors.default}`}>
                <div className="d-flex justify-content-between align-items-center">
                    <strong>{eventInfo.event.title}</strong>
                    <Badge bg={statusBadges[status] || 'light'} className="ms-2">
                        {status}
                    </Badge>
                </div>
                <div className="small">{eventInfo.timeText}</div>
            </div>
        );
    };

    const EventDetailPopover = (
        <Popover id="event-detail-popover">
            <Popover.Header as="h3">
                {selectedEvent?.title}
                <Button
                    variant="link"
                    className="position-absolute end-0 top-0 p-1"
                    onClick={() => setSelectedEvent(null)}
                >
                    <XCircle />
                </Button>
            </Popover.Header>
            <Popover.Body>
                {selectedEvent && (
                    <>
                    <div className="mb-2">
                        <strong>Facility:</strong> {selectedEvent.extendedProps.facility}
                    </div>
                    <div className="mb-2">
                        <strong>Type:</strong>
                        <Badge bg="info" className="ms-2">
                            {selectedEvent.extendedProps.type}
                        </Badge>
                    </div>
                    <div className="mb-2">
                        <strong>Assigned To:</strong> {selectedEvent.extendedProps.assignedTo}
                    </div>
                    <div className="mb-2">
                        <strong>Time:</strong> {selectedEvent.start.toLocaleTimeString()} - {selectedEvent.end.toLocaleTimeString()}
                    </div>
                    <div className="mb-2">
                        <strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                        <Button variant="primary" size="sm">
                            View Details
                        </Button>
                    </div>
                    </>
                )}
            </Popover.Body>
        </Popover>
    );

    return (
        <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                    <Calendar className="me-2" /> Activities Calendar
                </h3>

                <div className="d-flex align-items-center">
                    <ButtonGroup className="me-3">
                        <Button
                            variant="outline-primary"
                            onClick={() => handleNavigation('today')}
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={() => handleNavigation('prev')}
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={() => handleNavigation('next')}
                        >
                            <ChevronRight />
                        </Button>
                    </ButtonGroup>

                    <ButtonGroup className="me-3">
                        <Button
                            variant={viewType === 'dayGridMonth' ? 'primary' : 'outline-primary'}
                            onClick={() => handleViewChange('dayGridMonth')}
                        >
                            <Grid /> Month
                        </Button>
                        <Button
                            variant={viewType === 'timeGridWeek' ? 'primary' : 'outline-primary'}
                            onClick={() => handleViewChange('timeGridWeek')}
                        >
                            <Grid /> Week
                        </Button>
                        <Button
                            variant={viewType === 'timeGridDay' ? 'primary' : 'outline-primary'}
                            onClick={() => handleViewChange('timeGridDay')}
                        >
                            <Grid /> Day
                        </Button>
                        <Button
                            variant={viewType === 'listWeek' ? 'primary' : 'outline-primary'}
                            onClick={() => handleViewChange('listWeek')}
                        >
                            <List /> List
                        </Button>
                    </ButtonGroup>

                    <Button variant="primary">
                        <Plus /> Add Activity
                    </Button>
                </div>
            </Card.Header>

            <Card.Body>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3">Loading activities...</p>
                    </div>
                ) : (
                    <div className="position-relative">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={false}
                            events={events}
                            eventClick={handleEventClick}
                            eventContent={renderEventContent}
                            height="70vh"
                            editable={true}
                            selectable={true}
                            nowIndicator={true}
                            dayMaxEvents={3}
                            eventDisplay="block"
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                meridiem: 'short'
                            }}
                        />

                        {selectedEvent && (
                            <OverlayTrigger
                                show={!!selectedEvent}
                                placement="auto"
                                overlay={EventDetailPopover}
                                target={document.querySelector('.fc-event-selected')}
                                container={calendarRef.current}
                                rootClose
                                onHide={() => setSelectedEvent(null)}
                            >
                                <div></div>
                            </OverlayTrigger>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ActivityCalendar;