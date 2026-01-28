import { useState, useEffect, type ChangeEvent } from 'react';
import { Link } from "react-router";
import axios from 'axios';
import Theme from './Theme';
import LayoutGallery from './LayoutGallery';


function DashEditor({dashboardId, ownerId}: {dashboardId: number, ownerId: number}) {
  const [dashboard, setDashboard] = useState({name: "Loading", ownerId: -1});
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  //ts infer selectedLayout as number(-1 = nothing selected)
  const [selectedLayoutId, setSelectedLayoutId] = useState(-1);

  function updateSelected (param: number){
    setSelectedLayoutId(param)
  }

  // const [userId, setUserId] = useState(ownerId);


  const loadDashboard = async () => {
    try {
      const response = await axios.get(`/dashboard/${dashboardId}`);
      setDashboard(response.data);
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
  }, []);

  useEffect(() => {
    console.log('selectedLayoutId:', selectedLayoutId);
  }, [selectedLayoutId]);

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
      <h2>Editing: {renderName()}</h2>
      <Link to='/'>Done</Link>
      <Theme dashboard={dashboard} ownerId={ownerId} dashboardId={dashboardId}/>
      <LayoutGallery onSelect={updateSelected}/>
    </>
  );
}

export default DashEditor;
