import React from 'react';

const GOOGLE_CALENDAR_ID = 'crm-369@atomic-nation-452421-c9.iam.gserviceaccount.com'; // or your own calendar ID

const CalendarPage = () => {
  return (
    <div className="w-full h-[80vh] mt-6">
      <iframe
        src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(GOOGLE_CALENDAR_ID)}&ctz=UTC`}
        style={{ border: 0, width: '100%', height: '100%' }}
        frameBorder="0"
        scrolling="no"
      />
    </div>
  );
};

export default CalendarPage; 