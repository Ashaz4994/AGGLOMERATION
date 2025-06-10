import React from 'react'
import './Navbar.css'
import { Link } from 'react-router-dom'


const Navbar = () => {
const downloadCsv = () => {
    const rawUrl = 'https://raw.githubusercontent.com/Ashaz4994/AGGLOMERATION/main/Data/Readings.csv';

    fetch(rawUrl, {
        method: 'GET',
        cache: 'no-store' // prevent caching, ensures latest file is fetched
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch the file: ${response.statusText}`);
            }
            return response.text();
        })
        .then(csvContent => {
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Readings.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('File downloaded successfully!');
        })
        .catch(error => {
            console.error('Error downloading the file:', error);
        });
};

//   const downloadCsv = () => {
//     const token = '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'; // Replace with your GitHub token
//     const fileUrl = 'https://api.github.com/repos/Ashaz4994/AGGLOMERATION/contents/Data/Readings.csv?ref=main';

//     // Fetch the CSV file
//     fetch(fileUrl, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`, // Add authentication if it's a private repository
//             'Accept': 'application/vnd.github.v3.raw', // Get raw content
//         },
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch the file: ${response.statusText}`);
//             }
//             return response.text(); // Parse the response as text
//         })
//         .then(csvContent => {
//             // Create a blob from the CSV content
//             const blob = new Blob([csvContent], { type: 'text/csv' });

//             // Create a temporary link for downloading
//             const link = document.createElement('a');
//             link.href = URL.createObjectURL(blob);
//             link.download = 'Readings.csv'; // Name of the downloaded file
//             document.body.appendChild(link);
//             link.click();

//             // Clean up
//             document.body.removeChild(link);
//             console.log('File downloaded successfully!');
//         })
//         .catch(error => {
//             console.error('Error downloading the file:', error);
//         });
// };

  return (
    <nav>
        <div className='logo'>
          <div className='logo1'>AquaGuard</div>
          <div className='logo2'>AquaGuard</div>
        </div>
        <ul>
            <li><Link to='/'> Home</Link></li>
            <li><Link to='/visualize'>Visualize Trends</Link></li>
            <li onClick={downloadCsv}>Download .csv</li>
        </ul>
    </nav>
  )
}

export default Navbar
