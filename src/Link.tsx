import axios from 'axios';

import { Container, Flex, Heading, Icon } from '@chakra-ui/react';
import { LuLink, LuPencil, LuUnlink } from 'react-icons/lu';

import type { WidgetSettings } from '../types/LayoutTypes.ts';

function Link ({widgetId, settings}: {widgetId: number, settings: WidgetSettings | null}) {
  const handleSetLink = (newLink: string) => {
    try {
      axios.patch(`/link/url/${widgetId}`, {
        url: newLink
      });
    } catch (error) {
      console.error('Failed to set link', error);
    }
  };

  return (
    <Container>
      <Flex align="center" marginBottom="0.5rem"> {/* Inner flex box means icon is vertically centered against text */}
        <Icon size="lg" marginRight="0.5rem">
          <LuLink/>
        </Icon>
        <Heading>
          Link
        </Heading>
      </Flex>

    </Container>
  );
}

export default Link;