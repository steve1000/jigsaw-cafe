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

  layer = new Konva.Layer()
  stagePieces = []

  debugGrid = () => {
    for (let i = 0; i < 30; i++) {
      const redLine = new Konva.Line({
        points: [0, i * 50, 1500, i * 50],
        stroke: 'red',
        strokeWidth: 1,
        lineCap: 'round',
        lineJoin: 'round'
      })

      const blueLine = new Konva.Line({
        points: [i * 50, 0, i * 50, 1500],
        stroke: 'blue',
        strokeWidth: 1,
        lineCap: 'round',
        lineJoin: 'round'
      })
      this.layer.add(redLine, blueLine)
    }
  }

  buildPieces = () => {
    const { image, canvas } = this.refs
    const { rowLength, columnLength } = this.state
    const { pieces, pieceWidth, pieceHeight } = generateBoard({ image, canvas, rowLength, columnLength })
    this.setState({ pieces, pieceWidth, pieceHeight })

    // TODO: remove this
    this.debugGrid()

    this.drawPieces(pieces)
  }

  drawPieces = (pieces) => {
    const stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight
    })

    pieces.forEach((row, i) => {
      this.stagePieces.push([])
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
          col: j,
          connectedTo: []
        })
        this.stagePieces[i].push(img)
        this.layer.add(img)
      })
    })

    stage.on('dragend', e => this.handleDragEndStage({ target: e.target, pieces }))
    stage.add(this.layer)
  }

  handleDragEndStage = ({ target, pieces }) => {
    // If we are only dropping a single node
    if (target.getType() === 'Shape') {
      const { attrs: { row, col, x, y } } = target

      const piece = pieces[row][col]
      piece.setCoordinates(x, y)

      this.maybeSnapToPartner({ target, piece })
      return
    }

    // if we are dropping an entire group
    if (target.getType() === 'Group') {
      // loop through each child
      const children = target.getChildren() || []
      // we need a normal for loop here as we need to use break;
      const childLen = children.length
      console.log('-'.repeat(40))
      for (let i = 0; i < childLen; i++) {
        // see if a particular child should snap to partner
        const piece = pieces[children[i].attrs.row][children[i].attrs.col]
        // console.log('child rect posX', `${children[i].getClientRect().x} -> ${children[i].x()}`)
        // console.log('child rect posY', `${children[i].getClientRect().y} -> ${children[i].y()}`)
        // console.log('child abs', children[i].absolutePosition())
        // console.log('child pos', children[i].position())
        // console.log('Group:', target.getClientRect().x, target.getClientRect().y)
        // console.log('-'.repeat(20))
        const hasMatch = this.maybeSnapToPartner({ target: children[i], piece })

        // TODO: Might need to change this otherwise when group-group connection happens
        // we update all the individual pieces so that their connectedTo updates correctly.
        if (hasMatch) {
          break;
        }
      }
      console.log('-'.repeat(40))
    }
  }

  /**
   * @param {node} to - the node that we're attaching to: Image
   * @param {node} from - the node that is joining the to: Image
   */
  joinPieces = (to, from) => {
    const toParentType = to.getParent().getType()
    const fromParentType = from.getParent().getType()

    // if to and from are both Image
    if (toParentType !== 'Group' && fromParentType !== 'Group') {
      // join the two Images into a new group (they have already been moved)
      const newGroup = new Konva.Group({
        draggable: true
      })
      newGroup.add(to)
      newGroup.add(from)
      // remove draggable from Images
      to.draggable(false)
      // update the connectedTo array to include the other piece so in future we don't
      // try and connect them again
      to.setAttrs({
        connectedTo: [...to.getAttr('connectedTo'), `${from.getAttr('row')},${from.getAttr('col')}`]
      })
      // repeat with from piece
      from.draggable(false)
      from.setAttrs({
        connectedTo: [...from.getAttr('connectedTo'), `${to.getAttr('row')},${to.getAttr('col')}`]
      })
      // add the group to the Layer
      this.layer.add(newGroup)
    }

    // Group to single piece
    if (toParentType === 'Group' && fromParentType !== 'Group') {
      console.log('add group to single piece', to, from)
      console.log('x()', to.getParent().x())
      console.log('getClientRect().x', to.getParent().getClientRect().x)

      const selectionRectBlue = new Konva.Rect({
        stroke: 'blue',
        visible: true,
        listening: false
      });
      this.layer.add(selectionRectBlue);

      selectionRectBlue.setAttrs(to.getParent().getClientRect());

      to.getParent().add(from)
      from.draggable(false)

      const selectionRect = new Konva.Rect({
        stroke: 'red',
        visible: true,
        listening: false
      });
      this.layer.add(selectionRect);

      selectionRect.setAttrs(to.getParent().getClientRect());

      this.layer.draw();
      console.log('To and from after adding', to, from)
    }
    // Single piece to group
    if (toParentType !== 'Group' && fromParentType === 'Group') {
      console.log('single piece into group', to, from)
      from.getParent().add(to)
      to.draggable(false)
    }
    // Group to Group love
    if (toParentType === 'Group' && fromParentType === 'Group') {
      console.log('group to group')
      const toGroup = to.getParent()
      const fromGroup = from.getParent()
      // I guess find the group with the fewer pieces in and add those into the bigger group
      const toGroupLength = toGroup.getChildren().length
      const fromGroupLength = fromGroup.getChildren().length

      if (toGroupLength >= fromGroupLength) {
        // merge into to group
        fromGroup.getChildren().forEach(fromImg => {
          toGroup.add(fromImg)
        })
        fromGroup.removeChildren()
      } else {
        // merge into from group
        toGroup.getChildren().forEach(toImg => {
          fromGroup.add(toImg)
        })
        toGroup.removeChildren()
      }
    }
  }

  movePieces(target, x, y) {
    // if the piece we are moving is not in a group
    // then we just move the piece
    if (target.getParent().getType() !== 'Group') {
      target.to({
        x,
        y,
        duration: 0.5,
        easing: Konva.Easings.ElasticEaseOut
      })
      return
    }

    // Otherwise we want to move the group by a difference
    const group = target.getParent()

    const offsetX = group.getClientRect().x - x
    const offsetY = group.getClientRect().y - y

    const groupX = group.x()
    const groupY = group.y()

    group.to({
      x: groupX - offsetX,
      y: groupY - offsetY
    })
  }

  /**
   * Check if the piece is close to one of its partner pieces
   * If it is, snap into place
   */
  maybeSnapToPartner = ({ target, piece }) => {
    const { rowLength, columnLength, pieces, pieceWidth, pieceHeight } = this.state
    const { attrs: { row, col } } = target

    // distance where pieces will snap into place
    const distance = pieceHeight * .1

    // find out who partners are
    const abovePartner = row == 0 ? null : { row: row - 1, col }
    if (abovePartner) {
      const abovePiece = this.stagePieces[abovePartner.row][abovePartner.col]
      const targetX = abovePiece.getClientRect().x
      const targetY = abovePiece.getClientRect().y + pieceHeight

      if (Math.abs(targetX - target.getClientRect().x) < distance
        && Math.abs(targetY - target.getClientRect().y) < distance) {

        // if pieces are already joined, don't move or join again

        // if already joined, do nothing
        if (target.getAttr('connectedTo').indexOf(`${this.stagePieces[abovePartner.row][abovePartner.col].getAttr('row')},${this.stagePieces[abovePartner.row][abovePartner.col].getAttr('col')}`) > -1) {
          return false
        }

        this.movePieces(target, targetX, targetY)
        // Need to use the stage pieces as they are of type Konva.Image rather than the object we
        // created on piece generation
        this.joinPieces(target, this.stagePieces[abovePartner.row][abovePartner.col])
        // moves++
        return true // TODO: take this out and return true at the end
      } else {
        console.log('no match')
        return false
      }
    }

    return false

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
        // moves++
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
            src={require('./images/beach.jpg')}
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
