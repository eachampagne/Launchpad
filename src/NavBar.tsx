// import { useState, useEffect } from 'react';
// import axios from 'axios';

import { Heading, Container, AbsoluteCenter, For, Button, Text, Flex, Spacer, Image, LinkOverlay} from '@chakra-ui/react';
import { Link } from "react-router";
import { useContext } from 'react';

import { UserContext } from './UserContext';

import rocketLogoURL from './assets/Launchpad_Logo_rocket.png';

interface MyProps {
  pages: Array<string>,
  navColor?: string,
  textColor?: string
}

function NavBar (props: MyProps) {
  const { user, handleLogout } = useContext(UserContext);

  const renderLoginInfo = () => {
    if (user.id === -1) { // not logged in
      return (
        <Button colorPalette="gray" variant="surface" height="25px" mt="12px" mr="8px" p="1" asChild><a href="/login/federated/google" color={props.textColor}>Sign in</a></Button>
      );
    } else { // logged in
      return (
        <Flex align="center">
          <Text mt="12px" >{user.name}</Text>
          <Button colorPalette="gray" variant="surface" height="25px" mt="12px" ml="8px" p="1" onClick={() => {handleLogout()}} color={props.textColor} >Log Out</Button>
        </Flex>
      );
    }
  };

  return (
    <div style={{position: "sticky", top: "0", zIndex: "200"}}>
      <Container as="div" w="100%" h="45px" backgroundColor={props.navColor ?? "gray.emphasized"} margin="0" maxWidth="none" paddingLeft="16" paddingRight="16" color={props.textColor}>
        {/* TODO: Make this responsive for mobile and turn into a collapsible thing */}
        <AbsoluteCenter>
          <Image height="1.5rem" mr="1" src={rocketLogoURL}/>
          <Heading>LaunchPad</Heading>
          <LinkOverlay href="/" />
        </AbsoluteCenter>
        <Flex width="100%">
          <For each={props.pages}>
            {(page) => (
              <Button colorPalette="gray" variant="surface" height="25px" mt="12px" mr="8px" p="1" asChild><Link to={`/${page === "Home" ? '' : page}`} color={props.textColor} >{page}</Link></Button>
            )}
          </For>
          <Spacer />
          {renderLoginInfo()}
        </Flex>
      </Container>
    </div>
  );

}

export default NavBar;