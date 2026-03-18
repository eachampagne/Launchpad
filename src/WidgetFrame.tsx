import { useState, useEffectEvent, useEffect, useContext } from 'react';

import { Container, For } from "@chakra-ui/react";
import { UserContext } from './UserContext';




import { FiX } from "react-icons/fi"

const handleThickness = 10;

enum Side {
  Top = 'TOP',
  Bottom = 'BOTTOM',
  Left = 'LEFT',
  Right = 'RIGHT'
}

enum Corner {
  TopLeft = 'TOP_LEFT',
  TopRight = 'TOP_RIGHT',
  BottomLeft = 'BOTTOM_LEFT',
  BottomRight = 'BOTTOM_RIGHT'
}

function SideHandle({side, parentWidth, parentHeight, resize, snap}: {side: Side, parentWidth: number, parentHeight: number, resize: (side: Side, delta: number) => void, snap: (side: Side) => void}) {

  let posX, posY;
  let width, height;
  let cursor;

  switch (side) {
    case Side.Top:
      posX = handleThickness;
      posY = 0;
      width = parentWidth - 2 * handleThickness;
      height = handleThickness;
      cursor = 'ns-resize';
      break;
    case Side.Bottom:
      posX = handleThickness;
      posY = parentHeight - handleThickness;
      width = parentWidth - 2 * handleThickness;
      height = handleThickness;
      cursor = 'ns-resize';
      break;
    case Side.Left:
      posX = 0;
      posY = handleThickness;
      width = handleThickness;
      height = parentHeight - 2 * handleThickness;
      cursor = 'ew-resize';
      break;
    case Side.Right:
      posX = parentWidth - handleThickness;
      posY = handleThickness;
      width = handleThickness;
      height = parentHeight - 2 * handleThickness;
      cursor = 'ew-resize';
      break;
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  const handleMove = (event: MouseEvent) => {
    const deltaX = event.movementX;
    const deltaY = event.movementY;

    switch (side) {
      case Side.Top:
      case Side.Bottom:
        resize(side, deltaY);
        break;
      case Side.Left:
      case Side.Right:
        resize(side, deltaX);
        break;
    }
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleMouseUp);

    snap(side);
  };

  return (
    <Container
      opacity="0"
      position="absolute"
      top={`${posY}px`}
      left={`${posX}px`}
      width={`${width}px`}
      height={`${height}px`}
      padding="0px"
      onMouseDown={handleMouseDown}
      cursor={cursor}
      userSelect="none"
    >
    </Container>
  );
}

function CornerHandle({corner, parentWidth, parentHeight, resize, snap}: {corner: Corner, parentWidth: number, parentHeight: number, resize: (side: Side, delta: number) => void, snap: (side: Side) => void}) {
  let posX, posY;
  let cursor;
  const width = handleThickness, height = handleThickness;

  switch (corner) {
    case Corner.TopLeft:
      posX = 0;
      posY = 0;
      cursor = 'nwse-resize';
      break;
    case Corner.TopRight:
      posX = parentWidth - handleThickness;
      posY = 0;
      cursor = 'nesw-resize';
      break;
    case Corner.BottomLeft:
      posX = 0;
      posY = parentHeight - handleThickness;
      cursor = 'nesw-resize';
      break;
    case Corner.BottomRight:
      posX = parentWidth - handleThickness;
      posY = parentHeight - handleThickness;
      cursor = 'nwse-resize';
      break;
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation(); // keep the 'drag image' thing from happening
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  const handleMove = (event: MouseEvent) => {
    const deltaX = event.movementX;
    const deltaY = event.movementY;

    switch (corner) {
      case Corner.TopLeft:
        resize(Side.Top, deltaY);
        resize(Side.Left, deltaX);
        break;
      case Corner.TopRight:
        resize(Side.Top, deltaY);
        resize(Side.Right, deltaX);
        break;
      case Corner.BottomLeft:
        resize(Side.Bottom, deltaY)
        resize(Side.Left, deltaX);
        break;
      case Corner.BottomRight:
        resize(Side.Bottom, deltaY)
        resize(Side.Right, deltaX);
        break;
    }
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleMouseUp);

    switch (corner) {
      case Corner.TopLeft:
        snap(Side.Top);
        snap(Side.Left);
        break;
      case Corner.TopRight:
        snap(Side.Top);
        snap(Side.Right);
        break;
      case Corner.BottomLeft:
        snap(Side.Bottom)
        snap(Side.Left);
        break;
      case Corner.BottomRight:
        snap(Side.Bottom)
        snap(Side.Right);
        break;
    }
  };

  return (
    <Container
      opacity="0"
      position="absolute"
      top={`${posY}px`}
      left={`${posX}px`}
      width={`${width}px`}
      height={`${height}px`}
      padding="0px"
      onMouseDown={handleMouseDown}
      cursor={cursor}
      userSelect="none"
    >
    </Container>
  );
}

function DragHandle({parentWidth, parentHeight, move, snap}: {parentWidth: number, parentHeight: number, move: (deltaX: number, deltaY: number) => void, snap: () => void}) {

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation(); // keep the 'drag image' thing from happening
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMove = (event: MouseEvent) => {
    const deltaX = event.movementX;
    const deltaY = event.movementY;

    move(deltaX, deltaY);
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleMouseUp);

    snap();
  };

  return (
    <Container
      opacity="0"
      position="absolute"
      top={`${handleThickness}px`}
      left={`${handleThickness}px`}
      width={`${parentWidth-2*handleThickness}px`}
      height={`${parentHeight-2*handleThickness}px`}
      padding="0px"
      onMouseDown={handleMouseDown}
      cursor="move"
      userSelect="none"
    >
    </Container>
  );
}

function WidgetFrame({widgetId, posX, posY, sizeX, sizeY, minWidth, minHeight, maxWidth, maxHeight, boundingWidth, boundingHeight, snapSize, editActive, handleResizeOrMove, children, color, onDelete}: {widgetId: number, posX: number, posY: number, sizeX: number, sizeY: number, minWidth: number, minHeight: number, maxWidth?: number, maxHeight?: number, boundingWidth: number, boundingHeight: number, snapSize: number, editActive: boolean, handleResizeOrMove?: (widgetId: number, posX: number, posY: number, width: number, height: number) => void, children?: React.ReactNode, color: string, onDelete?: (id: number) => void}) {
  const [edges, setEdges] = useState({
    top: posY * snapSize,
    bottom: (posY + sizeY) * snapSize,
    left: posX * snapSize,
    right: (posX + sizeX) * snapSize
  });

  // originally, top, bottom, left, and right were all separate state variables. This caused problems with constraining the widgets to the field, however, since
  // the new values of state variables might depend on the current value of other state variables.
  // The solution, suggested here, https://stackoverflow.com/questions/60444100/how-to-update-multiple-state-at-once-using-react-hook-react-js
  // is to consolidate all values into one state variable. The destructured values and functions to set a specific edge are provided below
  // to minimize the amount of existing code that needs to be refactored
  const { top, bottom, left, right } = edges;
  const setTop = (f: (old: number) => number) => {
    setEdges(e => {
      return {
        ...e,
        top: f(e.top)
      }
    });
  };
  const setBottom = (f: (old: number) => number) => {
    setEdges(e => {
      return {
        ...e,
        bottom: f(e.bottom)
      }
    });
  };
  const setLeft = (f: (old: number) => number) => {
    setEdges(e => {
      return {
        ...e,
        left: f(e.left)
      }
    });
  };
  const setRight = (f: (old: number) => number) => {
    setEdges(e => {
      return {
        ...e,
        right: f(e.right)
      }
    });
  };

  const { currentTheme } = useContext(UserContext);

  const [hasSnapped, setHasSnapped] = useState(false);

  // convert certain props from grid squares to pixels
  const minHeightPx = minHeight * snapSize;
  const minWidthPx = minWidth * snapSize;

  let maxHeightPx: number | undefined, maxWidthPx: number | undefined;

  // check that maxes exist and are >= mins
  // if a max is < the corresponding min, discard the max
  if (maxHeight && maxHeight > minHeight) {
    maxHeightPx = maxHeight * snapSize;
  }
  if (maxWidth && maxWidth > minWidth) {
    maxWidthPx = maxWidth * snapSize;
  }

  const boundingHeightPx = boundingHeight * snapSize;
  const boundingWidthPx = boundingWidth * snapSize;

  // constrain to >= minHeight and minWidth, <= maxHeight and maxWidth, within bounds
  const resize = (side: Side, delta: number) => {
    switch (side) {
      case Side.Top:
        setTop((t) => {
          let newTop: number;
          if (bottom - (t + delta) < minHeightPx) {
            // constrain to minHeight
            newTop = bottom - minHeightPx;
          } else if (maxHeightPx && bottom - (t + delta) > maxHeightPx) {
            // constrain to maxHeight, if exists
            newTop = bottom - maxHeightPx;
          } else {
            newTop = t + delta;
          }

          // constrain to boundaries
          if (newTop < 0) {
            newTop = 0;
          } else if (newTop > boundingHeightPx) { // should be impossible
            newTop = boundingHeightPx;
          }

          return newTop;
        });
        break;
      case Side.Bottom:
        setBottom((b) => {
          let newBottom: number;
          if ((b + delta) - top < minHeightPx) {
            // constrain to minHeight
            newBottom = top + minHeightPx;
          } else if (maxHeightPx && (b + delta) - top > maxHeightPx) {
            // constrain to maxHeight, if exists
            newBottom = top + maxHeightPx;
          } else {
            newBottom = b + delta;
          }

          // constrain to boundaries
          if (newBottom < 0) { // should be impossible
            newBottom = 0;
          } else if (newBottom > boundingHeightPx) {
            newBottom = boundingHeightPx;
          }

          return newBottom;
        });
        break;
      case Side.Left:
        setLeft((l) => {
          let newLeft: number;
          if (right - (l + delta) < minWidthPx) {
            // constrain to minWidth
            newLeft = right - minWidthPx;
          } else if (maxWidthPx && right - (l + delta) > maxWidthPx) {
            // constrain to maxWidth, if exists
            newLeft = right - maxWidthPx;
          } else {
            newLeft = l + delta;
          }

          // constrain to boundaries
          if (newLeft < 0) {
            newLeft = 0;
          } else if (newLeft > boundingWidthPx) { // should be impossible
            newLeft = boundingWidthPx;
          }

          return newLeft;
        });
        break;
      case Side.Right:
        setRight((r) => {
          let newRight: number;
          if ((r + delta) - left < minWidthPx) {
            // constrain to minWidth
            newRight = left + minWidthPx;
          } else if (maxWidthPx && (r + delta) - left > maxWidthPx) {
            // constrain to maxWidth, if exists
            newRight = left + maxWidthPx;
          } else {
            newRight = r + delta;
          }

          // constrain to boundaries
          if (newRight < 0) { // should be impossible
            newRight = 0;
          } else if (newRight > boundingWidthPx) {
            newRight = boundingWidthPx;
          }

          return newRight;
        });
        break;
    }
  };

  const snapSide = (side: Side) => {
    setHasSnapped(true); // make sure the effect event to pass the new size and location to the parent fires

    // You really need the state update functions here
    // I tried to just set all the state variables directly - it didn't work
    // It always snapped back to their original positions
    switch (side) {
      case Side.Top:
        setTop(t => {
          const height = bottom - t;
          let snappedHeight = Math.round(height / snapSize) * snapSize; // round to nearest increment of snapSize
          if (snappedHeight < minHeightPx) {
            snappedHeight = minHeightPx; // minHeightPx = minHeight * snapSize, so this is guaranteed to be a proper increment
          }
          return bottom - snappedHeight;
        });
        break;
      case Side.Bottom:
        setBottom(b => {
          const height = b - top;
          let snappedHeight = Math.round(height / snapSize) * snapSize; // round to nearest increment of snapSize
          if (snappedHeight < minHeightPx) {
            snappedHeight = minHeightPx; // minHeightPx = minHeight * snapSize, so this is guaranteed to be a proper increment
          }
          return top + snappedHeight;
        });
        break;
      case Side.Left:
        setLeft(l => {
          const width = right - l;
          let snappedWidth = Math.round(width / snapSize) * snapSize; // round to nearest increment of snapSize
          if (snappedWidth < minWidthPx) {
            snappedWidth = minHeightPx; // minWidthPx = minWidth * snapSize, so this is guaranteed to be a proper increment
          }
          return right - snappedWidth;
        });
        break;
      case Side.Right:
        setRight(r => {
          const width = r - left;
          let snappedWidth = Math.round(width / snapSize) * snapSize; // round to nearest increment of snapSize
          if (snappedWidth < minWidthPx) {
            snappedWidth = minHeightPx; // minWidthPx = minWidth * snapSize, so this is guaranteed to be a proper increment
          }
          return left + snappedWidth;
        });
        break;
    }
  };

  // constrain to within bounds
  const move = (deltaX: number, deltaY: number) => {
    // const originalX = deltaX;
    // const originalY = deltaY;

    setEdges(e => {
      // don't mix up with the destructured variables outside of this function
      const {top: t, bottom: b, left: l, right: r} = e;

      // constrain deltaX
      if (l + deltaX < 0) {
        deltaX = -l;
      } else if (r + deltaX > boundingWidthPx) {
        deltaX = boundingWidthPx - r;
      }

      // constrain deltaY
      if (t + deltaY < 0) {
        deltaY = -t;
      } else if (b + deltaY > boundingHeightPx) {
        deltaY = boundingHeightPx - b;
      }

      return {
        left: l + deltaX,
        right: r + deltaX,
        top: t + deltaY,
        bottom: b + deltaY
      }
    });
  }

  const snapPosition = () => {
    setHasSnapped(true); // make sure the effect event to pass the new size and location to the parent fires

    // round all position values to nearest increment of snapSize
    setLeft(l => Math.round(l / snapSize) * snapSize);
    setRight(r => Math.round(r / snapSize) * snapSize);
    setTop(t => Math.round(t / snapSize) * snapSize);
    setBottom(b => Math.round(b / snapSize) * snapSize);
  }

  const onSnap = useEffectEvent(() => {
    if (!hasSnapped) {
      return;
    } else {
      const newTopCoor = top / snapSize;
      const newBottomCoor = bottom / snapSize;
      const newLeftCoor = left / snapSize;
      const newRightCoor = right / snapSize;

      const newWidth = newRightCoor - newLeftCoor;
      const newHeight = newBottomCoor - newTopCoor;

      if (handleResizeOrMove) {
        handleResizeOrMove(widgetId, newLeftCoor, newTopCoor, newWidth, newHeight);
      }

      setHasSnapped(false); // this will trigger a second render but hopefully *only* one
    }
  });

  useEffect(() => {
    onSnap();
  }, [hasSnapped]);

  const renderHandles = () => {

    
    if (editActive) {
      const parentWidth = right - left;
      const parentHeight = bottom - top;

      return (
        <>
          <For
            each={Object.values(Side)}
          >
            {(item) => <SideHandle side={item} parentWidth={parentWidth} parentHeight={parentHeight} resize={resize} snap={snapSide}/>}
          </For>
          <For
            each={Object.values(Corner)}
          >
            {(item) => <CornerHandle corner={item} parentWidth={parentWidth} parentHeight={parentHeight} resize={resize} snap={snapSide}/>}
          </For>
          <DragHandle parentWidth={parentWidth} parentHeight={parentHeight} move={move} snap={snapPosition}/>
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <Container
      padding="5"
      bg="blue"
      borderRadius="lg"
      position="absolute"
      top={`${top}px`}
      left={`${left}px`}
      width={`${right - left}px`}
      height={`${bottom - top}px`}
      overflow="clip"
      userSelect={editActive ? "none" : "text"}
      bgColor={currentTheme?.font}
    >
      {editActive && onDelete && (
        <button
          style={{
            position: "absolute",
            top: 6,
            right: 10,
            zIndex: 10,
            background: "rgba(0,0,0,0.6)",
            color: "orange",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => onDelete(widgetId)}
        >
          <FiX size={13} />
        </button>
      )}
      {children}
      {renderHandles()}
    </Container>
  );
}

export default WidgetFrame;