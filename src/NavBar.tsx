// import { useState, useEffect } from 'react';
// import axios from 'axios';

import { Heading, Container, AbsoluteCenter, For, Button, Icon, Text, Flex, Spacer} from '@chakra-ui/react';
import { Link } from "react-router";
import { useContext } from 'react';

import { LuRocket } from "react-icons/lu"

import { UserContext } from './UserContext';
import { IoLogOutOutline } from "react-icons/io5";


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
        <Button colorPalette="gray" variant="ghost" height="25px" mt="12px" mr="8px" p="1" asChild><a href="/login/federated/google" color={props.textColor}>Sign in</a></Button>
      );
    } else { // logged in
      return (
        <Flex align="center">
          <Text mt="12px" >{user.name}</Text>
          <Button colorPalette="white" variant="ghost" height="25px" mt="12px" ml="8px" p="1" onClick={() => {handleLogout()}} color={props.textColor} >{<IoLogOutOutline />}</Button>
        </Flex>
      );
    }
  };

  return (
    <div style={{position: "sticky", top: "0", zIndex: "200"}}>
      <Container as="div" w="100%" h="45px" backgroundColor={props.navColor ?? "gray.emphasized"} margin="0" maxWidth="none" paddingLeft="16" paddingRight="16" color={props.textColor}>
        {/* TODO: Make this responsive for mobile and turn into a collapsible thing */}
        <AbsoluteCenter>
          <Icon size="lg" color={props.textColor} margin="1">
            <LuRocket />
          </Icon>
          <Heading>LaunchPad</Heading>
        </AbsoluteCenter>
        <Flex width="100%">
          <For each={props.pages}>
            {(page) => (
              <Button colorPalette="gray" variant="ghost" height="25px" mt="12px" mr="8px" p="1" asChild><Link to={`/${page === "Home" ? '' : page}`} color={props.textColor} >{page}</Link></Button>
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