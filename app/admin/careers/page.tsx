import React from 'react'
import Career from '../components/Career'
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Career Page",
  description:
    "Manage career form submissions and job applications for Bombay Blokes. View applicant details, track submissions, and organize recruitment efficiently from the admin panel.",
};

const Index = () => {
  return (
    <div>
      <SmoothScroll>
      <Career/>
      </SmoothScroll>
    </div>
  )
}

export default Index