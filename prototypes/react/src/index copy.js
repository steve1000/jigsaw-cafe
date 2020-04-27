import React from 'react';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer } from 'react-konva';

import { PuzzleRow } from './components/puzzle-row'

const lineTypes = {
  STRAIGHT: 'straight',
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
}

function bezierV(sx, sy, ex, ey, type, context, direction) {
  const width = pieceWidth;
  const height = pieceHeight;

  const signX = (type === 'left' ? 1 : -1);
  const signY = (direction === 'up' ? 1 : -1);

  // left shoulder
  context.bezierCurveTo(
    sx,
    sy,
    sx + (width * .15 * signX),
    sy - (height * .35 * signY),
    sx + (width * .05 * signX),
    sy - (height * .37 * signY),
  );

  // left neck
  context.bezierCurveTo(
    sx + (width * .05 * signX),
    sy - (height * .37 * signY),
    sx,
    sy - (height * .40 * signY),
    sx - (width * .05 * signX),
    sy - (height * .38 * signY),
  );

  // left head
  context.bezierCurveTo(
    sx - (width * .05 * signX),
    sy - (height * .38 * signY),
    sx - (width * .2 * signX),
    sy - (height * .2 * signY),
    sx - (width * .2 * signX),
    sy - (height * .5 * signY),
  );

  // right head
  context.bezierCurveTo(
    sx - (width * .2 * signX),
    sy - (height * .5 * signY),
    sx - (width * .2 * signX),
    sy - (height * .8 * signY),
    sx - (width * .05 * signX),
    sy - (height * .62 * signY),
  );

  // right neck
  context.bezierCurveTo(
    sx - (width * .05 * signX),
    sy - (height * .61 * signY),
    sx,
    sy - (height * .6 * signY),
    sx + (width * .05 * signX),
    sy - (height * .63 * signY),
  );

  // right shoulder
  context.bezierCurveTo(
    sx + (width * .05 * signX),
    sy - (height * .63 * signY),
    sx + (width * .15 * signX),
    sy - (height * .65 * signY),
    ex,
    ey
  );
}

function Piece(row, col) {
  this.row = row;
  this.col = col;
  this.sides = {};
  this.imageData;
  this.setSide = (side, options) => {
    this.sides[side] = options;
  }
  this.setImageData = (imageData) => {
    this.imageData = imageData;
  }
}

function buildPiece({ row, col, ctx, pieceHeight, pieceWidth, imageWidth, pieces }) {
  const piece = new Piece(row, col);
  let sx, sy, ex, ey;

  /**
   * 
   * Side 1 (left side)
   */

  const originX = col * pieceWidth;
  const originY = row * pieceHeight;

  sx = originX;
  sy = originY;
  ex = col * pieceWidth;
  ey = (row * pieceHeight) + pieceHeight;
  ctx.moveTo(sx, sy);

  if (col * imageWidth === 0) {
    // draw straight down
    ctx.lineTo(ex, ey);
    piece.setSide('left', { type: lineTypes.STRAIGHT, sx, sy, ex, ey });
  } else {
    // use bezier curve from pieces[row][col - 1].sides.right;
    const prevRight = pieces[row][col - 1].sides.right;
    bezierV(sx, sy, ex, ey, prevRight.type, ctx, 'down');
    piece.setSide('left', { type: prevRight.type, sx, sy, ex, ey });
  }


  /**
   * 
   * Side 2 (bottom)
   */

  sx = ex;
  sy = ey;
  ex = sx + pieceWidth;
  // check if at the bottom
  if (Math.round(ey) === Math.round(image.height)) {
    // console.log(`Piece at row ${row}, col ${col} is on the bottom row`)
    // straight line horizontal to the right
    ctx.lineTo(ex, ey);
    piece.setSide('bottom', { type: lineTypes.STRAIGHT, sx, sy, ex, ey });
  } else {
    // generate new bezier curve horizontal
    const type = Math.random() > 0.5 ? lineTypes.UP : lineTypes.DOWN;
    // start where we left from the previous line
    bezierH(sx, sy, ex, ey, type, ctx, 'right');
    piece.setSide('bottom', { type, sx, sy, ex, ey });
  }

  /**
   * 
   * Side 3 (right)
   */

  sx = ex;
  sy = ey;
  ey = sy - pieceHeight;
  // check if on the right hand edge
  if (Math.round(ex) === Math.round(image.width)) {
    // straight line up
    ctx.lineTo(ex, ey);
    piece.setSide('right', { type: lineTypes.STRAIGHT, sx, sy, ex, ey });
  } else {
    // do vertial bezier curve (not created yet)
    // generate new bezier curve horizontal
    const type = Math.random() > 0.5 ? lineTypes.LEFT : lineTypes.RIGHT;
    // start where we left from the previous line
    bezierV(sx, sy, ex, ey, type, ctx, 'up');
    piece.setSide('right', { type, sx, sy, ex, ey });
  }

  /**
   * 
   * Side 4 (top)
   */

  sx = ex;
  sy = ey;
  // return back to the start
  ex = originX;
  ey = originY;
  // check if on the top edge
  if (ey === 0) {
    // straight line to the left
    ctx.lineTo(ex, ey);
    piece.setSide('top', { type: lineTypes.STRAIGHT, sx, sy, ex, ey });
  } else {
    // grab the curve from the pieces[row - 1][col].sides.bottom
    const prevTop = pieces[row - 1][col].sides.bottom;
    bezierH(sx, sy, ex, ey, prevTop.type, ctx, 'left');
    piece.setSide('top', { type: prevTop.type, sx, sy, ex, ey });
  }

  // ctx.strokeStyle = '#ff0000'
  // ctx.stroke()
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(
    col * pieceWidth - (pieceWidth * .2),
    row * pieceHeight - (pieceHeight * .2),
    pieceWidth + (pieceWidth * .4),
    pieceHeight + (pieceHeight * .4)
  )
  // No idea why I needed to do this multiple times but it works...
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  piece.setImageData(data);

  return piece;
}

// todo - refactor this to use hooks for state instead of class component
class App extends React.Component {
  state = {
    rowLength: 5,
    columnLength: 5,
    // pieceWidth: 0,
    // pieceHeight: 0,
    // '0,0': {
    //   x: 10,
    //   y: 5
    // }
    // boardState: generateBoardState(rowLength, columnLength)
    boardState: [
      [
        {
          x: 100,
          y: 500,
          partners: [
            {
              rowIndex: 0,
              columnIndex: 1,
              isJoined: false
            }
          ]
        },
        {
          x: 500,
          y: 100,
          partners: [
            {
              rowIndex: 0,
              columnIndex: 0,
              isJoined: false
            }
          ]
        }
      ]
    ]
  }

  buildPieces = () => {
    console.log('loaded image')

    console.log('this.refs', this.refs)
    const { canvas, image } = this.refs
    const { rowLength, columnLength } = this.state
    const pieceWidth = image.width / columnLength;
    const pieceHeight = image.height / rowLength;

    // const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    // const image = this.refs.source
    console.time('pieces Render time');

    ctx.save();
    const pieces = []
    // loop through rows and columns
    for (let row = 0; row < rowLength; row++) {
      // Need to create a row array to push the columns into
      pieces.push([])
      for (let col = 0; col < columnLength; col++) {
        ctx.beginPath();
        const piece = buildPiece({ row, col, ctx, pieceHeight, pieceWidth, imageWidth: image.width, pieces });
        ctx.clearRect(0, 0, 1000, 1000);
        ctx.restore();
        ctx.save();
        pieces[row].push(piece);
      }
    }
    console.timeEnd('pieces Render time');
  }



  handleDragStart = e => {

    e.target.setAttrs({
      shadowOffset: {
        x: 15,
        y: 15
      },
      scaleX: 1.1,
      scaleY: 1.1,
      zIndex: 9999
    })
  }

  handleDragEnd = ({ columnIndex, rowIndex, e }) => {
    const parent = e.target.getParent()
    console.log("App -> handleDragEnd -> parent", parent)
    // e.target.getParent().each(function(node) {
    //   console.log('here', node)
    // })

    // console.log("App -> handleDragEnd -> rowIndex", rowIndex)
    // console.log("App -> handleDragEnd -> columnIndex", columnIndex)
    // todo - check if near partner, and snap into place
    // todo - on drag end, update state of position
    // console.log('in handle drag end. e:', e)
    const { target: { attrs: { x, y } } } = e
    console.log('x:', x, 'y:', y)
    const { boardState } = this.state
    console.log("App -> handleDragEnd -> boardState", boardState)
    // const currentPieceState = boardState[rowIndex][columnIndex]
    // make deep clone of state
    const boardStateClone = JSON.parse(JSON.stringify(boardState)) 
    const currentPieceState = boardStateClone[rowIndex][columnIndex]
    console.log("App -> handleDragEnd -> currentPieceState", currentPieceState)

    this.setState((prevState) => {
      const newState = {
        boardState: prevState.boardState
      }
      
      return boardState
    })

    // const replacementItem = {
    //   ...currentPieceState,
    //   x: 10,
    //   y: 10
    // }
    // console.log("App -> handleDragEnd -> replacementItem", replacementItem)
    // console.log("App -> handleDragEnd -> currentPieceState", currentPieceState)
    // currentPieceState.partners.map(partner => {
    //   const { columnIndex, rowIndex } = partner
    //   const partnerState = boardState[rowIndex][columnIndex]
    //   console.log("App -> handleDragEnd -> partnerState", partnerState)

    //   if ((partnerState.x - currentPieceState.x) < 100) {
    //     alert("close!")
    //   }
    // })
    // const replacementItem = {

    // }
    // const newState = Object.assign([], boardState, {[index]: replacementItem})

    // this.setState(({ boardState }) => ({ boardState: 
    //   boardState.map((row, i) => {
    //     row.map((pieceState, j) => {
    //       console.log("App -> handleDragEnd -> pieceState", pieceState)
    //       if (i === rowIndex && j === columnIndex) {
    //         return replacementItem
    //       } else {
    //         return pieceState 
    //       }
    //     })
    //   })
    // }))

    // this.setState( ({ boardState: prevBoardState }) => {
    // console.log("prevBoardState", prevBoardState)

    //   return {
    //     boardState: [...prevBoardState]
        // boardState: [
        //   [
        //     {
        //       x: 0,
        //       y: 0,
        //       partners: [
        //         {
        //           rowIndex: 0,
        //           columnIndex: 1,
        //           isJoined: false
        //         }
        //       ]
        //     },
        //     {
        //       x: 0,
        //       y: 0,
        //       partners: [
        //         {
        //           rowIndex: 0,
        //           columnIndex: 0,
        //           isJoined: false
        //         }
        //       ]
        //     }
        //   ]
        // ]
    //   }
    // })

    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      zIndex: 0
    })

    // if (x < 10) {
    //   e.target.to({
    //     x: 0,
    //     y: 0
    //   })
    // }
    // e.target.to({
    //   x: 0,
    //   y: 0
    // })
  }

  render() {
    const { boardState } = this.state
    // console.log("App -> render -> this.state", this.state)

    // const rowLength = 3
    // const columnLength = 3

    return (
      <React.Fragment>
        {/* <canvas ref={this.canvas} /> */}
        <canvas ref='canvas' />
        <img
          src={require('./images/beach.jpg')}
          onLoad={this.buildPieces}
          // ref={this.source}
          ref='image'
        />
        {/* <Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            {boardState.map((row, i) => (
              <PuzzleRow
                rowIndex={i}
                row={row}
                handleDragStart={this.handleDragStart}
                handleDragEnd={this.handleDragEnd}
                key={`rowIndex:${i}`}
              />
              // <PuzzlePiece
              //   key={i}
              // />
            ))}
          </Layer>
        </Stage> */}
      </React.Fragment>
    )
  }
}

render(<App />, document.getElementById('root'))
