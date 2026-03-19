The Widget Frame component handles logic for positioning and sizing each widget so all the widget components don't have to.

It takes several props:
  * `widgetId` - an identifier for the widget (should correspond to a layoutElement entry in the database)
  * `posX` - the starting x coordinate (in grid squares) of the top left corner
  * `posY` - the starting y coordinate (in grid squares) of the top left corner
  * `sizeX` - the starting width of the widget (in grid squares)
  * `sizeY` - the starting height of the widget (in grid squares)
  * `minWidth` - the minimum width (in grid squares) the widget can be
  * `minHeight` - the minimum height (in grid squares) the widget can be
  * `maxWidth` - the optional maximum width (in grid squares) the widget can be. If this is smaller than the minimum, it is ignored.
  * `maxHeight` - the optional maximum height (in grid squares) the widget can be. If this is smaller than the minimum, it is ignored.
  * `boundingWidth` - the width (in grid squares) of the LayoutCanvas that holds the widget
  * `boundingHeight` - the height (in grid squares) of the LayoutCanvas that holds the widget
  * `snapSize` - the number of pixels per grid square
  * `editActive` - whether the widget can be resized or moved. Text selection is disabled when the widget is editable.
  * `handleResizeOrMove` - an optional function to call when the widget completes a resize or move operation. This allows the widget frame's container to respond when the widget is changed.
  * `color` - currently unused. Presumably this was originally intended to control the color of the widget boxes. I believe this has been deprecated in favor of getting the widget color from the theme stored in the user context.
  * `onDelete` - an optional function to call when the delete button is clicked, which allows the widget frame's container to send a delete request to the server.
  * `children` (wrapped in the `<WidgetFrame>` tags) - components to render inside the frame. These should be widgets, such as the Email, Calendar, or Timer components.

Note that `posX`, `posY`, `sizeX`, and `sizeY` are only the *starting* size and position. The WidgetFrame updates its actual size and position in state.

When the frame is in edit mode (i.e. `editActive` is `true`), it renders invisible corner, edge, and middle handles, plus a visible delete button. Dragging the corner or edge handles resizes the widget frame, while dragging the middle moves it. Once the mouse is released, they trigger the frame to "snap" to the nearest allowed multiple of the gridSize. This snap further triggers the widget frame to call the `handleResizeOrMove` function, if it exists, with the widget frame's id and the new coordinates of the its top left corner and its new width and height. The widget frame's container defines this `handleResizeOrMove` function, and should use it to respond to a widget being resized, perhaps by validating that the widget is in an allowed configuration and/or sending the widget's new position and size to the server. Clicking the visible delete button triggers the `onDelete` function, also defined by the widget frame's container, which should send a delete request to the server.

