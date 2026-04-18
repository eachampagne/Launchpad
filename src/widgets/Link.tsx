import { useState } from 'react';
import axios, { AxiosError } from 'axios';

import { Button, Container, Field, Flex, Heading, HStack, Icon, Input, Link, Popover, Portal, Spacer, VStack } from '@chakra-ui/react';
import { LuExternalLink, LuLink, LuPencil, LuUnlink } from 'react-icons/lu';

import type { WidgetSettings } from '../../types/LayoutTypes.ts';

// can't conflict with Chakra Link...
function LinkWidget ({widgetId, textColor, settings}: {widgetId: number, textColor: string, settings: WidgetSettings | null}) {
  const [linkUrl, setLinkUrl] = useState(settings?.link?.url ?? '');
  const [displayText, setDisplayText] = useState(settings?.link?.displayText ?? '');
  const [newLink, setNewLink] = useState('');
  const [newDisplay, setNewDisplay] = useState('');
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [linkError, setLinkError] = useState(false);

  const refreshLink = async () => {
    try {
      const response = await axios.get(`/link/${widgetId}`);
      const { url, displayText } = response.data;
      setLinkUrl(url);
      setDisplayText(displayText ?? '');
    } catch (error) {
      if ((error as AxiosError).status === 404) {
        setLinkUrl('');
        setDisplayText('');
      }
      console.error('Failed to refresh url:', error);
    }
  };

  const handleSubmitNewLink = async (newLink: string, newDisplay: string | null) => {
    if (newLink.trim() === '') {
      setLinkError(true);
      return; // don't send empty strings
    }

    try {
      await axios.patch(`/link/${widgetId}`, {
        url: newLink,
        displayText: newDisplay
      });
      setLinkEditorOpen(false); // the user is probably finished with the popover
      refreshLink();
    } catch (error) {
      console.error('Failed to set link', error);
    }
  };

  const handleBreakLink = async () => {
    try {
      await axios.delete(`/link/${widgetId}`);
      refreshLink();
    } catch (error) {
      console.error('Failed to delete link', error);
    }
  };

  const renderEditButton = () => {
    return (
      <Popover.Root open={linkEditorOpen} onOpenChange={(e) => {
        setLinkEditorOpen(e.open);
        setLinkError(false);
        if (e.open) {
          setNewLink(linkUrl);
          setDisplayText(displayText);
        } else {
          setNewLink('');
          setDisplayText('');
        }
      }}>
      <Popover.Trigger asChild>
        <Icon size="sm" marginRight="0.5rem" cursor="pointer" onClick={(event) => {
          event.stopPropagation();
          // setLinkEditorOpen(l => !l);
        }}>
          <LuPencil/>
        </Icon>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <HStack>
                <Icon size="md" marginRight="0.5rem" cursor="pointer" onClick={(event) => {
                  event.stopPropagation();
                  handleBreakLink();
                  setNewLink('');
                }}>
                  <LuUnlink/>
                </Icon>
                <VStack>
                  <Field.Root invalid={linkError}>
                    <Input
                      placeholder='Link'
                      value={newLink}
                      onChange={(event) => {
                        setLinkError(false); // clear error
                        setNewLink(event.target.value);
                      }}
                      onKeyDown={(event) => {
                        // https://stackoverflow.com/questions/68979619/how-do-you-submit-on-enter-key-press-in-a-chakra-ui-input
                        if (event.key === 'Enter') {
                          handleSubmitNewLink(newLink, newDisplay);
                        }
                      }}
                    />
                  </Field.Root>
                  <Input
                    placeholder='Display Text'
                    value={newDisplay}
                    onChange={(event) => setNewDisplay(event.target.value)}
                    onKeyDown={(event) => {
                      // https://stackoverflow.com/questions/68979619/how-do-you-submit-on-enter-key-press-in-a-chakra-ui-input
                      if (event.key === 'Enter') {
                        handleSubmitNewLink(newLink, newDisplay);
                      }
                    }}
                  />
                </VStack>
                <Button onClick={() => handleSubmitNewLink(newLink, newDisplay)}>Save</Button>
              </HStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
    );
  };

  const renderLink = () => {
    if (linkUrl === '') {
      return (
        <Heading>
          Link
        </Heading>
      );
    } else {
      return (
        <Link href={linkUrl.slice(0,4) === 'http' ? linkUrl : `https://${linkUrl}`}>
          {/* assuming that https is more common than http */}
          <Heading>
            {displayText || linkUrl}
          </Heading>
          <Icon size="sm" marginRight="0.5rem" >
            <LuExternalLink/>
          </Icon>
        </Link>
      );
    }
  };

  return (
    <Container p="0" color={textColor}>
      <Flex align="center" marginBottom="0.5rem"> {/* Inner flex box means icon is vertically centered against text */}
        <Icon size="lg" marginRight="0.5rem">
          <LuLink/>
        </Icon>
        {renderLink()}
        <Spacer />
        {renderEditButton()}
      </Flex>
    </Container>
  );
}

export default LinkWidget;