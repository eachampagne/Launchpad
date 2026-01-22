// import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router";

import Dashboard from './Dashboard';
import DashEditor from './DashEditor';

function App() {
  const activeDash = 1; // hardcoded for now
  // eventually want something like:
  // const [activeDash, setActiveDash] = useState(null)
  // what happens if the user doesn't have any dashboards?


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard dashboardId={activeDash}/>} />
        <Route path='/edit' element={<DashEditor dashboardId={activeDash}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
