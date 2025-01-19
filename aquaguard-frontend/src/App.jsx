import './App.css'
import Dashboard from './components/Dashboard/Dashboard'
import Home from './components/Home/Home'
import Loader from './components/Loader/Loader'
import Parse_csv from './components/Parse_csv/Parse_csv'
import Navbar from './components/Navbar/Navbar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <><Home/><Navbar/><Dashboard/></>
    },
    {
      path: '/visualize',
      element: <><Navbar/><Parse_csv/></>
    }
  ])

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
