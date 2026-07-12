import React from 'react';
import styles from './css/OrdersCalendarView.module.css';

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid';
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

interface OrdersCalendarViewProps {
  orders: any[];
}

export const OrdersCalendarView: React.FC<OrdersCalendarViewProps> = ({ orders }) => {
  const events = orders.map(o => ({
    title: o.clientName,
    date: o.deliveryDate
  }))

  return (
    <div className={styles.calendarWrapper}>
      <FullCalendar
        plugins={[dayGridPlugin]}
        locales={[ptBrLocale]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        initialView='dayGridMonth'
        height="auto"
        eventDisplay="block"
        events={events}
      />
    </div>
  );
};
