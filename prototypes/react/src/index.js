import React from 'react';
import Konva from 'konva';
import { render } from 'react-dom';
import { Stage, Layer, Image } from 'react-konva';

import { generateBoard } from './utils/utils'

// todo - refactor this to use hooks for state instead of class component
class App extends React.Component {
  state = {
    rowLength: 3,
    columnLength: 2,
    pieceWidth: 0,
    pieceHeight: 0
  }

  stagePieces = []

  buildPieces = () => {
    const { image, canvas } = this.refs
    const { rowLength, columnLength } = this.state
    const { boardData, pieceWidth, pieceHeight } = generateBoard({ image, canvas, rowLength, columnLength })
    this.setState({ pieceWidth, pieceHeight })

    this.drawPieces(boardData)
  }

  drawPieces = (boardData) => {
    const stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight
    })

    const layer = new Konva.Layer()

    boardData.forEach((row, i) => {
      this.stagePieces.push([])
      row.forEach((_piece, j) => {
        const cvs = document.createElement('canvas')
        const imageData = boardData[i][j].imageData
        cvs.width = imageData.width
        cvs.height = imageData.height
        const c = cvs.getContext('2d')
        c.putImageData(imageData, 0, 0)

        const img = new Konva.Image({
          image: cvs,
          x: boardData[i][j].x,
          y: boardData[i][j].y,
          width: boardData[i][j].width,
          height: boardData[i][j].height,
          draggable: true,
          row: i,
          col: j
        })
        this.stagePieces[i].push(img)

        layer.add(img)
      })
    })

    stage.on('dragend', e => this.handleDragEndStage(e.target))
    stage.add(layer)
  }

  handleDragEndStage = (target) => {
    this.maybeSnapToPartner(target)
  }

  /**
   * Check if the piece is close to one of its partner pieces
   * If it is, snap into place
   */
  maybeSnapToPartner = (target) => {
    const { rowLength, columnLength, pieceWidth, pieceHeight } = this.state
    const { attrs: { row, col } } = target

    // distance where pieces will snap into place
    const distance = pieceHeight / 10

    // find out who partners are
    const abovePartner = row === 0 ? null : { row: row - 1, col }
    if (abovePartner) {
      const abovePiece = this.stagePieces[abovePartner.row][abovePartner.col]
      const targetX = abovePiece.attrs.x
      const targetY = abovePiece.attrs.y + pieceHeight
      if ((Math.abs(targetX - target.attrs.x) < distance) && (Math.abs(targetY - target.attrs.y) < distance)) {
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
      const belowPiece = this.stagePieces[belowPartner.row][belowPartner.col]
      const targetX = belowPiece.attrs.x
      const targetY = belowPiece.attrs.y - pieceHeight
      if ((Math.abs(targetX - target.attrs.x) < distance) && (Math.abs(targetY - target.attrs.y) < distance)) {
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
      const leftPiece = this.stagePieces[leftPartner.row][leftPartner.col]
      const targetX = leftPiece.attrs.x + pieceWidth
      const targetY = leftPiece.attrs.y
      if ((Math.abs(targetX - target.attrs.x) < distance) && (Math.abs(targetY - target.attrs.y) < distance)) {
        // piece.setCoordinates(targetX, targetY)
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
      const rightPiece = this.stagePieces[rightPartner.row][rightPartner.col]
      const targetX = rightPiece.attrs.x - pieceWidth
      const targetY = rightPiece.attrs.y
      if ((Math.abs(targetX - target.attrs.x) < distance) && (Math.abs(targetY - target.attrs.y) < distance)) {
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
            src={require('./images/alien.jpg')}
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
