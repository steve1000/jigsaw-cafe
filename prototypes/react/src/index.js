import React from 'react';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Image, Rect } from 'react-konva';

import { PuzzleRow } from './components/puzzle-row'
import { generateBoard } from './utils/utils'

// todo - refactor this to use hooks for state instead of class component
class App extends React.Component {
  state = {
    pieces: [],
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
    const { image, canvas } = this.refs
    // todo - get these from state via user input?
    const rowLength = 2
    const columnLength = 2
    const pieces = generateBoard({ image, canvas, rowLength, columnLength })
    this.setState({ pieces })
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

    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      zIndex: 0
    })
  }

  render() {
    const { boardState, pieces } = this.state
    console.log("render -> pieces", pieces)
    // console.log("App -> render -> this.state", this.state)

    // const rowLength = 3
    // const columnLength = 3

    return (
      <React.Fragment>
        <div style={{ display: 'none' }}>
          <canvas ref='canvas' />
          <img
            src={require('./images/beach.jpg')}
            onLoad={this.buildPieces}
            ref='image'
          />
        </div>

        <Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            {pieces.map((row, i) => (
              (row.map((piece, j) => {
                // console.log("render -> piece,", piece, 'i', i)
                const cvs = document.createElement('canvas');
                const imageData = pieces[i][j].imageData
                cvs.width = imageData.width;
                cvs.height = imageData.height;
                const c = cvs.getContext('2d');
                c.putImageData(imageData, 0, 0);

                return (
                  // <Rect
                  //   x={Math.random() * window.innerWidth}
                  //   y={Math.random() * window.innerHeight}
                  //   width={50}
                  //   height={50}
                  //   fill={'blue'}
                  //   draggable
                  //   key={`${i},${j}`}
                  // />

                  <Image
                    image={cvs}
                    // x={Math.floor(Math.random() * (width - pieceWidth * 2) + (pieceWidth / 2))}
                    x={Math.floor(Math.random() * 100)}
                    // y={Math.floor(Math.random() * (height - pieceHeight * 2) + (pieceHeight / 2))}
                    y={Math.floor(Math.random() * 100)}
                    width={pieces[i][j].width}
                    height={pieces[i][j].height}
                    draggable={true}
                    key={`${i},${j}`}
                    // onDragStart={this.onDragStart}
                    // shadowColor={"black"}
                    // shadowBlur={2}
                    // shadowOpacity={0.6}
                    // opacity={0.9}
                  />
                )
              }))
            ))}
          </Layer>
        </Stage>
      </React.Fragment>
    )
  }
}

render(<App />, document.getElementById('root'))
