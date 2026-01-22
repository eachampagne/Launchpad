import { useState, useEffect, type ChangeEvent } from 'react';
import { Link } from "react-router";
import axios from 'axios';

function DashEditor({dashboardId}: {dashboardId: number}) {
  const [dashboard, setDashboard] = useState({name: "Loading"});
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`/dashboard/${dashboardId}`);
      console.log(response.data);
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
    </>
  );
}

export default DashEditor;
