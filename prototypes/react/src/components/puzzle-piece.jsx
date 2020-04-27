import React from 'react';
import { Rect } from 'react-konva';

// export const PuzzlePiece = ({ pieceState: { x, y, partners }, handleDragEnd, handleDragStart, rowIndex, columnIndex }) => {
export const PuzzlePiece = ({ pieceState, handleDragEnd, handleDragStart, rowIndex, columnIndex }) => {
  // console.log('pieceState', pieceState)
  const { x, y, partners } = pieceState

  return (
    <Rect
      // x={Math.random() * window.innerWidth}
      x={x}
      // y={Math.random() * window.innerHeight}
      y={y}
      width={50}
      height={50}
      fill={columnIndex === 0 ? 'blue' : 'red'}
      shadowColor="black"
      shadowBlur={10}
      shadowOpacity={0.6}
      onDragStart={handleDragStart}
      onDragEnd={e => handleDragEnd({ e, rowIndex, columnIndex })}
      draggable
      zIndex={0}
      isJoined={false}
    />
  )
}
