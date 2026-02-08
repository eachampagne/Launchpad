import { useState, useEffect, useContext, type ChangeEvent } from 'react';
import { Link } from "react-router";
import axios from 'axios';

import { UserContext } from './UserContext';
import NavBar from "./NavBar";
import Theme from './Theme';
import LayoutGallery from './LayoutGallery';

type Layout = {
  id: number;
  gridSize: string;
  layoutElements: [];

};

type Dashboard = {
  id: number;
  name: string;
  layoutId: number | null;
};


function DashEditor() {
  const { activeDash: dashboardId, user: { id: ownerId } } = useContext(UserContext);
  
  const [dashboard, setDashboard] = useState({name: "Loading", ownerId: -1});
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [selectedLayoutId, setSelectedLayoutId] = useState(-1);//(-1 = nothing selected)
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null)
  const [appliedDash, setAppliedDash] = useState<Dashboard | null>(null)


  // function updateSelected (param: number){
  //   setSelectedLayoutId(param)
  // }

  // const [userId, setUserId] = useState(ownerId);


  const loadDashboard = async () => {
    try {
      const response = await axios.get(`/dashboard/${dashboardId}`);
      setDashboard(response.data);
      //setAppliedDash(response.data)
      setNewName(response.data.name);
    } catch (error) {
      console.error('Failed to get dashboard:', error);
    }
  };

  const renameDashboard = async () => {
    if (newName === dashboard.name) {
      setRenaming(false);
      return; // don't bother sending a request if it won't change anything
    }

    try {
      await axios.patch(`/dashboard/${dashboardId}`, {name: newName})
      loadDashboard();
      setRenaming(false);
    } catch (error) {
      console.error('Failed to rename dashboard:', error);
    }
  };

  const handleChange = (event: ChangeEvent) => {
    const target = event.target as unknown as HTMLInputElement; // whyyyyy
    setNewName(target.value);
  };

  const handleCancelRename = () => {
    setRenaming(false);
    setNewName(dashboard.name);
  }

  useEffect(() => {
    loadDashboard();
  }, [dashboardId]);

  //Will load layout when selectedLayoutId changes
  useEffect(() => {
    if(selectedLayoutId === -1){
      return;
    }

    axios.get(`/layout/${selectedLayoutId}`)
    .then((res) => {
      setSelectedLayout(res.data);

    }).catch((err) => {
      console.log('Could not find your layout:', err);
    });
  }, [selectedLayoutId]);

  //Will create a clone of applied layout
  const applyLayout = async (layoutId: number) => {
    try {
      //Update dashboard
      const response = await axios.post(`/dashboard/${dashboardId}/layout/${layoutId}`)
      console.log('Dashboard updated:', response.data)
      setAppliedDash(response.data)
      //Reload dash
      //loadDashboard();
      setDashboard(response.data)
    } catch (error) {
      console.error('Failed to use layout:', error);
    }

  }


  const renderName = () => {
    if (renaming) {
      return (
        <span>
          <input onChange={handleChange} value={newName}/>
          <button onClick={renameDashboard}>Save</button>
          <button onClick={handleCancelRename}>Cancel</button>
        </span>
      );
    } else {
      return (
        <span onClick={() => setRenaming(true)}>{dashboard.name}</span>
      );
    }
  };

  return (
    <>
      <NavBar pages={["Home", "Hub"]} />
      <h2>Editing: {renderName()}</h2>
      {appliedDash?.layoutId && (
        <section>
          <h3> APPLIED LAYOUT</h3>
          <p>LAYOUT ID: {appliedDash.layoutId}</p>
          {/**MVP GRID PLACEHOLDER */}
        </section>
      )}
      <Link to='/Dashboard'>Done</Link>
      <Theme dashboardId={dashboardId} dashboard={dashboard} ownerId={ownerId} />
      <LayoutGallery onSelect={setSelectedLayoutId}/>

      {selectedLayout && (
        <>
        <h4>LAYOUT PREVIEW</h4>
        <p>SELECTED LAYOUT #{selectedLayoutId}</p>
        <p>GRID SIZE: {selectedLayout.gridSize}</p>
        <button onClick={() => applyLayout(selectedLayout.id)}> APPLY CURRENT LAYOUT </button>
        </>
      )}

    </>
  );
}


export default DashEditor;
