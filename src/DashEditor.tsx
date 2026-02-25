import { useState, useEffect, useContext, type ChangeEvent } from 'react';
import { Link } from "react-router";
import { Box, Flex } from "@chakra-ui/react";

import axios from 'axios';

import { UserContext } from './UserContext';
import NavBar from "./NavBar";
import Theme from './Theme';
import LayoutGallery from './LayoutGallery';
import LayoutCanvas from './LayoutCanvas'
import WidgetLibrary from "./WidgetLibrary";

type Layout = {
  id: number;
  gridSize: string;
  layoutElements: LayoutElement[];
};

type LayoutElement = {
  id: number;
  posX: number;
  posY: number;
  sizeX: number;
  sizeY: number;
  widget: {
    name: string
  }
};

type Dashboard = {
  id: number;
  name: string;
  layout: Layout
  ownerId: number;
  layoutId: number | null;
};

const gridCols = 19;
const gridRows = 12;
//px per grid unit
const snapSize = 60;




function DashEditor() {
  const { activeDash: dashboardId, user: { id: ownerId } } = useContext(UserContext);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);


  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [selectedLayoutId, setSelectedLayoutId] = useState(-1);//(-1 = nothing selected)
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null)
  const [appliedDash, setAppliedDash] = useState<Dashboard | null>(null)

  


  // function updateSelected (param: number){
  //   setSelectedLayoutId(param)
  // }

  // const [userId, setUserId] = useState(ownerId);

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

    if (!dashboard) {
    console.log("No dashboard")
    return <div>
      Loading
    </div>;
  }

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

      <Flex
        width="100%"
        minH="calc(100vh - 120px)"
        my={6}
        px={6}
        gap={6}
        align="flex-start"
      >
        {/* LEFT: GRID EDITOR */}
        <Box flex="1" display="flex" justifyContent="center">
          <Box
            width={`${gridCols * snapSize}px`}
            height={`${gridRows * snapSize}px`}
            border="1px solid"
            borderColor="gray.500"
            borderRadius="md"
            bg="white"
          >
            {/* SCALE CONTAINER */}
            <LayoutCanvas layout={dashboard.layout} editable  onLayoutChange={loadDashboard} />
          </Box>
        </Box>

        {/* RIGHT: SETTINGS */}
        <Box flex="1" display="flex" justifyContent="center">
          <Box width="520px" borderWidth="1px" borderRadius="md" p={4}>
            <Theme
              dashboardId={dashboardId}
              dashboard={dashboard}
              ownerId={ownerId}
            />

            <Box mt={4}>
              <LayoutGallery onSelect={setSelectedLayoutId} />
            </Box>

            {dashboard.layout && (
              <WidgetLibrary
                layoutId={dashboard.layout.id}
                onWidgetAdded={loadDashboard}
              />
            )}

            {selectedLayout && (
              <Box mt={4}>
                <h4>LAYOUT PREVIEW</h4>
                <p>SELECTED LAYOUT #{selectedLayoutId}</p>
                <p>GRID SIZE: {selectedLayout.gridSize}</p>
                <button onClick={() => applyLayout(selectedLayout.id)}>
                  APPLY CURRENT LAYOUT
                </button>
              </Box>
            )}
          </Box>
        </Box>
      </Flex>

      {appliedDash?.layoutId && (
        <section>
          <h3>APPLIED LAYOUT</h3>
          <p>LAYOUT ID: {appliedDash.layoutId}</p>
        </section>
      )}

      <Link to="/Dashboard">Done</Link>
    </>
  );
}


export default DashEditor;
