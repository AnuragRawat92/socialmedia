import React, { useState } from 'react'
import { AiOutlineHome } from "react-icons/ai";
import { AiFillHome } from "react-icons/ai";
import { BsCameraReels } from "react-icons/bs";
import { BsFillCameraReelsFill } from "react-icons/bs";
import { IoSearchCircleOutline } from "react-icons/io5";
import { IoSearchCircleSharp } from "react-icons/io5";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { RiAccountCircleFill } from "react-icons/ri";
import { RiAccountCircleLine } from "react-icons/ri";
import { Link } from 'react-router-dom';
const NavigationBar = () => {
    const [tab ,setTab]=useState(window.location.pathname)
    console.log(tab)
  return (
    <div className='fixed bottom-0 w-full bg-white py-3'>
        <div className="flex justify-around">
            <Link to={'/'} onClick={()=>setTab("/")} className="flex flex-col items-center text-2xl">
            <span>
           {tab==="/"?<AiFillHome/> : <AiOutlineHome />}
                </span></Link>
                <Link to={'/reels'} onClick={()=>setTab("/reels")} className="flex flex-col items-center text-2xl">
            <span>
            {tab==="/reels"?<BsFillCameraReelsFill/> : <BsCameraReels />}
                </span></Link>
                <Link to={'/search'} onClick={()=>setTab("/serach")} className="flex flex-col items-center text-2xl">
            <span>
            {tab==="/search"?<IoSearchCircleSharp /> : <IoSearchCircleOutline />}
                </span></Link>
                <Link to={'/chat'} onClick={()=>setTab("/chat")} className="flex flex-col items-center text-2xl">
            <span>
            {tab==="/chat"?<IoChatbubbleEllipses /> : <IoChatbubbleEllipsesOutline />}
                </span></Link>
                <Link to={'/account'} onClick={()=>setTab("/account")} className="flex flex-col items-center text-2xl">
            <span>
         
            {tab==="/account"?<RiAccountCircleFill /> : <RiAccountCircleLine />}
                </span></Link>
              
        </div>
      
    </div>
  )
}

export default NavigationBar
