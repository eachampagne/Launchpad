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

import type { Layout, Dashboard } from '../types/LayoutTypes';

const gridCols = 19;
const gridRows = 12;
//px per grid unit
const snapSize = 60;




function DashEditor() {
  const { activeDash: dashboardId, user: { id: ownerId } } = useContext(UserContext);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const { currentTheme } = useContext(UserContext);
  console.log(currentTheme, 'HELELLEOO CAN THIS THING WORK ')

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
          <input
          onChange={handleChange}
          value={newName}
          style={{
            color: "black",
            backgroundColor: "white",
            border: "1px solid #82de11",
            padding: "4px"
          }}
          />
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
        //minH="calc(100vh - 120px)"
        my={8}
        px={6}
        gap={8}
        align="flex-start"
      >
        {/* LEFT: GRID EDITOR */}
        <Box flex="2" display="flex" justifyContent="center">
          <Box
            width={`${gridCols * snapSize}px`}
            height={`${gridRows * snapSize}px`}
            border="1px solid"
            borderColor="gray.500"
            borderRadius="xl"
            bg={currentTheme?.bgColor || "white"} // this is the background of the grid
            color="gray.800"
            overflow="hidden"
          >
            {/* SCALE CONTAINER */}
            <LayoutCanvas
              layout={dashboard.layout}
              editable
              onLayoutChange={loadDashboard}
            />
          </Box>
        </Box>

        {/* RIGHT: SETTINGS */}
        <Box flex="1" maxW="500px">
          <Box width="520px" borderWidth="1px" borderRadius="md" p={4}>
            <Theme
              dashboardId={dashboardId}
              dashboard={dashboard}
              ownerId={ownerId}
            />

            <Box mt={4}>
              <LayoutGallery
                onSelect={setSelectedLayoutId}
                selectedLayoutId={selectedLayoutId}
              />
            </Box>

            {selectedLayout && (
              <Box mt={4}>
                {/* <h4>LAYOUT PREVIEW</h4>
                <p>SELECTED LAYOUT #{selectedLayoutId}</p>
                <p>GRID SIZE: {selectedLayout.gridSize}</p> */}
                <button onClick={() => applyLayout(selectedLayout.id)}>
                  APPLY SELECTED LAYOUT
                </button>
              </Box>
            )}
            {dashboard.layout && (
              <WidgetLibrary
                layoutId={dashboard.layout.id}
                onWidgetAdded={loadDashboard}
              />
            )}
          </Box>
        </Box>
      </Flex>

      <Flex justify="flex-end" mt={8} px={6}>
        <Link to="/Dashboard">
          <Box
            px={4}
            py={2}
            borderRadius="md"
            bg="orange.50"
            color="gray"
            fontWeight="bold"
            _hover={{ bg: "orange.300" }}
            >
            Done
          </Box>
        </Link>
      </Flex>
    </>
  );
}


export default DashEditor;
