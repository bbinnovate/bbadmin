import React from 'react'
import CalculatorApplications from '../components/CalculatorForm';
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Calculator Applications",
  description:
    "View and manage individual calculator applications submitted to Bombay Blokes. Access applicant details, review submissions, and handle recruitment efficiently from the admin panel.",
};

const Index = () => {
  return (
     <div>
       <SmoothScroll>
      <CalculatorApplications/>
      </SmoothScroll>
    </div>
  )
}

export default Index