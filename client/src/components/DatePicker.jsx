import React from "react";
import ReactDatePicker from "react-datepicker";

export default function DatePicker({ selected, onChange, placeholder }) {
  return (
    <div className="w-full">
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="yyyy-MM-dd h:mm aa" // 12-hour format
        placeholderText={placeholder || "Select date and time"}
        className="datepicker-input"
        calendarClassName="datepicker-calendar"
        headerClassName="datepicker-header"
        popperClassName="datepicker-popper"
        weekDayClassName={() => "datepicker-weekday"}
        dayClassName={() => "datepicker-day"}
      />
    </div>
  );
}
