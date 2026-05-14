import { Carousel, IconButton, Box } from "@chakra-ui/react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

import widgets from "../assets/widgetss.png";
import themes from "../assets/newthemeagain.png";
import layout from "../assets/layout2.png";
import dashboard from "../assets/dash.png";
import accounts from "../assets/accounts.png";



const items = [widgets, themes, layout, dashboard, accounts]

// ! This is currently the demo from the Chakra-UI page, and should be replaced. It is being used while laying out the site.
const ImageCarousel = () => {
  return (
    <Carousel.Root slideCount={items.length} maxW="250px" autoplay={{ delay: 2000 }} margin="2">
      <Carousel.ItemGroup>
        {items.map((_, index) => (
          <Carousel.Item key={index} index={index}>
            <Box rounded="lg" fontSize="2.5rem" width="250px" height="250px" backgroundColor="gray.muted" textAlign="center">
              <img src={_} alt='' />
            </Box>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      <Carousel.Control justifyContent="center" gap="4">
        <Carousel.PrevTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronLeft />
          </IconButton>
        </Carousel.PrevTrigger>

        <Carousel.Indicators />

        <Carousel.NextTrigger asChild>
          <IconButton size="xs" variant="ghost">
            <LuChevronRight />
          </IconButton>
        </Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  )
}

export default ImageCarousel;