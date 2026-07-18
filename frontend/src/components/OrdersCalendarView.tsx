import React from 'react';
import styles from './css/OrdersCalendarView.module.css';

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid';
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { useNavigate } from 'react-router-dom';

interface OrdersCalendarViewProps {
  orders: any[];
}

export const OrdersCalendarView: React.FC<OrdersCalendarViewProps> = ({ orders }) => {
  const navigate = useNavigate();

  const events = orders.map(o => ({
    title: o.clientName,
    date: o.deliveryDate,
    id: o.id
  }))

  function handleEventClick(clickInfo: any){
    navigate(`/pedido/${clickInfo.event.id}`)
  }

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
        eventClick={handleEventClick}
      />
    </div>
  );
};
