import React from 'react'
import CalculatorApplications from '../components/CalculatorApplications';
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Calculator Applications",
  description:
"View and manage all calculator applications submitted by users. Access lead details, selected services, cost estimates, and contact information from the Bombay Blokes admin panel.",};

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