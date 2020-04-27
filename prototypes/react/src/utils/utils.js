import Konva from 'konva'

export const generateBoard = ({ image, canvas }) => {
  const rows = 2;
  const columns = 2;

  // const canvas = document.getElementById('canvas');

  const ctx = canvas.getContext('2d');

  const pieces = [];

  let pieceWidth;
  let pieceHeight;
  // let image = document.getElementById('source');

  const lineTypes = {
    STRAIGHT: 'straight',
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
  }

  // function init() {
    canvas.width = image.width + 400;
    canvas.height = image.height + 300;

    pieceWidth = image.width / columns;
    pieceHeight = image.height / rows;

    const width = window.innerWidth;
    const height = window.innerHeight;

    console.time('Full render')
    buildPieces();

  //   var stage = new Konva.Stage({
  //     // container: 'container',
  //     width: width,
  //     height: height
  //   });


  //   var layer = new Konva.Layer();
  //   // 
  //   pieces.forEach((row, i) => {
  //     row.forEach((piece, j) => {
  //       const cvs = document.createElement('canvas');
  //       const imageData = pieces[i][j].imageData
  //       cvs.width = imageData.width;
  //       cvs.height = imageData.height;
  //       const c = cvs.getContext('2d');
  //       c.putImageData(imageData, 0, 0);
  //       const img = new Konva.Image({
  //         image: cvs,
  //         x: Math.floor(Math.random() * (width - pieceWidth * 2) + (pieceWidth / 2)),
  //         y: Math.floor(Math.random() * (height - pieceHeight * 2) + (pieceHeight / 2)),
  //         width: pieces[i][j].width,
  //         height: pieces[i][j].height,
  //         draggable: true,
  //         // shadowColor: "black",
  //         // shadowBlur: 2,
  //         // shadowOpacity: 0.6,
  //       });

  //       stage.on('dragstart', handleDragStart);
  //       stage.on('dragend', handleDragEnd);

  //       layer.add(img);
  //     });
  //   });


  //   // add the layer to the stage
  //   stage.add(layer);
  //   console.timeEnd('Full render')
  // // }

  // function handleDragStart(e) {
    // e.target.setAttrs({
      // shadowOffset: {
      //     x: 15,
      //     y: 15
      // },
      // shadowBlur: 10,
      // scaleX: 1.1,
      // scaleY: 1.1,
  //     zIndex: 9999,
  //   });
  // };
  // function handleDragEnd(e) {
    // e.target.to({
    //     duration: 0.5,
    //     easing: Konva.Easings.ElasticEaseOut,
    //     scaleX: 1,
    //     scaleY: 1,
    //     shadowOffsetX: 2,
    //     shadowOffsetY: 2,
    //     shadowBlur: 2
    // });
  // };


  /**
   * Horizonal side of piece
   * @param sx
   * @param sy
   * @param ex
   * @param ey
   * @param {string} type - up|down
   * @param context
   * @param {string} direction - left|right
   */
  function bezierH(sx, sy, ex, ey, type, context, direction) {
    const width = pieceWidth;
    const height = pieceHeight;

    const signX = (direction === 'right' ? 1 : -1);
    const signY = (type === 'up' ? 1 : -1);

    // left shoulder
    context.bezierCurveTo(
      sx,
      sy,
      sx + (width * .35 * signX),
      sy + (height * .15 * signY),
      sx + (width * .37 * signX),
      sy + (height * .05 * signY)
    );

    // left neck
    context.bezierCurveTo(
      sx + (width * .37 * signX),
      sy + (height * .05 * signY),
      sx + (width * .40 * signX),
      sy,
      sx + (width * .38 * signX),
      sy - (height * .05 * signY)
    );

    // left head
    context.bezierCurveTo(
      sx + (width * .38 * signX),
      sy - (height * .05 * signY),
      sx + (width * .2 * signX),
      sy - (height * .2 * signY),
      sx + (width * .5 * signX),
      sy - (height * .2 * signY)
    );

    // right head
    context.bezierCurveTo(
      sx + (width * .5 * signX),
      sy - (height * .2 * signY),
      sx + (width * .8 * signX),
      sy - (height * .2 * signY),
      sx + (width * .62 * signX),
      sy - (height * .05 * signY)
    );

    // right neck
    context.bezierCurveTo(
      sx + (width * .61 * signX),
      sy - (height * .05 * signY),
      sx + (width * .6 * signX),
      sy,
      sx + (width * .63 * signX),
      sy + (height * .05 * signY)
    );

    // right shoulder
    context.bezierCurveTo(
      sx + (width * .63 * signX),
      sy + (height * .05 * signY),
      sx + (width * .65 * signX),
      sy + (height * .15 * signY),
      ex,
      ey
    );
  }

  /**
   * Vertical side of piece
   * @param sx - start x
   * @param sy - start y
   * @param ex - end x
   * @param ey - end y
   * @param {string} type - left|right
   * @param context - Canvas context
   * @param {string} direction - up|down
   */
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
    this.imageData = null;
    this.setSide = (side, options) => {
      this.sides[side] = options;
    }
    this.setImageData = (imageData) => {
      this.imageData = imageData;
    }
  }

  function buildPiece(row, col) {
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

    if (col * image.width === 0) {
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

  function buildPieces() {
    console.time('Pieces Render time');
    ctx.save();
    // loop through rows and columns
    for (let row = 0; row < rows; row++) {
      // Need to create a row array to push the columns into
      pieces.push([])
      for (let col = 0; col < columns; col++) {
        ctx.beginPath();
        const piece = buildPiece(row, col, ctx);
        ctx.clearRect(0, 0, 1000, 1000);
        ctx.restore();
        ctx.save();
        pieces[row].push(piece);
      }
    }
    console.timeEnd('Pieces Render time');
  }

  return pieces
}
