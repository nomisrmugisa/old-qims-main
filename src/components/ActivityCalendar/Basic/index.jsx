/**
 * Created by fulle on 2025/07/16.
 */
import React, { useState } from 'react';
import {
    Card,
    ButtonGroup,
    Button,
    Badge,
    Row,
    Col
} from 'react-bootstrap';
import {
    ChevronLeft,
    ChevronRight,
    Plus
} from 'react-bootstrap-icons';
import { format, addDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import './index.css';

const SimpleActivityCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activities] = useState([
        { id: 1, date: new Date(), title: 'Facility Inspection', type: 'inspection' },
        { id: 2, date: addDays(new Date(), 3), title: 'Staff Training', type: 'training' },
    ]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const getDayActivities = (day) => {
        return activities.filter(activity => isSameDay(activity.date, day));
    };

    const getTypeVariant = (type) => {
        const types = {
            inspection: 'primary',
            training: 'success',
            meeting: 'warning',
            maintenance: 'info'
        };
        return types[type] || 'secondary';
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Activities Calendar</h3>
                <div>
                    <ButtonGroup className="me-2">
                        <Button variant="outline-primary" onClick={prevMonth}>
                            <ChevronLeft />
                        </Button>
                        <Button variant="outline-primary" onClick={nextMonth}>
                            <ChevronRight />
                        </Button>
                    </ButtonGroup>
                    <Button variant="primary">
                        <Plus /> Add Activity
                    </Button>
                </div>
            </Card.Header>

            <Card.Body>
                <div className="text-center mb-4">
                    <h4>{format(currentDate, 'MMMM yyyy')}</h4>
                </div>

                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-header">
                            {day}
                        </div>
                    ))}

                    {days.map(day => (
                        <div
                            key={day.toString()}
                            className={`calendar-day ${isSameMonth(day, currentDate) ? '' : 'out-of-month'}`}
                        >
                            <div className="day-number">{format(day, 'd')}</div>
                            <div className="day-activities">
                                {getDayActivities(day).map(activity => (
                                    <Badge
                                        key={activity.id}
                                        bg={getTypeVariant(activity.type)}
                                        className="d-block mb-1 text-truncate"
                                    >
                                        {activity.title}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
};

export default SimpleActivityCalendar;