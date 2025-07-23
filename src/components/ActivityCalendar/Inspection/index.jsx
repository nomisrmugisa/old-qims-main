/**
 * Created by fulle on 2025/07/16.
 */
// components/ActivityCalendar.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';

import {
    Card,
    ButtonGroup,
    Button,
    Spinner,
    OverlayTrigger,
    Popover,
    Badge,
    Modal,
    Tooltip
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


import {
    mapInspectionsToEvents,
    extractFacilityOptions,
    extractInspectorOptions,
    formatInclusiveEnd,
    subtractOneDay
} from '../../../utils/calendar';
import { getInitials, toggle } from '../../../utils/helpers';

import {InspectionService} from '../../../services';
import inspectionsData from '../../../data/inspectionsData.json';

const InspectionCalendar = () => {

    const calendarRef = useRef(null);

// visible date range (set by FullCalendar via datesSet)
    const [range, setRange] = useState({ start: null, end: null });

    // filters
    const [facilitySel, setFacilitySel] = useState([]);
    const [inspectorSel, setInspectorSel] = useState([]);

    const [events, setEvents] = useState([]);
    const [apiData, setApiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState('dayGridMonth');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [facilityFilter, setFacility] = useState([]);
    const [inspectorFilter, setInspector] = useState([]);

    const [modalEvent, setModalEvent] = useState(null);


    const getInspectionSchedule = async() => {
        try {
            const response = await InspectionService.schedule();
            window.console.log("---*");
            window.console.log(response);
            window.console.log("inspection-schedule-result-***");
            setApiData(response);
            setLoading(false);
        }
        catch(error) {

        }
        finally {
            //setApiData(inspectionsData);
            //setLoading(false);
        }
    };

    const FacilityFilter = ({ options, selected, onChange }) => {
        return (
            <div className="mb-3">
                <strong>Facilities</strong>
                <div className="d-flex flex-column gap-1 mt-1">
                    {options.map(opt => (
                        <label key={opt.value} className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selected.includes(opt.value)}
                                onChange={e => toggle(opt.value, selected, onChange)}
                            />
                            <span className="form-check-label">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };
    const InspectorFilter = ({ options, selected, onChange }) => {
        return (
            <div className="mb-3">
                <strong>Inspectors</strong>
                <div className="d-flex flex-column gap-1 mt-1">
                    {options.map(opt => (
                        <label key={opt.value} className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selected.includes(opt.value)}
                                onChange={e => toggle(opt.value, selected, onChange)}
                            />
                            <span className="form-check-label">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    const InspectionModal = ({ event, onHide }) => {
        if (!event) return null;
        const { title, extendedProps } = event;
        const { date, assignments } = extendedProps;

        return (
            <Modal show onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>{title} - {date}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Inspections</h5>
                    <ul className="mb-0">
                        {assignments.map((assignment, idx) => (
                            <li key={idx}>
                                <strong>{assignment.inspectorName}</strong>
                                {assignment.sections?.length > 0 && (
                                    <div>Sections: {assignment.sections.join(', ')}</div>
                                    )}
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Close</Button>
                    <Button variant="primary">Open Inspection</Button>
                </Modal.Footer>
            </Modal>
        );
    };


    // Fetch activities (replace with your API call)
    useEffect(() => {

        getInspectionSchedule();
    }, []);

    const allEvents = useMemo(
        () => (apiData ? mapInspectionsToEvents(apiData):[]),
        [apiData]
    );

    // Build filter option lists
    const facilityOptions = useMemo(() => extractFacilityOptions(apiData), [apiData]);
    const inspectorOptions = useMemo(() => extractInspectorOptions(apiData), [apiData]);

    const visibleEvents = useMemo(() => {
        if (!facilitySel.length && !inspectorSel.length) return allEvents;
        return allEvents.filter(ev => {
            const { facilityId, inspectorId } = ev.extendedProps || {};
            const facOk = !facilitySel.length || facilitySel.includes(facilityId);
            const inspOk = !inspectorSel.length || inspectorSel.includes(inspectorId);
            return facOk && inspOk;
        });
    }, [allEvents, facilitySel, inspectorSel]);


    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
    };

    // FullCalendar calls this whenever the visible date range changes (prev/next etc.)
    const handleDatesSet = (arg) => {
        const start = arg.startStr.slice(0, 10); // date-only
        // arg.endStr is exclusive; subtract a day if your API expects inclusive
        const inclusiveEnd = subtractOneDay(arg.endStr);
        setRange({ start, end: inclusiveEnd });
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
        const { event } = eventInfo;
        const { facilityName, assignments } = event.extendedProps;
        const inspectors = assignments.map(a => a.inspectorName);
        const distinctInspectors = [...new Set(inspectors)];

        return (
            <div className="d-flex flex-column w-100">
                <div className="facility-section mb-1">
                    <strong>{facilityName}</strong>
                </div>
                <div className="inspectors-section d-flex flex-wrap gap-1">
                    {distinctInspectors.slice(0, 5).map((inspector, idx) => (
                        <OverlayTrigger
                            key={idx}
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-${event.id}-${idx}`}>
                                    {inspector}
                                </Tooltip>
                            }
                        >
                            <Badge bg="primary">{getInitials(inspector)}</Badge>
                        </OverlayTrigger>
                    ))}
                    {distinctInspectors.length > 5 && (
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-${event.id}-more`}>
                                    {distinctInspectors.slice(5).map((insp, i) => (
                                        <div key={i}>{insp} - {event.extendedProps.facilityName}</div>
                                    ))}
                                </Tooltip>
                            }
                        >
                            <Badge bg="secondary">
                                +{distinctInspectors.length - 5}
                            </Badge>
                        </OverlayTrigger>
                    )}
                </div>
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
                            variant={viewType === 'listWeek' ? 'primary' : 'outline-primary'}
                            onClick={() => handleViewChange('listWeek')}
                        >
                            <List /> List
                        </Button>
                    </ButtonGroup>


                </div>
            </Card.Header>

            <Card.Body>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3">Loading activities...</p>
                    </div>
                ) : (
                    <>
                    <div className="col-md-3 col-lg-2 mb-3">

                        <FacilityFilter
                            options={facilityOptions}
                            selected={facilitySel}
                            onChange={setFacilitySel}
                        />

                        <InspectorFilter
                            options={inspectorOptions}
                            selected={inspectorSel}
                            onChange={setInspectorSel}
                        />
                    </div>
                    <div className="position-relative">
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin, bootstrap5Plugin]}
                            themeSystem="bootstrap5"
                            initialView="dayGridMonth"
                            events={visibleEvents /* from §4 */}
                            eventContent={renderEventContent}        // §2
                            eventClick={({ event }) => setModalEvent(event)} // open
                            height="auto"
                            fixedWeekCount={false}
                            headerToolbar={{ start: 'title', end: 'prev,next today' }}
                        />

                        <InspectionModal event={modalEvent} onHide={() => setModalEvent(null)} />

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
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default InspectionCalendar;