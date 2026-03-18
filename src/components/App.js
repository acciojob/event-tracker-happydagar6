import React, { useState } from "react";
import "../styles/App.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import BigCalendar from "react-big-calendar";
import moment from "moment";

const localizer = BigCalendar.momentLocalizer(moment);

export default function App() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({ title: "", location: "" });

  const isPastEvent = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() <= today.getTime();
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setSelectedEvent(null);
    setFormData({ title: "", location: "" });
    setShowPopup(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEvent = () => {
    if (!formData.title || !selectedDate) return;

    if (selectedEvent) {
      setEvents(
        events.map(event =>
          event.id === selectedEvent.id
            ? { ...event, title: formData.title, location: formData.location }
            : event
        )
      );
    } else {
      const newEvent = {
        id: Date.now(),
        title: formData.title,
        location: formData.location,
        start: selectedDate,
        end: new Date(selectedDate.getTime() + 60 * 60 * 1000),
        category: isPastEvent(selectedDate) ? "past" : "upcoming",
      };
      setEvents([...events, newEvent]);
    }

    setShowPopup(false);
    setFormData({ title: "", location: "" });
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    setEvents(events.filter(event => event.id !== selectedEvent.id));
    setShowPopup(false);
    setFormData({ title: "", location: "" });
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormData({ title: event.title, location: event.location });
    setShowPopup(true);
  };

  const getFilteredEvents = () => {
    if (filter === "all") {
      return events;
    }
    if (filter === "past") {
      return events.filter(event => isPastEvent(event.start));
    }
    if (filter === "upcoming") {
      return events.filter(event => !isPastEvent(event.start));
    }
    return events;
  };

  const filteredEvents = getFilteredEvents();

  const getEventStyle = (event) => ({
    backgroundColor: event.category === "past"
      ? "rgb(222, 105, 135)"
      : "rgb(140, 189, 76)",
  });

  return (
    <div className="app-container">
      <div className="filter-container">
        <button className="btn" onClick={() => setFilter("all")}>
          All
        </button>
        <button className="btn" onClick={() => setFilter("past")}>
          Past
        </button>
        <button className="btn" onClick={() => setFilter("upcoming")}>
          Upcoming
        </button>
      </div>

      <div className="calendar-wrap">
        <BigCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 420 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          popup
          eventPropGetter={(event) => ({
            style: getEventStyle(event),
          })}
        />
      </div>

      {showPopup && (
        <div className="mm-popup-overlay">
          <div className="mm-popup">
            <div className="mm-popup__header">
              <h2>Event</h2>
            </div>
            <div className="mm-popup__box">
              <div className="event-form">
                <input
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={handleFormChange}
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Event Location"
                  value={formData.location}
                  onChange={handleFormChange}
                />
              </div>

              <div className="mm-popup__box__footer__right-space">
                {selectedEvent && (
                  <button
                    className="mm-popup__btn mm-popup__btn--info"
                    onClick={handleSaveEvent}
                  >
                    Edit
                  </button>
                )}
                {selectedEvent && (
                  <button
                    className="mm-popup__btn mm-popup__btn--danger"
                    onClick={handleDeleteEvent}
                  >
                    Delete
                  </button>
                )}
                {!selectedEvent && (
                  <button className="mm-popup__btn" onClick={handleSaveEvent}>
                    Save
                  </button>
                )}
                <button
                  className="mm-popup__btn mm-popup__btn--close"
                  onClick={() => {
                    setShowPopup(false);
                    setFormData({ title: "", location: "" });
                    setSelectedEvent(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
