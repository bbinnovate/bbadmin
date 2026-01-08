import React from 'react'
import Blogs from '../components/Blogs'
import SmoothScroll from '@/app/components/SmoothScroll'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin Blogs",
  description:
    "Manage all blog posts for Bombay Blokes. Create, edit, schedule, and publish blogs directly from the admin panel with full control over content and categories.",
};


const page = () => {
  return (
    <div>
      <SmoothScroll>
      <Blogs/>
      </SmoothScroll>
    </div>
  )
}

export default page