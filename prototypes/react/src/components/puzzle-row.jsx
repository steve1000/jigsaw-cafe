import React from 'react';

import { PuzzlePiece } from './puzzle-piece'

export const PuzzleRow = ({ row, rowIndex, handleDragStart, handleDragEnd }) => (
  <React.Fragment>
    {row.map((pieceState, i) => (
      <PuzzlePiece
        key={`${rowIndex},${i}`}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        rowIndex={rowIndex}
        columnIndex={i}
        pieceState={pieceState}
      />
    ))}
  </React.Fragment>
)
