import { useState } from 'react';

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

  switch (side) {
    case Side.Top:
      posX = handleThickness;
      posY = 0;
      width = parentWidth - 2 * handleThickness;
      height = handleThickness;
      break;
    case Side.Bottom:
      posX = handleThickness;
      posY = parentHeight - handleThickness;
      width = parentWidth - 2 * handleThickness;
      height = handleThickness;
      break;
    case Side.Left:
      posX = 0;
      posY = handleThickness;
      width = handleThickness;
      height = parentHeight - 2 * handleThickness;
      break;
    case Side.Right:
      posX = parentWidth - handleThickness;
      posY = handleThickness;
      width = handleThickness;
      height = parentHeight - 2 * handleThickness;
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
      bg="purple"
      position="absolute"
      top={`${posY}px`}
      left={`${posX}px`}
      width={`${width}px`}
      height={`${height}px`}
      padding="0px"
      onMouseDown={handleMouseDown}
    >
    </Container>
  );
}

function CornerHandle({corner, parentWidth, parentHeight, resize, snap}: {corner: Corner, parentWidth: number, parentHeight: number, resize: (side: Side, delta: number) => void, snap: (side: Side) => void}) {
  let posX, posY;
  const width = handleThickness, height = handleThickness;

  switch (corner) {
    case Corner.TopLeft:
      posX = 0;
      posY = 0;
      break;
    case Corner.TopRight:
      posX = parentWidth - handleThickness;
      posY = 0;
      break;
    case Corner.BottomLeft:
      posX = 0;
      posY = parentHeight - handleThickness;
      break;
    case Corner.BottomRight:
      posX = parentWidth - handleThickness;
      posY = parentHeight - handleThickness;
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
      bg="red"
      position="absolute"
      top={`${posY}px`}
      left={`${posX}px`}
      width={`${width}px`}
      height={`${height}px`}
      padding="0px"
      onMouseDown={handleMouseDown}
    >
    </Container>
  );
}

function WidgetFrame({x1, y1, x2, y2, minWidth, minHeight, snapSize, children}: {x1: number, y1: number, x2: number, y2: number, minWidth: number, minHeight: number, snapSize: number, children?: React.ReactNode}) {
  const [top, setTop] = useState(y1 * snapSize);
  const [bottom, setBottom] = useState(y2 * snapSize);
  const [left, setLeft] = useState(x1 * snapSize);
  const [right, setRight] = useState(x2 * snapSize);

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

  return (
    <Container padding="5" bg="blue" position="absolute" top={`${top}px`} left={`${left}px`} width={`${right-left}px`} height={`${bottom-top}px`} overflow="clip">
      {children}
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
    </Container>
  );
}

export default WidgetFrame;