import React from 'react'
import CalculatorForm from '../components/CalculatorForm';
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Calculator Management",
  description:
 "Create, edit, and manage service cost calculators from the Bombay Blokes admin dashboard. Configure questions, pricing logic, and calculator metadata in one place.",};

const Index = () => {
  return (
     <div>
       <SmoothScroll>
      <CalculatorForm/>
      </SmoothScroll>
    </div>
  )
}

export default Index