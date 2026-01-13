import React from 'react'
import Navbar from '../components/Navbar';
// import Firstsection from '../components/Firstsection';
import PreviewPage from "./PreviewPage";
// import SecondSection from '../components/SecondSection';
import Footer from '../components/Footer'

const Preview = () => {
  return (
    <div>

              <Navbar/>
{/* <Firstsection/> */}

<PreviewPage/>
{/* <SecondSection/> */}
  <Footer />
    </div>
  )
}

export default Preview