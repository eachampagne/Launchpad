// import { useState, useEffect } from 'react';
// import axios from 'axios';

import { AbsoluteCenter, Button, Collapsible, Container, Flex, For, Heading, HStack, Image, LinkBox, LinkOverlay, Spacer, Text, VStack } from '@chakra-ui/react';
import { useState, useContext } from 'react';
import { Link } from "react-router";

import { UserContext } from './UserContext';
import { LuChevronRight } from "react-icons/lu";
import { IoLogOutOutline } from "react-icons/io5";

import rocketLogoURL from './assets/Launchpad_Logo_2_DARK.png';
import changeTextColor from './utilities/color';

interface MyProps {
  pages: Array<string>,
  navColor?: string,
}

function NavBar (props: MyProps) {
  const { user, handleLogout } = useContext(UserContext);

  const textColor = props.navColor ? changeTextColor(props.navColor) : "black";
  const buttonColor = "gray";

  const dropdownBreakpoint = 600; // in pixels
  const dropdownQuery = window.matchMedia(`(width < ${dropdownBreakpoint}px)`);

  const [narrowView, setNarrowView] = useState(dropdownQuery.matches);

  dropdownQuery.addEventListener('change', () => {
    if (dropdownQuery.matches) {
      setNarrowView(true);
    } else {
      setNarrowView(false);
    }
  });

  const renderLoginInfo = () => {
    if (user.id === -1) { // not logged in
      return (
        <Button colorPalette={buttonColor} variant="ghost" height="25px" mt="12px" mr="8px" p="1" asChild><a  >Sign in</a></Button>
      );
    } else { // logged in
      return (
        <Flex align="center">
          <Text mt="12px" color={textColor}>{user.name}</Text>
          <Button colorPalette={buttonColor} variant="ghost" height="25px" mt="12px" ml="8px" p="1" onClick={() => {handleLogout()}} color={textColor} _hover={{color: "white"}}>{<IoLogOutOutline  />}</Button>
        </Flex>
      );
    }
  };

  // small screen return
  if (narrowView) {
    return (
      <div style={{position: "sticky", top: "0", zIndex: "200"}}>
        <Collapsible.Root w="100%" minH="45px" backgroundColor={props.navColor ?? "gray.emphasized"} margin="0" maxWidth="none" color={textColor}>
          <Flex align="center" h="45px" px="2">
            <LinkBox>
              <HStack>
                <Image height="1.5rem" mr="1" src={rocketLogoURL}/>
                <Heading color={textColor}>LaunchPad</Heading>
                <LinkOverlay href="/" />
              </HStack>
            </LinkBox>
            <Spacer />
            <Collapsible.Trigger>
              <Collapsible.Indicator
                transition="transform 0.2s"
                _open={{ transform: "rotate(90deg)" }}
              >
                <LuChevronRight />
              </Collapsible.Indicator>
            </Collapsible.Trigger>
          </Flex>
          <Collapsible.Content>
            <VStack>
              <For each={props.pages}>
                {(page) => (
                  <Link to={`/${page === "Home" ? '' : page.toLowerCase()}`} >{page}</Link>
                )}
              </For>
              {renderLoginInfo()}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    );
  }

  return (
    <div style={{position: "sticky", top: "0", zIndex: "200"}}>
      <Container as="div" w="100%" h="45px" backgroundColor={props.navColor ?? "gray.emphasized"} margin="0" maxWidth="none" paddingX={{base: "4", sm: "8", md: "16"}} color={textColor}>
        {/* TODO: Make this responsive for mobile and turn into a collapsible thing */}
        <AbsoluteCenter>
          <Image height="1.5rem" mr="1" src={rocketLogoURL}/>
          <Heading color={textColor}>LaunchPad</Heading>
          <LinkOverlay href="/" />
        </AbsoluteCenter>
        <Flex width="100%">
          <For each={props.pages}>
            {(page) => (
              <Button colorPalette={buttonColor} variant="ghost" height="25px" mt="12px" mr="8px" p="1" color={textColor} _hover={{color: "white"}} asChild><Link to={`/${page === "Home" ? '' : page.toLowerCase()}`} >{page}</Link></Button>
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