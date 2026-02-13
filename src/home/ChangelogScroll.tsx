import { ScrollArea, Container, For, Spinner, HStack, AbsoluteCenter, Text, Heading } from "@chakra-ui/react"

// ! This is currently the demo from the Chakra-UI page, and should be replaced. It is being used while laying out the site.
const ChangeLogScroll = ({changelog}: {changelog: {number: number, merged: boolean, mergedAt: string, title: string}[]}) => (
  <ScrollArea.Root height="15rem" maxW="lg">
    <Container textAlign="center" p="3" backgroundColor="gray.emphasized"> Changelog </Container>
    <ScrollArea.Viewport>
      <ScrollArea.Content spaceY="0" textStyle="sm">
        <For
          each={changelog}
          fallback={
            <AbsoluteCenter>
              <Spinner color="blue.500" animationDuration="0.8s" />
            </AbsoluteCenter>
          }
        >
          {(change, index) => <Container textAlign="center" p="3" backgroundColor={index % 2 === 0 ? "gray.950" : "gray.900"}>
            <HStack>
              <Container w="20%" p="0">
                {new Date(change.mergedAt).toLocaleDateString()}
              </Container>
              <Container>
                <Text textAlign="left">
                  {change.title}
                </Text>
              </Container>
            </HStack>
          </Container>}
        </For>
      </ScrollArea.Content>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar>
      <ScrollArea.Thumb />
    </ScrollArea.Scrollbar>
    <ScrollArea.Corner />
  </ScrollArea.Root>
)

export default ChangeLogScroll;