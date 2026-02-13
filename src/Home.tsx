import axios from 'axios';

import { Heading, Text, Button, Link, Box, Container, Flex, Icon } from '@chakra-ui/react'
import NavBar from './NavBar';
import { UserContext } from './UserContext';
import ImageCarousel from './home/ImageCarousel';
import ChangelogScroll from './home/ChangelogScroll';
import { useState, useEffect, useContext } from 'react'

import { LuRocket } from "react-icons/lu"

function Home () {
  const { handleLogout } = useContext(UserContext);
  const [prs, setPrs] = useState([] as {number: number, merged: boolean, mergedAt: string, title: string}[]);

  const fetchChangelog = async () => {
    try {
      const response = await axios.get('/github/changelog');
      setPrs(response.data);
    } catch (error) {
      console.error('Failed to get changelog:', error);
    }
  }

  // fetch the repos for the changelog on page load
  useEffect(() => {
    fetchChangelog();
  }, []);

  return (
    <>
      {/* Navbar */}
      <NavBar pages={["Hub", "Dashboard"]}/>

      {/* Section 1, Call to Action */}
      <Container p="14" backgroundColor="gray.950">
        <Flex justifyContent="center" gap="16">
          <ImageCarousel />
          <Container width="-moz-fit-content" margin="2" textAlign="center" p="3">
            <Text fontSize="lg" mb="5"> Launchpad is the homepage you've always wanted! </Text>
            <Text fontSize="lg" mb="5"> Customize your dashboard's widgets and colors and watch your productivity take off. </Text>
          </Container>
          <Box background="gray.950" p="3" margin="2" width="-moz-fit-content" textAlign="center" w="250px">
            <Heading color="gray.focusRing" > Join Us! </Heading>
            <div>
              <Button className="button google" colorPalette="gray" variant="outline" margin="1" asChild><Link href="/login/federated/google">Sign in with Google</Link></Button>
            </div>
            {/* TODO: Move logout button to somewhere that makes more sense */}
            <div><Button className="logout button google" margin="1" onClick={() => {handleLogout()}} colorPalette="gray" variant="outline">Log Out</Button></div>
          </Box>
        </Flex>
      </Container>

      {/* Section 2,  Show Activity */}
      <Container p="14" backgroundColor="gray.800">
          <Flex justifyContent="space-between" gap="16">
            <Container width="-moz-fit-content" margin="2" textAlign="center" p="3">
              <Text fontSize="lg" mb="5" textAlign="left">
                Launchpad lets you build your digital home! Place and resize widgets, choose the colors that fit your mood - set up your dashboard the way you like! You can even have your dashboard change with the time of day.
              </Text>
              <Text fontSize="lg" mb="5" textAlign="left">
                View your calendar and email, and set pomodoro timers, all in one place. Launchpad give you the tools to take control of your life.
              </Text>
            </Container>
            {/* Concept: Pass in a changelog value that is taken in from somewhere else. Ideally something that is easy for us to update. */}
            <ChangelogScroll changelog={prs}/>
          </Flex>
      </Container>

      {/* Section 3,  Footer */}
      <Container p="14" backgroundColor="gray.contrast">
          <Flex justifyContent="space-between" gap="16">
            <Icon size="2xl" color="gray.focusRing" margin="1">
              <LuRocket />
            </Icon>
            <Flex justifyContent="center" gap="16">
              <Link href="https://github.com/Operation-Yuzu/Launchpad"> View the Source Code </Link>
            </Flex>
          </Flex>
      </Container>
    </>
  );
}

export default Home;
