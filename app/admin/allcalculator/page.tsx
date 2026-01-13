import React from 'react'
import AllCalculator from '../components/AllCalculator';
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
      <AllCalculator/>
      </SmoothScroll>
    </div>
  )
}

export default Index