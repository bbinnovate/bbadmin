import React from 'react'
import ContactApplications from '../components/ContactApplications'
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin – Contact Applications",
  description:
    "View and manage all contact form submissions received by Bombay Blokes. Review sender details, messages, selected services, and submission dates directly from the admin dashboard.",
};

const Index = () => {
  return (
     <SmoothScroll>
      <ContactApplications/>
      </SmoothScroll>
  )
}

export default Index