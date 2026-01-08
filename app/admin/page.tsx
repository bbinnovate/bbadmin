import React from 'react'
import AdminDashboard from './components/AdminDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Dashboard",
  description:
    "View a complete overview of Bombay Blokes’ admin activities, including blog analytics, user insights, career submissions, and scheduled content. Manage operations efficiently from the central dashboard.",
};



const Index = () => {
  return (
    <div>
      <AdminDashboard/>
    </div>
  )
}

export default Index