import React from 'react'
import CareerApplications from '../components/CareerApplications'
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Career Application",
  description:
    "View and manage individual career applications submitted to Bombay Blokes. Access applicant details, review submissions, and handle recruitment efficiently from the admin panel.",
};

const Index = () => {
  return (
    <div>
       <SmoothScroll>
      <CareerApplications/>
      </SmoothScroll>
    </div>
  )
}

export default Index