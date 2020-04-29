import React from 'react';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Image } from 'react-konva';

import { generateBoard } from './utils/utils'

// todo - refactor this to use hooks for state instead of class component
class App extends React.Component {
  state = {
    pieces: [],
    rowLength: 3,
    columnLength: 3,
    pieceWidth: 0,
    pieceHeight: 0
  }

  buildPieces = () => {
    const { image, canvas } = this.refs
    const { rowLength, columnLength } = this.state
    const { pieces, pieceWidth, pieceHeight } = generateBoard({ image, canvas, rowLength, columnLength })
    this.setState({ pieces, pieceWidth, pieceHeight })

    this.drawPieces(pieces)
  }

  drawPieces = (pieces) => {
    const stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight
    })

    const layer = new Konva.Layer()

    pieces.forEach((row, i) => {
      row.forEach((_piece, j) => {
        const cvs = document.createElement('canvas')
        const imageData = pieces[i][j].imageData
        cvs.width = imageData.width
        cvs.height = imageData.height
        const c = cvs.getContext('2d')
        c.putImageData(imageData, 0, 0)

        const img = new Konva.Image({
          image: cvs,
          x: pieces[i][j].x,
          y: pieces[i][j].y,
          width: pieces[i][j].width,
          height: pieces[i][j].height,
          draggable: true,
          row: i,
          col: j
        })

        layer.add(img)
      })
    })

    stage.on('dragend', e => this.handleDragEndStage({ target: e.target, pieces }))
    stage.add(layer)
  }

  handleDragEndStage = ({ target, pieces }) => {
    const { attrs: { row, col, x, y } } = target

    const piece = pieces[row][col]
    piece.setCoordinates(x, y)

    this.maybeSnapToPartner({ target, piece })
  }

  /**
   * Check if the piece is close to one of its partner pieces
   * If it is, snap into place
   */
  maybeSnapToPartner = ({ target, piece }) => {
    const { rowLength, columnLength, pieces, pieceWidth, pieceHeight } = this.state
    const { attrs: { row, col } } = target

    // distance where pieces will snap into place
    const distance = pieceHeight / 10

    // find out who partners are
    const abovePartner = row == 0 ? null : { row: row - 1, col }
    if (abovePartner) {
      const abovePiece = pieces[abovePartner.row][abovePartner.col]
      const targetX = abovePiece.x
      const targetY = abovePiece.y + pieceHeight
      if ((Math.abs(targetX - piece.x) < distance) && (Math.abs(targetY - piece.y) < distance)) {
        piece.setCoordinates(targetX, targetY)
        target.to({
          x: targetX,
          y: targetY,
          duration: 0.5,
          easing: Konva.Easings.ElasticEaseOut
        })
      }
    }

    const belowPartner = row + 1 >= rowLength ? null : { row: row + 1, col }
    if (belowPartner) {
      const belowPiece = pieces[belowPartner.row][belowPartner.col]
      const targetX = belowPiece.x
      const targetY = belowPiece.y - pieceHeight
      if ((Math.abs(targetX - piece.x) < distance) && (Math.abs(targetY - piece.y) < distance)) {
        piece.setCoordinates(targetX, targetY)
        target.to({
          x: targetX,
          y: targetY,
          duration: 0.5,
          easing: Konva.Easings.ElasticEaseOut
        })
      }
    }

    const leftPartner = col == 0 ? null : { row, col: col - 1 }
    if (leftPartner) {
      const leftPiece = pieces[leftPartner.row][leftPartner.col]
      const targetX = leftPiece.x + pieceWidth
      const targetY = leftPiece.y
      if ((Math.abs(targetX - piece.x) < distance) && (Math.abs(targetY - piece.y) < distance)) {
        piece.setCoordinates(targetX, targetY)
        target.to({
          x: targetX,
          y: targetY,
          duration: 0.5,
          easing: Konva.Easings.ElasticEaseOut
        })
      }
    }

    const rightPartner = col + 1 >= columnLength ? null : { row, col: col + 1 }
    if (rightPartner) {
      const rightPiece = pieces[rightPartner.row][rightPartner.col]
      const targetX = rightPiece.x - pieceWidth
      const targetY = rightPiece.y
      if ((Math.abs(targetX - piece.x) < distance) && (Math.abs(targetY - piece.y) < distance)) {
        piece.setCoordinates(targetX, targetY)
        target.to({
          x: targetX,
          y: targetY,
          duration: 0.5,
          easing: Konva.Easings.ElasticEaseOut
        })
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        <div style={{ display: 'none' }}>
          <canvas ref='canvas' />
          <img
            src={require('./images/purple.jpeg')}
            onLoad={this.buildPieces}
            ref='image'
          />
        </div>
        <div id='container' />
      </React.Fragment>
    )
  }
}

render(<App />, document.getElementById('root'))
