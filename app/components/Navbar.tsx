import React from 'react'
import Header from '@/app/components/Header'
import MobileNav from './MobileNav'
// import TaxiMobile from './TaxiMobile'

const Navbar = () => {
  return (

<div>
  <div className="hidden md:block">
    <Header /> {/* contains DesktopNav */}
  </div>
  <div className="block md:hidden">
   {/* <TaxiMobile /> */}
    <MobileNav />
  </div>
</div>

  )
}

export default Navbar