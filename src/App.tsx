import { BrowserRouter, Routes, Route } from "react-router";

import UserProvider from './UserContext';

import Hub from "./Hub";
import Dashboard from './Dashboard';
import DashEditor from './DashEditor';
import Home from './Home';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/edit' element={<DashEditor />} />
          <Route path="/hub" element={<Hub />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
