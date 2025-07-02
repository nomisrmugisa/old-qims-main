import React, { useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const CustomDateRangePicker = ({ 
  startDate, 
  endDate, 
  onChange, 
  onClose,
  restrictToSecondWeek = false 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState({
    start: startDate,
    end: endDate
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getNextMonth = (date) => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(date.getMonth() + 1);
    return nextMonth;
  };

  const isSecondWeek = (date, monthStart) => {
    // Get the year and month from monthStart
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    
    // Find the first Sunday of the month
    let firstSunday = 1;
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (firstDayOfWeek === 0) {
      // If the 1st is a Sunday
      firstSunday = 1;
    } else {
      // Find the first Sunday
      firstSunday = 8 - firstDayOfWeek;
    }
    
    // Second week starts on the second Sunday
    const secondWeekStart = firstSunday + 7;
    const secondWeekEnd = secondWeekStart + 6;
    
    const dayOfMonth = date.getDate();
    return dayOfMonth >= secondWeekStart && dayOfMonth <= secondWeekEnd;
  };

  const isDateSelectable = (date, monthStart) => {
    if (!restrictToSecondWeek) return true;
    return isSecondWeek(date, monthStart);
  };

  const isDateInRange = (date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isDateSelected = (date) => {
    if (!selectedRange.start && !selectedRange.end) return false;
    return (selectedRange.start && date.getTime() === selectedRange.start.getTime()) ||
           (selectedRange.end && date.getTime() === selectedRange.end.getTime());
  };

  const handleDateClick = (date, monthStart) => {
    if (!isDateSelectable(date, monthStart)) return;

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      // Start new selection
      setSelectedRange({ start: date, end: null });
    } else if (selectedRange.start && !selectedRange.end) {
      // Complete the range
      if (date >= selectedRange.start) {
        setSelectedRange({ ...selectedRange, end: date });
      } else {
        setSelectedRange({ start: date, end: selectedRange.start });
      }
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = (monthDate, isSecondCalendar = false) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    
    const days = [];
    const monthStart = new Date(year, month, 1);

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <Box
          key={`prev-${day}`}
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ccc',
            fontSize: '14px',
            cursor: 'default'
          }}
        >
          {day}
        </Box>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelectable = isDateSelectable(date, monthStart);
      const isSelected = isDateSelected(date);
      const isInRange = isDateInRange(date);
      
               days.push(
           <Box
             key={day}
             onClick={() => handleDateClick(date, monthStart)}
             sx={{
               width: 32,
               height: 32,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '14px',
               cursor: isSelectable ? 'pointer' : 'not-allowed',
               backgroundColor: isSelected ? '#1976d2' : isInRange ? '#e3f2fd' : (isSelectable ? '#f8f9fa' : 'transparent'),
               borderRadius: '4px',
               border: isSelectable ? '1px solid #e0e0e0' : 'none',
               '&:hover': isSelectable ? {
                 backgroundColor: isSelected ? '#1976d2' : '#e3f2fd',
                 borderColor: '#1976d2'
               } : {},
               fontWeight: isSelected ? 'bold' : (isSelectable ? 'medium' : 'normal'),
               color: isSelected ? 'white' : (isSelectable ? '#1976d2' : '#ccc'),
               opacity: isSelectable ? 1 : 0.5
             }}
           >
             {day}
           </Box>
         );
    }

    // Next month's leading days
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <Box
          key={`next-${day}`}
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ccc',
            fontSize: '14px',
            cursor: 'default'
          }}
        >
          {day}
        </Box>
      );
    }

    return (
      <Box sx={{ flex: 1, minWidth: 250 }}>
        {/* Month Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mb: 2,
          height: 40
        }}>
          {!isSecondCalendar && (
            <IconButton 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              size="small"
            >
              <ChevronLeft />
            </IconButton>
          )}
          
          <Typography variant="h6" sx={{ mx: 2, minWidth: 100, textAlign: 'center' }}>
            {monthNames[month]} {year}
          </Typography>
          
          {isSecondCalendar && (
            <IconButton 
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              size="small"
            >
              <ChevronRight />
            </IconButton>
          )}
        </Box>

        {/* Day Headers */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 0.5, 
          mb: 1 
        }}>
          {dayNames.map(day => (
            <Box
              key={day}
              sx={{
                width: 32,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#666'
              }}
            >
              {day}
            </Box>
          ))}
        </Box>

        {/* Calendar Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 0.5 
        }}>
          {days}
        </Box>
      </Box>
    );
  };

  const handleCancel = () => {
    setSelectedRange({ start: startDate, end: endDate });
    onClose();
  };

  const handleApply = () => {
    onChange(selectedRange.start, selectedRange.end);
    onClose();
  };

  return (
    <Box sx={{
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 1000,
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      p: 3,
      minWidth: 540
    }}>
      {/* Header */}
      <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', textAlign: 'center' }}>
        Select Date Range {restrictToSecondWeek && '(Only second week dates are selectable)'}
      </Typography>

      {/* Dual Calendar */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {renderCalendar(currentMonth)}
        {renderCalendar(getNextMonth(currentMonth), true)}
      </Box>

      {/* Footer Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button 
          variant="text" 
          onClick={handleCancel}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleApply}
          disabled={!selectedRange.start || !selectedRange.end}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
};

export default CustomDateRangePicker; 