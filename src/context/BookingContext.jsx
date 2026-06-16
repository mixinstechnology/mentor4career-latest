import React, { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  // The mentor currently being booked (null = modal closed).
  const [mentor, setMentor] = useState(null);

  const openBooking = useCallback((m) => setMentor(m), []);
  const closeBooking = useCallback(() => setMentor(null), []);

  return (
    <BookingContext.Provider value={{ mentor, openBooking, closeBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
