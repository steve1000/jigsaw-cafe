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
    // boardState: [
    //   [
    //     {
    //       x: 100,
    //       y: 500,
    //       partners: [
    //         {
    //           rowIndex: 0,
    //           columnIndex: 1,
    //           isJoined: false
    //         }
    //       ]
    //     },
    //     {
    //       x: 500,
    //       y: 100,
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

  handleDragEnd = ({ e, piece }) => {
    const { target: { attrs: { x, y } } } = e
    // Todo - change this so it doesn't mutate state (this approach is currently mutating react state)
    piece.setCoordinates(x, y)

    const isCloseToPartner = this.checkIsCloseToPartner(piece)

    // e.target.to({
    //   duration: 0.5,
    //   easing: Konva.Easings.ElasticEaseOut,
    //   scaleX: 1.1,
    //   scaleY: 1.1,
    //   shadowOffsetX: 5,
    //   shadowOffsetY: 5,
    //   zIndex: 0
    // })
  }

  checkIsCloseToPartner = (piece) => {
    console.log('in checkIsCloseToPartner. piece:', piece)
  }

  render() {
    const { boardState, pieces } = this.state
    // console.log("render -> pieces", pieces)
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
                  <Image
                    image={cvs}
                    x={pieces[i][j].x}
                    // x={Math.floor(Math.random() * 100)}
                    y={pieces[i][j].y}
                    // y={Math.floor(Math.random() * 100)}
                    width={pieces[i][j].width}
                    height={pieces[i][j].height}
                    draggable={true}
                    key={`${i},${j}`}
                    // onDragStart={this.onDragStart}
                    // shadowColor={"black"}
                    // shadowBlur={2}
                    // shadowOpacity={0.6}
                    // opacity={0.9}
                    onDragEnd={e => this.handleDragEnd({ e, piece: pieces[i][j] })}
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
