// import { useState, useEffect } from 'react';
// import axios from 'axios';

import { Heading, Container, AbsoluteCenter, For } from '@chakra-ui/react';
import { Link } from "react-router";

interface MyProps {
  pages: Array<string>,
}

function NavBar (props: MyProps) {

  return (
    <div style={{position: "sticky", "top": "0"}}>
      <Container as="div" w="100%" h="35px" backgroundColor="yellow.muted" margin="0" maxWidth="none">
        <For each={props.pages}>
          {(page) => (
            <Link style={{padding: "8px"}} to={`/${page}`}>{page}</Link>
          )}
        </For>
        <AbsoluteCenter>
          <Heading>LaunchPad</Heading>
        </AbsoluteCenter>
      </Container>
    </div>
  );
}

export default NavBar;