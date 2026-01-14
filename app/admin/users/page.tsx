import React from 'react'
import Users from '../components/Users'
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Users",
  description:
    "Manage all registered users of the Bombay Blokes platform. View user details, update roles, and maintain secure access control within the admin panel.",
};


const Index = () => {

  

  return (
    <div>
      <SmoothScroll>
      <Users/>
      </SmoothScroll>
    </div>
  )
}

export default Index