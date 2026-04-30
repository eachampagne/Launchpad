import { useState, useEffectEvent, useEffect } from 'react';

import { Container, For } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";

import './LiquidGlass.css';

const handleThickness = 15;
const margin = 5;

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

function hexToGlassTint(hex: string): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r},${g},${b},1)`;
  } catch {
    return 'rgba(255,255,255,0)';
  }
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
      zIndex="10"
    />
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
    event.stopPropagation();
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
        resize(Side.Bottom, deltaY);
        resize(Side.Left, deltaX);
        break;
      case Corner.BottomRight:
        resize(Side.Bottom, deltaY);
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
        snap(Side.Bottom);
        snap(Side.Left);
        break;
      case Corner.BottomRight:
        snap(Side.Bottom);
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
      zIndex="10"
    />
  );
}

function DragHandle({parentWidth, parentHeight, move, snap}: {parentWidth: number, parentHeight: number, move: (deltaX: number, deltaY: number) => void, snap: () => void}) {

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMove = (event: MouseEvent) => {
    move(event.movementX, event.movementY);
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
      width={`${parentWidth - 2 * handleThickness}px`}
      height={`${parentHeight - 2 * handleThickness}px`}
      padding="0px"
      onMouseDown={handleMouseDown}
      cursor="move"
      userSelect="none"
      zIndex="10"
    />
  );
}

function WidgetFrame({widgetId, posX, posY, sizeX, sizeY, minWidth, minHeight, maxWidth, maxHeight, boundingWidth, boundingHeight, snapSize, editActive, handleResizeOrMove, children, color, onDelete}: {widgetId: number, posX: number, posY: number, sizeX: number, sizeY: number, minWidth: number, minHeight: number, maxWidth?: number, maxHeight?: number, boundingWidth: number, boundingHeight: number, snapSize: number, editActive: boolean, handleResizeOrMove?: (widgetId: number, posX: number, posY: number, width: number, height: number) => void, children?: React.ReactNode, color: string, onDelete?: (id: number) => void}) {

  const [edges, setEdges] = useState({
    top: posY * snapSize,
    bottom: (posY + sizeY) * snapSize,
    left: posX * snapSize,
    right: (posX + sizeX) * snapSize
  });

  const { top, bottom, left, right } = edges;

  const setTop    = (f: (old: number) => number) => setEdges(e => ({ ...e, top:    f(e.top)    }));
  const setBottom = (f: (old: number) => number) => setEdges(e => ({ ...e, bottom: f(e.bottom) }));
  const setLeft   = (f: (old: number) => number) => setEdges(e => ({ ...e, left:   f(e.left)   }));
  const setRight  = (f: (old: number) => number) => setEdges(e => ({ ...e, right:  f(e.right)  }));

  const tint = hexToGlassTint(color);

  const [hasSnapped, setHasSnapped] = useState(false);

  const minHeightPx      = minHeight * snapSize;
  const minWidthPx       = minWidth  * snapSize;
  const boundingHeightPx = boundingHeight * snapSize;
  const boundingWidthPx  = boundingWidth  * snapSize;

  let maxHeightPx: number | undefined, maxWidthPx: number | undefined;
  if (maxHeight && maxHeight > minHeight) maxHeightPx = maxHeight * snapSize;
  if (maxWidth  && maxWidth  > minWidth)  maxWidthPx  = maxWidth  * snapSize;

  const resize = (side: Side, delta: number) => {
    switch (side) {
      case Side.Top:
        setTop(t => {
          let newTop: number;
          if (bottom - (t + delta) < minHeightPx) {
            newTop = bottom - minHeightPx;
          } else if (maxHeightPx && bottom - (t + delta) > maxHeightPx) {
            newTop = bottom - maxHeightPx;
          } else {
            newTop = t + delta;
          }
          if (newTop < 0) newTop = 0;
          else if (newTop > boundingHeightPx) newTop = boundingHeightPx;
          return newTop;
        });
        break;
      case Side.Bottom:
        setBottom(b => {
          let newBottom: number;
          if ((b + delta) - top < minHeightPx) {
            newBottom = top + minHeightPx;
          } else if (maxHeightPx && (b + delta) - top > maxHeightPx) {
            newBottom = top + maxHeightPx;
          } else {
            newBottom = b + delta;
          }
          if (newBottom < 0) newBottom = 0;
          else if (newBottom > boundingHeightPx) newBottom = boundingHeightPx;
          return newBottom;
        });
        break;
      case Side.Left:
        setLeft(l => {
          let newLeft: number;
          if (right - (l + delta) < minWidthPx) {
            newLeft = right - minWidthPx;
          } else if (maxWidthPx && right - (l + delta) > maxWidthPx) {
            newLeft = right - maxWidthPx;
          } else {
            newLeft = l + delta;
          }
          if (newLeft < 0) newLeft = 0;
          else if (newLeft > boundingWidthPx) newLeft = boundingWidthPx;
          return newLeft;
        });
        break;
      case Side.Right:
        setRight(r => {
          let newRight: number;
          if ((r + delta) - left < minWidthPx) {
            newRight = left + minWidthPx;
          } else if (maxWidthPx && (r + delta) - left > maxWidthPx) {
            newRight = left + maxWidthPx;
          } else {
            newRight = r + delta;
          }
          if (newRight < 0) newRight = 0;
          else if (newRight > boundingWidthPx) newRight = boundingWidthPx;
          return newRight;
        });
        break;
    }
  };

  const snapSide = (side: Side) => {
    setHasSnapped(true);
    switch (side) {
      case Side.Top:
        setTop(t => {
          const height = bottom - t;
          let snappedHeight = Math.round(height / snapSize) * snapSize;
          if (snappedHeight < minHeightPx) snappedHeight = minHeightPx;
          return bottom - snappedHeight;
        });
        break;
      case Side.Bottom:
        setBottom(b => {
          const height = b - top;
          let snappedHeight = Math.round(height / snapSize) * snapSize;
          if (snappedHeight < minHeightPx) snappedHeight = minHeightPx;
          return top + snappedHeight;
        });
        break;
      case Side.Left:
        setLeft(l => {
          const width = right - l;
          let snappedWidth = Math.round(width / snapSize) * snapSize;
          if (snappedWidth < minWidthPx) snappedWidth = minHeightPx;
          return right - snappedWidth;
        });
        break;
      case Side.Right:
        setRight(r => {
          const width = r - left;
          let snappedWidth = Math.round(width / snapSize) * snapSize;
          if (snappedWidth < minWidthPx) snappedWidth = minHeightPx;
          return left + snappedWidth;
        });
        break;
    }
  };

  const move = (deltaX: number, deltaY: number) => {
    setEdges(e => {
      const { top: t, bottom: b, left: l, right: r } = e;
      let dx = deltaX, dy = deltaY;
      if (l + dx < 0) dx = -l;
      else if (r + dx > boundingWidthPx) dx = boundingWidthPx - r;
      if (t + dy < 0) dy = -t;
      else if (b + dy > boundingHeightPx) dy = boundingHeightPx - b;
      return { left: l + dx, right: r + dx, top: t + dy, bottom: b + dy };
    });
  };

  const snapPosition = () => {
    setHasSnapped(true);
    setLeft(l  => Math.round(l  / snapSize) * snapSize);
    setRight(r => Math.round(r  / snapSize) * snapSize);
    setTop(t   => Math.round(t  / snapSize) * snapSize);
    setBottom(b=> Math.round(b  / snapSize) * snapSize);
  };

  const onSnap = useEffectEvent(() => {
    if (!hasSnapped) return;
    const newTopCoor  = top    / snapSize;
    const newLeftCoor = left   / snapSize;
    const newWidth    = (right - left)  / snapSize;
    const newHeight   = (bottom - top)  / snapSize;
    if (handleResizeOrMove) {
      handleResizeOrMove(widgetId, newLeftCoor, newTopCoor, newWidth, newHeight);
    }
    setHasSnapped(false);
  });

  useEffect(() => { onSnap(); }, [hasSnapped]);

  const renderHandles = () => {
    if (!editActive) return null;
    const parentWidth  = right - left;
    const parentHeight = bottom - top;
    return (
      <>
        <For each={Object.values(Side)}>
          {(item) => <SideHandle side={item} parentWidth={parentWidth} parentHeight={parentHeight} resize={resize} snap={snapSide}/>}
        </For>
        <For each={Object.values(Corner)}>
          {(item) => <CornerHandle corner={item} parentWidth={parentWidth} parentHeight={parentHeight} resize={resize} snap={snapSide}/>}
        </For>
        <DragHandle parentWidth={parentWidth} parentHeight={parentHeight} move={move} snap={snapPosition}/>
      </>
    );
  };

  return (
    <div
      className={`liquid-glass-card${editActive ? " edit-active" : ""}`}
      style={{
        top: `${top + margin}px`,
        left: `${left + margin}px`,
        width: `${right - left - 2 * margin}px`,
        height: `${bottom - top - 2 * margin}px`,
        userSelect: editActive ? "none" : "text",
        ["--glass-tint" as string]: tint,
      }}
    >
      <div className="liquid-glass-visual" />

      <div className="liquid-glass-content">{children}</div>

      {editActive && onDelete && (
        <button
          className="glass-delete-btn"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(widgetId)}
        >
          <FiX size={13} />
        </button>
      )}

      {renderHandles()}
    </div>
  );
}

export default WidgetFrame;