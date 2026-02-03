import { useState, useEffectEvent, useEffect } from 'react';

import { Container, For } from "@chakra-ui/react";

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

function WidgetFrame({posX, posY, sizeX, sizeY, minWidth, minHeight, snapSize, resizeActive, handleResize, children}: {posX: number, posY: number, sizeX: number, sizeY: number, minWidth: number, minHeight: number, snapSize: number, resizeActive: boolean, handleResize?: (posX: number, posY: number, width: number, height: number) => void, children?: React.ReactNode}) {
  const [top, setTop] = useState(posY * snapSize);
  const [bottom, setBottom] = useState((posY + sizeY) * snapSize);
  const [left, setLeft] = useState(posX * snapSize);
  const [right, setRight] = useState((posX + sizeX) * snapSize);

  const [hasSnapped, setHasSnapped] = useState(false);

  const minHeightPx = minHeight * snapSize;
  const minWidthPx = minWidth * snapSize;

  // constrain to >= minHeight and minWidth
  const resize = (side: Side, delta: number) => {
    switch (side) {
      case Side.Top:
        setTop((t) => bottom - (t + delta) < minHeightPx ? bottom - minHeightPx : t + delta);
        break;
      case Side.Bottom:
        setBottom((b) => (b + delta) - top < minHeightPx ? top + minHeightPx : b + delta);
        break;
      case Side.Left:
        setLeft((l) => right - (l + delta) < minWidthPx ? right - minWidthPx : l + delta);
        break;
      case Side.Right:
        setRight((r) => (r + delta) - left < minWidthPx ? left + minWidthPx : r + delta);
        break;
    }
  };

  const snap = (side: Side) => {
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

      if (handleResize) {
        handleResize(newLeftCoor, newTopCoor, newWidth, newHeight);
      }

      setHasSnapped(false); // this will trigger a second render but hopefully *only* one
    }
  });

  useEffect(() => {
    onSnap();
  }, [hasSnapped]);

  const renderResizeHandles = () => {
    if (resizeActive) {
      return (
        <>
          <For
            each={Object.values(Side)}
          >
            {(item) => <SideHandle side={item} parentWidth={right-left} parentHeight={bottom-top} resize={resize} snap={snap}/>}
          </For>
          <For
            each={Object.values(Corner)}
          >
            {(item) => <CornerHandle corner={item} parentWidth={right-left} parentHeight={bottom-top} resize={resize} snap={snap}/>}
          </For>
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <Container padding="5" bg="blue" position="absolute" top={`${top}px`} left={`${left}px`} width={`${right-left}px`} height={`${bottom-top}px`} overflow="clip" userSelect={resizeActive ? "none" : "text"}>
      {children}
      {renderResizeHandles()}
    </Container>
  );
}

export default WidgetFrame;