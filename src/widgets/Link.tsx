import { useState } from 'react';
import axios from 'axios';

import { Button, Container, Flex, Heading, HStack, Icon, Input, Link, LinkOverlay, Popover, Portal } from '@chakra-ui/react';
import { LuExternalLink, LuLink, LuPencil, LuUnlink } from 'react-icons/lu';

import type { WidgetSettings } from '../../types/LayoutTypes.ts';

// can't conflict with Chakra Link...
function LinkWidget ({widgetId, settings}: {widgetId: number, settings: WidgetSettings | null}) {
  const [linkUrl, setLinkUrl] = useState(settings?.link?.url ?? '');
  const [newLink, setNewLink] = useState('');
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);

  const refreshLink = async () => {
    try {
      const response = await axios.get(`/link/${widgetId}`);
      setLinkUrl(response.data);
    } catch (error) {
      console.error('Failed to refresh url:', error);
    }
  };

  const handleSubmitNewLink = async (newLink: string | null) => {
    try {
      await axios.patch(`/link/${widgetId}`, {
        url: newLink
      });
      if (newLink !== null) { // If I'm clearing the link, I'm probably about to replace it
        setLinkEditorOpen(false);
      }
      refreshLink();
    } catch (error) {
      console.error('Failed to set link', error);
    }
  };

  const renderEditButton = () => {
    return (
      <Popover.Root open={linkEditorOpen} onOpenChange={(e) => {
        setLinkEditorOpen(e.open);
        if (e.open) {
          setNewLink(linkUrl);
        } else {
          setNewLink('');
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
                  handleSubmitNewLink(null);
                  setNewLink('');
                }}>
                  <LuUnlink/>
                </Icon>
                <Input
                  value={newLink}
                  onChange={(event) => setNewLink(event.target.value)}
                  onKeyDown={(event) => {
                    // https://stackoverflow.com/questions/68979619/how-do-you-submit-on-enter-key-press-in-a-chakra-ui-input
                    if (event.key === 'Enter') {
                      handleSubmitNewLink(newLink);
                    }
                  }}
                />
                <Button onClick={() => handleSubmitNewLink(newLink)}>Save</Button>
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
          {linkUrl}
          <Icon size="sm" marginRight="0.5rem" >
            <LuExternalLink/>
          </Icon>
        </Link>
      );
    }
  };

  return (
    <Container p="0">
      <Flex align="center" marginBottom="0.5rem"> {/* Inner flex box means icon is vertically centered against text */}
          <Icon size="lg" marginRight="0.5rem">
            <LuLink/>
          </Icon>
          {renderLink()}
          {renderEditButton()}
        </Flex>
    </Container>
  );
}

export default LinkWidget;