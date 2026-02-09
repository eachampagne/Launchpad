The Widget Frame component handles logic for positioning and sizing each widget so all the widget components don't have to.

It takes several props:
  * `widgetId` - an identifier for the widget (should correspond to a layoutElement entry in the database)
  * `posX` - the starting x coordinate (in grid squares) of the top left corner
  * `posY` - the starting y coordinate (in grid squares) of the top left corner
  * `sizeX` - the starting width of the widget (in grid squares)
  * `sizeY` - the starting height of the widget (in grid squares)
  * `minWidth` - the minimum width (in grid squares) the widget can be
  * `minHeight` - the minimum height (in grid squares) the widget can be
  * `snapSize` - the number of pixels per grid square
  * `resizeActive` - whether the widget can be resized. Text selection is disabled when the widget is resizable.
  * `handleResize` - an optional function to call when the widget completes a resize operation. This allows the widget frame's container to respond when the widget is resized.
  * `children` (wrapped in the `<WidgetFrame>` tags) - components to render inside the frame. These should be widgets, such as the Email, Calendar, or Timer components.

Note that `posX`, `posY`, `sizeX`, and `sizeY` are only the *starting* size and position. The WidgetFrame updates its actual size and position in state.

When the frame is in edit mode (i.e. `resizeActive` is `true`), it renders invisible corner and edge handles that change its size as they are dragged. Once the mouse is released, they trigger the frame to "snap" to the nearest allowed multiple of the gridSize. This snap further triggers the widget frame to call the `handleResize` function, if it exists, with the widget's id and the new coordinates of the its top left corner and its new width and height. The widget frame's container defines this `handleResize` function, and should use it to respond to a widget being resized, perhaps by validating that the widget is in an allowed configuration and/or sending the widget's new position and size to the server.

