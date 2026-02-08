// import { useState, useEffect } from 'react';
// import axios from 'axios';

import { Heading, Container, AbsoluteCenter, For, Button, Icon, Text, Flex, Spacer} from '@chakra-ui/react';
import { Link } from "react-router";
import { useContext } from 'react';

import { LuRocket } from "react-icons/lu"

import { UserContext } from './UserContext';

interface MyProps {
  pages: Array<string>,
  color?: string
}

function NavBar (props: MyProps) {
  const { user, handleLogout } = useContext(UserContext);

  const renderLoginInfo = () => {
    if (user.id === -1) { // not logged in
      return (
        <Button colorPalette="gray" variant="surface" height="25px" mt="12px" mr="8px" p="1" asChild><a href="/login/federated/google">Sign in</a></Button>
      );
    } else { // logged in
      return (
        <Flex align="center">
          <Text mt="12px" >{user.name}</Text>
          <Button colorPalette="gray" variant="surface" height="25px" mt="12px" ml="8px" p="1" onClick={() => {handleLogout()}} >Log Out</Button>
        </Flex>
      );
    }
  };

  return (
    <div style={{position: "sticky", top: "0", zIndex: "200"}}>
      <Container as="div" w="100%" h="45px" backgroundColor={props.color ?? "gray.emphasized"} margin="0" maxWidth="none" paddingLeft="16" paddingRight="16" >
        {/* TODO: Make this responsive for mobile and turn into a collapsible thing */}
        <AbsoluteCenter>
          <Icon size="lg" color="gray.focusRing" margin="1">
            <LuRocket />
          </Icon>
          <Heading>LaunchPad</Heading>
        </AbsoluteCenter>
        <Flex width="100%">
          <For each={props.pages}>
            {(page) => (
              <Button colorPalette="gray" variant="surface" height="25px" mt="12px" mr="8px" p="1" asChild><Link to={`/${page === "Home" ? '' : page}`}>{page}</Link></Button>
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