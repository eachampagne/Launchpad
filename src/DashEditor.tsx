import { useState, useEffect, type ChangeEvent } from 'react';
import { Link } from "react-router";
import axios from 'axios';
import Theme from './Theme';
import LayoutGallery from './LayoutGallery';

type Layout = {
  id: number;
  gridSize: string;
  layoutElements: [];

};


function DashEditor({dashboardId, ownerId}: {dashboardId: number, ownerId: number}) {
  const [dashboard, setDashboard] = useState({name: "Loading", ownerId: -1});
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [selectedLayoutId, setSelectedLayoutId] = useState(-1);//(-1 = nothing selected)
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null)


  // function updateSelected (param: number){
  //   setSelectedLayoutId(param)
  // }

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

  //Will load layout when selectedLayoutId changes
  useEffect(() => {
    axios.get(`/layout/${selectedLayoutId}`)
    .then((res) => {
      setSelectedLayout(res.data);

    }).catch((err) => {
      console.log('Could not find your layout:', err);
    });
  }, [selectedLayoutId]);

  //Will create a copy of layout
  const copyLayout = async (layoutId: number) => {
      if (!selectedLayout) return;
    try {
      const response = await axios.post(`/layout/${layoutId}/copy`)
      console.log('Layout is copied:', response.data)
      //copy and preview copied layout
      setSelectedLayout(response.data);
      setSelectedLayoutId(response.data.id);
    } catch (error) {
      console.error('Failed to copy layout:', error);
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
      <h2>Editing: {renderName()}</h2>
      <Link to='/'>Done</Link>
      <Theme dashboardId={dashboardId} dashboard={dashboard} ownerId={ownerId} />
      <LayoutGallery onSelect={setSelectedLayoutId}/>

      {selectedLayout && (
        <>
        <h4>LAYOUT PREVIEW</h4>
        <p>SELECTED LAYOUT #{selectedLayoutId}</p>
        <p>GRID SIZE: {selectedLayout.gridSize}</p>
        <button onClick={() => copyLayout(selectedLayout.id)}> COPY CURRENT LAYOUT </button>
        </>
      )}
    </>
  );
}

export default DashEditor;
