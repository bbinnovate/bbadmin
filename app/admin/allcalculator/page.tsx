import React from 'react'
import AllCalculator from '../components/AllCalculator';
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Calculator Management",
  description:
 "View and manage all service cost calculator presets in the Bombay Blokes admin panel. Create, edit, or organize calculators and their configurations from one place.",};

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