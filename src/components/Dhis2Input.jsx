import React, { useState, useEffect } from 'react';
import './Dhis2Input.css';

const Dhis2Input = ({ dataElement, value, onChange }) => {
  const { id, displayFormName, valueType, compulsory, optionSet } = dataElement;
  const [internalValue, setInternalValue] = useState(value || '');
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('');

  useEffect(() => {
    if (valueType === 'DATETIME' && value) {
      const [date = '', time = ''] = value.split('T');
      setDatePart(date);
      setTimePart(time.substring(0, 5)); // HH:mm
    }
    setInternalValue(value);
  }, [value, valueType]);

  const handleDateTimeChange = (part, val) => {
    let newDate = datePart;
    let newTime = timePart;

    if (part === 'date') {
      newDate = val;
      setDatePart(val);
    } else {
      newTime = val;
      setTimePart(val);
    }

    if (newDate) {
      onChange(id, `${newDate}T${newTime || '00:00'}`);
    } else {
      onChange(id, ''); // Clear value if date is cleared
    }
  };

  const renderInput = () => {
    // Prioritize rendering as a dropdown if an optionSet exists
    if (optionSet && optionSet.options && optionSet.options.length > 0) {
      return (
        <select value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input">
          <option value="">{displayFormName}</option>
          {optionSet.options.sort((a,b) => a.sortOrder - b.sortOrder).map(option => (
            <option key={option.id} value={option.code}>{option.displayName}</option>
          ))}
        </select>
      );
    }

    // Fallback to valueType if no optionSet is present
    switch (valueType) {
      case 'TEXT':
      case 'LONG_TEXT':
        return <textarea placeholder={displayFormName} value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input" />;
      
      case 'NUMBER':
      case 'INTEGER':
      case 'INTEGER_POSITIVE':
      case 'INTEGER_NEGATIVE':
      case 'INTEGER_ZERO_OR_POSITIVE':
        return <input type="number" placeholder={displayFormName} value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input" />;
      
      case 'BOOLEAN':
      case 'TRUE_ONLY':
        return (
          <div className="dhis2-checkbox-group">
            <label>
              <input type="checkbox" checked={internalValue === 'true'} onChange={(e) => onChange(id, e.target.checked.toString())} required={compulsory} />
              {displayFormName}
            </label>
          </div>
        );
        
      case 'DATE':
        return <input type="date" value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input" />;

      case 'DATETIME':
        return (
          <div className="dhis2-datetime-container">
            <input
              type="date"
              value={datePart}
              onChange={(e) => handleDateTimeChange('date', e.target.value)}
              required={compulsory}
              className="dhis2-input date-part"
              placeholder="YYYY-MM-DD"
            />
            <input
              type="time"
              value={timePart}
              onChange={(e) => handleDateTimeChange('time', e.target.value)}
              className="dhis2-input time-part"
              placeholder="HH:MM"
            />
          </div>
        );
      
      default:
        // Generic text input for any other unhandled types
        return <input type="text" placeholder={displayFormName} value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input" />;
    }
  };

  return <div className="dhis2-input-container">{renderInput()}</div>;
};

export default Dhis2Input; 