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

  snapDistance = 20
  // layer = []

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
    this.layer = layer

    boardData.forEach((row, i) => {
      this.stagePieces.push([])
      row.forEach((_piece, j) => {
        const cvs = document.createElement('canvas')
        const imageData = boardData[i][j].imageData
        cvs.width = imageData.width
        cvs.height = imageData.height
        const c = cvs.getContext('2d')
        c.putImageData(imageData, 0, 0)

        const group = new Konva.Group({
          draggable: true
        })

        const img = new Konva.Image({
          image: cvs,
          // x: boardData[i][j].x,
          // y: boardData[i][j].y,
          x: 0,
          y: 0,
          width: boardData[i][j].width,
          height: boardData[i][j].height,
          // draggable: true,
          draggable: false,
          row: i,
          col: j,
          joined: []
        })

        layer.add(group)
        group.add(img)
        // console.log('group after add image:', group)
        this.stagePieces[i].push(img)
        // this.stagePieces[i].push(group)
        // layer.add(group)
      })
    })

    stage.on('dragend', e => this.handleDragEndStage(e.target))
    stage.add(layer)
  }

  handleDragEndStage = (group) => {
    // iterate through each child node
    // if it meets a partner, snap (group)
    group.children.forEach(piece => {
      this.maybeSnapToPartner(piece)
    })
  }

  isJoined = (joined, partner) => {
    if (joined.length === 0) {
      return false
    }
    
    let returnValue = false
    joined.forEach((joinedPiece) => {
      if (joinedPiece.row === partner.row && joinedPiece.col === partner.col) {
        returnValue = true
      }
    })

    return returnValue
  }

  /**
   * Check if the piece is close to one of its partner pieces
   * If it is, snap into place
   */
  maybeSnapToPartner = (piece) => {
    const { rowLength, columnLength, pieceWidth, pieceHeight } = this.state
    const { attrs: { row, col } } = piece 

    // find out who partners are
    const abovePartner = row === 0 ? null : { row: row - 1, col }
    if (!!abovePartner && !this.isJoined(piece.attrs.joined, abovePartner)) {
      const abovePiece = this.stagePieces[abovePartner.row][abovePartner.col]

      const targetTrueX = abovePiece.parent.attrs.x + abovePiece.attrs.x
      const targetTrueY = abovePiece.parent.attrs.y + abovePiece.attrs.y + pieceHeight
      const pieceTrueX = piece.parent.attrs.x + piece.attrs.x
      const pieceTrueY = piece.parent.attrs.y + piece.attrs.y


      if ((Math.abs(targetTrueX - pieceTrueX) < this.snapDistance) &&
        (Math.abs(targetTrueY - pieceTrueY) < this.snapDistance)) {
          piece.attrs.joined.push(abovePartner)
          piece.parent.children.forEach((piece) => {
            piece.setAttrs({
              x: piece.attrs.x + abovePiece.attrs.x,
              y: piece.attrs.y + abovePiece.attrs.y + pieceHeight
            })
            // add each piece to the group of the above piece
            // abovePiece.parent.add(piece)
            piece.moveTo(abovePiece.parent)
            })
          // kill the piece's original group (don't need it anymore)
          // piece.parent.destroy()
          // console.log("App -> piece.parent", piece.parent)

          const selectionRect = new Konva.Rect({
            stroke: 'blue',
            // visible: true,
            listening: false
          })
          this.layer.add(selectionRect)
          selectionRect.setAttrs(piece.getParent().getClientRect())

          this.layer.draw()
      }
    } else {
      // console.log('doesn\'t have an unjoined above partner')
    }

    const belowPartner = row + 1 >= rowLength ? null : { row: row + 1, col }
    if (belowPartner) {
      const belowPiece = this.stagePieces[belowPartner.row][belowPartner.col]
      const targetX = belowPiece.attrs.x
      const targetY = belowPiece.attrs.y - pieceHeight
      if ((Math.abs(targetX - piece.attrs.x) < this.snapDistance) && (Math.abs(targetY - piece.attrs.y) < this.snapDistance)) {
        piece.to({
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
      if ((Math.abs(targetX - piece.attrs.x) < this.snapDistance) && (Math.abs(targetY - piece.attrs.y) < this.snapDistance)) {
        // piece.setCoordinates(targetX, targetY)
        piece.to({
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
      if ((Math.abs(targetX - piece.attrs.x) < this.snapDistance) && (Math.abs(targetY - piece.attrs.y) < this.snapDistance)) {
        piece.to({
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
