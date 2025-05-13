import React, { useEffect, useState } from 'react'
import './Dashboard.css'
import Papa from 'papaparse';
import Message from '../Message/Message'


const Dashboard = () => {
    const [chatEnabled, setChatEnabled] = useState(false)
    const fetchData = async () => {
      const csvUrl = 'https://raw.githubusercontent.com/Ashaz4994/AGGLOMERATION/main/Data/Readings.csv';
      try {
        const response = await fetch(csvUrl, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawCsvData = await response.text();

        return new Promise((resolve, reject) => {
          Papa.parse(rawCsvData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(new Error("CSV parsing failed"));
              } else {
                resolve(results.data);
              }
            },
            error: (error) => reject(error),
          });
        });
      } catch (error) {
        console.error(`Failed to fetch or parse CSV: ${error.message}`);
        throw error;
      }
    };
    // const fetchData = async () => {
    //     const csvUrl = 'https://raw.githubusercontent.com/Ashaz4994/AGGLOMERATION/main/Data/Readings.csv';
    //     const personalAccessToken = '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'
    //     try {
    //       const response = await fetch(csvUrl, {
    //         method: "GET",
    //         headers: {
    //           Authorization: `token ${personalAccessToken}`,
    //           Accept: "application/vnd.github.v3.raw",
    //         },
    //         cache: "no-store",
    //       });
    
    //       if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //       }
    
    //       const rawCsvData = await response.text();
    
    //       return new Promise((resolve, reject) => {
    //         Papa.parse(rawCsvData, {
    //           header: true,
    //           skipEmptyLines: true,
    //           complete: (results) => {
    //             if (results.errors.length > 0) {
    //               reject(new Error("CSV parsing failed"));
    //             } else {
    //               resolve(results.data);
    //             }
    //           },
    //           error: (error) => {
    //             reject(error);
    //           },
    //         });
    //       });
    //     } catch (error) {
    //       console.error(`Failed to fetch or parse CSV: ${error.message}`);
    //       throw error;
    //     }
    //   };

    function convertTo12HourFormat(time24) {
        // Split the input time (24-hour format) into hours, minutes, and seconds
        let [hours, minutes, seconds] = time24.split(':');
        
        // Convert hours to number to check if it's AM or PM
        hours = parseInt(hours);
        
        // Determine if it's AM or PM
        const period = hours >= 12 ? 'PM' : 'AM';
        
        // Convert 24-hour time to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle the case for 12 AM/PM (should return 12 instead of 0)

        seconds = seconds.split(".")[0]
    
        // Return the time in hh:mm:ss AM/PM format
        return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${period}`;
    }

    const [date1, setDate1] = useState(null)
    const [time1, setTime1] = useState(null)
    const [Rate, setRate] = useState(null)
    const [Pressure, setPressure] = useState(null)
    const [Temp, setTemp] = useState(null)
    const [Leakage, setLeakage] = useState(false)

    useEffect(() => {

            let doonce = async ()=>{
                let temp = await fetchData()
                let ind = temp.length - 2
                let curr = Object.values(temp[ind])
                console.log(curr)

                setDate1(curr[0].split(" ")[0])
                let tim = curr[0].split(" ")[1]

                setTime1(convertTo12HourFormat(tim))

                setRate(curr[1]+" L/min")

                setPressure(curr[2]+" bar")

                setTemp(curr[3]+"°C")

                setLeakage(curr[4]==="1")
            }

            doonce()

            const interval = setInterval(async ()=>{
                let temp = await fetchData()
                let ind = temp.length - 2
                let curr = Object.values(temp[ind])
                console.log(curr)

                setDate1(curr[0].split(" ")[0])
                let tim = curr[0].split(" ")[1]

                setTime1(convertTo12HourFormat(tim))

                setRate(curr[1]+" L/min")

                setPressure(curr[2]+" bar")

                setTemp(curr[3]+"°C")

                setLeakage(curr[4]=="1")
            },6000)

            return ()=>{
                clearInterval(interval)
            }
    }, [])
    


    return (
        <div className='dash-box'>
            <div className="dashboard text-white">
                <div className='head'>Recent Sensor Data</div>
                <div>Date : {date1}</div>
                <div>Time : {time1}</div>
                <div>Water Flow Rate : {Rate}</div>
                <div>Pressure : {Pressure}</div>
                <div>Temperature : {Temp}</div>
                <div className={Leakage?"text-red-500":"text-green-500"}>{Leakage?"Leakage Detected":"No Leakage Detected"}</div>
            </div>
            <div onClick={()=>{setChatEnabled(!chatEnabled)}} className="cursor-pointer chat-button overflow-hidden absolute right-32 bottom-20 flex"><img className='w-14 h-14 object-cover rounded-full' src="../../../public/bot.jpg" alt="" /></div>
            {!chatEnabled && <span className='text-wrap text-green-500 absolute right-48 bottom-20 w-24'>Click to talk to ChatBot</span>}
            {chatEnabled && <Message/>}
        </div>
    )
}

export default Dashboard
