import { ScrollArea, Container, Text, Heading } from "@chakra-ui/react"

// ! This is currently the demo from the Chakra-UI page, and should be replaced. It is being used while laying out the site.
const ChangeLogScroll = () => (
  <ScrollArea.Root height="15rem" maxW="lg">
    <Container textAlign="center" p="3" backgroundColor="gray.emphasized"> Changelog </Container>
    <ScrollArea.Viewport>
      <ScrollArea.Content spaceY="0" textStyle="sm">
        {/* Stuff goes here. */}
        <Container textAlign="center" p="3" backgroundColor="gray.950"> 00/00/0000 - Example Change </Container>
        <Container textAlign="center" p="3" backgroundColor="gray.900"> 00/00/0000 - Example Change </Container>
        <Container textAlign="center" p="3" backgroundColor="gray.950"> 00/00/0000 - Example Change </Container>
        <Container textAlign="center" p="3" backgroundColor="gray.900"> 00/00/0000 - Example Change </Container>
        <Container textAlign="center" p="3" backgroundColor="gray.950"> 00/00/0000 - Example Change </Container>
        <Container textAlign="center" p="3" backgroundColor="gray.900"> 00/00/0000 - Example Change </Container>
      </ScrollArea.Content>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar>
      <ScrollArea.Thumb />
    </ScrollArea.Scrollbar>
    <ScrollArea.Corner />
  </ScrollArea.Root>
)

export default ChangeLogScroll;