import React from 'react'
import ClientApplications from '../components/ClientApplications'
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin – Client Applications",
  description:
    "Manage and review all client applications submitted to Bombay Blokes. View company details, contact information, requested services, and application dates from the admin dashboard.",
};

const Index = () => {
  return (
    <div>
       <SmoothScroll>
      <ClientApplications/>
      </SmoothScroll>
    </div>
  )
}

export default Index