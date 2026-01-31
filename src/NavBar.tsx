// import { useState, useEffect } from 'react';
// import axios from 'axios';

import { Heading, Container, AbsoluteCenter, For, Button, Icon} from '@chakra-ui/react';
import { Link } from "react-router";

import { LuRocket } from "react-icons/lu"

interface MyProps {
  pages: Array<string>,
}

function NavBar (props: MyProps) {

  return (
    <div style={{position: "sticky", top: "0", zIndex: "200"}}>
      <Container as="div" w="100%" h="45px" backgroundColor="gray.emphasized" margin="0" maxWidth="none" paddingLeft="64" paddingRight="64">
        {/* TODO: Make this responsive for mobile and turn into a collapsible thing */}
        <For each={props.pages}>
          {(page) => (
            <Button colorPalette="gray" variant="surface" height="25px" mt="12px" mr="8px" p="1"><Link to={`/${page === "Home" ? '' : page}`}>{page}</Link></Button>
          )}
        </For>
        <AbsoluteCenter>
          <Icon size="lg" color="gray.focusRing" margin="1">
            <LuRocket />
          </Icon>
          <Heading>LaunchPad</Heading>
        </AbsoluteCenter>
      </Container>
    </div>
  );

}

export default NavBar;