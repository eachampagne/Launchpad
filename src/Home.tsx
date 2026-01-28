// import axios from 'axios';

import { Heading, Text, Button, Link, Box } from '@chakra-ui/react'
import NavBar from './NavBar';
import { useState, useEffect } from 'react';

// ! TODO: FIX 'any', I just don't want to learn typescript function operations right now.
interface MyProps {
  getUserData: any,
  handleLogOut: any,
  userDataMessage: any
}

function Home (props: MyProps) {

  return (
    <>
      <NavBar pages={["temp", "temp2", "temp"]}/>
      <Heading> Welcome to the placeholder home page </Heading>
      <Text> There will be a lot more here! </Text>
      <Box background="yellow.950" borderColor="yellow.border" borderWidth="3px" p="3" width="-moz-fit-content">
        <Heading color="yellow.focusRing" >- Sign in -</Heading>
        <div>
          <Link className="button google" href="/login/federated/google" colorPalette="yellow" variant="underline" margin="1">Sign in with Google</Link>
        </div>
        <div>
          <Button className="logout button google" margin="1" onClick={() => {props.handleLogOut()}} colorPalette="yellow" variant="outline">Log Out</Button>
        </div>
        <div>
          <Button className="testGetUserData" margin="1" onClick={() => {props.getUserData()}} colorPalette="yellow" variant="outline">Get User Data</Button>
          <Text color="yellow.focusRing" >{props.userDataMessage.name}</Text>
        </div>
      </Box>
    </>
  );
}

export default Home;
