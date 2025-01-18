import React, { useEffect, useState } from 'react'
import './Loader.css'

let interval = null

const Loader = () => {

    const [dots, setDots] = useState("")

    useEffect(() => {
      if(interval != null) clearInterval(interval)

        interval = setInterval(()=>{
            if(dots==="...") setDots("")
            else setDots(dots+".")
        },500)
    })
    

    return (
        <div className='loader'>
            <div id="box">
                <div id="tile01">
                    <div id="mask">{"Loading" + dots}</div>
                </div>
            </div>
        </div>
    )
}

export default Loader
