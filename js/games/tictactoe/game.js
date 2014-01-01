(function() {
	//Create app object to serve as namespace.
    var app = window.app || {};
    
    //Create gameObj object that will contain all game related logic and will be responsible for AI play and canvas drawing.
    var gameObj = {};
    
    //Set app object to global scope.
    window.app = app;
    
    //Set gameObj to global app object.
    app.gameObj = gameObj;
    
     //setup game object that will keep game state
    gameObj.initialize = function(canvas, message, playerChar, aiChar, aiState) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.height = canvas.height;
        this.width = canvas.width;
        this.gridWidth = gameObj.width / 50;
        this.gridStyle = '#666666';
        this.characterWidth = gameObj.width / 25;
        this.characterXStyle = '#ff0000';
        this.characterOStyle = '#0000ff';
        this.message = message;
        this.gameMessage = 'Click on grid to play';
        this.playerWon = 'You won';
        this.aiWon = 'Computer won';
        this.draw = 'Draw';
        this.gameState = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.playerChar = playerChar;
        this.aiChar = aiChar;
        this.aiNeedCalc = true;
        this.aiState = aiState;
        this.lastPlayerMove = null;
        this.gameInProgress = true;
    };
        
        //method for clearing game state
    gameObj.clearGameState = function() {
        var i = 0,
            j = 0;
            
        for(i = 0; i< 3; ++i) {
          	for(j = 0; j < 3; ++j) {
           		this.gameState[i][j] = '';
           	}
        }
    };
        
    //method that check if given player won
    gameObj.checkWin = function(char) {
       var i = 0;
            
        //check for win horizontally
        for(i = 0; i < 3; ++i) {
            if (this.gameState[i][0] === char && this.gameState[i][1] === char && this.gameState[i][2] === char) {
           	    return true;
           	}
        }
            
        //check for win vertically
        for(i = 0; i < 3; ++i) {
           	if (this.gameState[0][i] === char && this.gameState[1][i] === char && this.gameState[2][i] === char) {
                return true;
            }
        }
            
        //check for win diagonally
        if (this.gameState[0][0] === char && this.gameState[1][1] === char && this.gameState[2][2] === char) {
            return true;
        }
        if (this.gameState[2][0] === char && this.gameState[1][1] === char && this.gameState[0][2] === char) {
            return true;
        }
            
        return false;
    };
        
    //method that check if game is draw
    gameObj.checkDraw = function() {
        var i = 0,
            j = 0;
            
        for (i = 0; i < 3; ++i) {
            for (j = 0; j < 3; ++j) {
                if (this.gameState[i][j] === '') {
                    return false;
                }
            }
        }
            
        return true;
    };
        
    //method that check if playing field with given coordinates is legal
    gameObj.checkLegalMove = function(x,y) {
        if (this.gameState[y][x] === '') {
    	    return true;
        }
        	
        return false;
    };
        
    //method to update game state
    gameObj.changeGameState = function(char, x, y) {
        this.gameState[y][x] = char;
    };
        
    //method for calculating draw coordinates
    gameObj.calculateBeginEnd = function(x,y) {
       	var offsetX = (this.width / 3) * 0.1;
        var offsetY = (this.height / 3) * 0.1;

        var beginX = x * (this.width / 3) + offsetX;
        var beginY = y * (this.height / 3) + offsetY;

        var endX = (x + 1) * (this.width / 3) - offsetX;
        var endY = (y + 1) * (this.height / 3) - offsetY;
            
        return {
            beginX: beginX,
            beginY: beginY,
            endX: endX,
            endY: endY
        };
    };
       	
    //method that draw X character
    gameObj.drawX = function (x, y) {
       this.context.beginPath();

       this.context.strokeStyle = this.characterXStyle; 
       this.context.lineWidth   = this.characterWidth;

       var c = this.calculateBeginEnd(x, y);

       this.context.moveTo(c.beginX, c.beginY);
       this.context.lineTo(c.endX, c.endY); 

       this.context.moveTo(c.beginX, c.endY);
       this.context.lineTo(c.endX, c.beginY); 	

       this.context.stroke();
       this.context.closePath(); 
    };

    //method that draws O character
    gameObj.drawO = function(x, y) {
        this.context.beginPath();

        this.context.strokeStyle = this.characterOStyle; 
        this.context.lineWidth   = this.characterWidth;

        var c = this.calculateBeginEnd(x, y);

        this.context.arc(c.beginX + ((c.endX - c.beginX) / 2), c.beginY + ((c.endY - c.beginY) / 2), (c.endX - c.beginX) / 2 , 0, Math.PI * 2, true);

        this.context.stroke();
        this.context.closePath();
    };
        
    //method that draws played move
    gameObj.drawMove = function(char, x, y) {
        if (char === 'X') {
            this.drawX(x, y);
        } else {
            this.drawO(x, y);
        }
    };
        
    //method that return move with which ai can win or null if move is not available
    gameObj.aiWin = function() {
        var i = 0,
            j = 0,
            win = false;
            
        //check if ai can win on this move
        for (i = 0; i < 3; ++i) {
            for (j = 0; j < 3; ++j) {
                if (this.gameState[i][j] === '') {
                    this.gameState[i][j] = this.aiChar;
                    win = this.checkWin(this.aiChar);
                    this.gameState[i][j] = '';
                    if (win === true) {
                        return {
                            y: i,
                            x: j
                        };
                    }
                }
            }
        }
            
        return null;
    };
        
    //method that return move with which ai block user from wining or null if move is not available
    gameObj.aiBlockWin = function() {
        var i = 0,
            j = 0,
            win = false;
        	
        //check if player can win on this move
        for (i = 0; i < 3; ++i) {
            for (j = 0; j < 3; ++j) {
                if (this.gameState[i][j] === '') {
                    this.gameState[i][j] = this.playerChar;
                    win = this.checkWin(this.playerChar);
                    this.gameState[i][j] = '';
                    if (win === true) {
                        return {
                            y: i,
                            x: j
                        };
                    }
                }
            }
        }
            
        return null;
    };
        
    gameObj.aiPlayRandomCorner = function() {
        var rnd = Math.random();
        if (rnd > 0.75) {
            return {
                x: 0,
                y: 0
            };
        } else if (rnd > 0.5) {
            return {
                x: 2,
                y: 0
            };
        } else if (rnd > 0.25) {
            return {
                x: 0,
                y: 2
            };
        } else {
            return {
                x: 2,
                y: 2
            };
        }
    };
        
    //method that returns best calculated move
    //this method was written using tictactoe.png that can be found on https://github.com/mjamado/TicTacToeJS/blob/master/tictactoe.png
    gameObj.aiCalculateMove = function () {
        switch (this.aiState) {
            case 0:
                if (Math.random() > 0.3) {
               	this.aiState = 4;
                    return this.aiPlayRandomCorner();
                } else {
                    this.aiState = 2;
                    return {
                        x: 1,
                        y: 1
                    };
                }
                break;
            case 1:
                if (this.lastPlayerMove.x === 1 && this.lastPlayerMove.y === 1) {
                    this.aiState = 3;
                    return this.aiPlayRandomCorner();
                } else {
                    this.aiState = 5;
                    return {
                        x: 1,
                        y: 1
                    };
                }
                break;
            case 2:
                if ((this.lastPlayerMove.x === 0 && this.lastPlayerMove.y ===0) || 
                    (this.lastPlayerMove.x === 2 && this.lastPlayerMove.y ===0) ||
                    (this.lastPlayerMove.x === 0 && this.lastPlayerMove.y ===2) ||
                    (this.lastPlayerMove.x === 0 && this.lastPlayerMove.y ===0)) {
                        
                    this.aiState = 6;
                    if (this.lastPlayerMove.x === 0 && this.lastPlayerMove.y ===0) {
                        return {
                            x: 2,
                            y: 2
                        };
                    } else if (this.lastPlayerMove.x === 2 && this.lastPlayerMove.y ===0) {
                        return {
                            x: 0,
                            y: 2
                        };
                    } else if (this.lastPlayerMove.x === 0 && this.lastPlayerMove.y ===2) {
                        return {
                            x: 2,
                            y: 0
                        };
                    } else {
                        return {
                            x: 2,
                            y: 2
                        };
                    }
                } else {
                    this.aiNeedCalc = false;
                    if (this.lastPlayerMove.x === 1 && this.lastPlayerMove.y === 0) {
                        return {
                            x: 0,
                            y: 2
                        };
                    } else if (this.lastPlayerMove.x === 1 && this.lastPlayerMove.y === 2) {
                        return {
                            x: 0,
                            y: 0
                        };
                    } else if (this.lastPlayerMove.x === 0 && this.lastPlayerMove.y === 1) {
                        return {
                            x: 2,
                            y: 0
                        };
                    } else {
                        return {
                            x: 0,
                            y: 2
                        };
                    }
                }
                break;
            case 3:
                if ((this.gameState[0][0] === this.playerChar && this.gameState[2][2] === this.aiChar) ||
                    (this.gameState[2][0] === this.playerChar && this.gameState[0][2] === this.aiChar) ||
                    (this.gameState[0][2] === this.playerChar && this.gameState[2][0] === this.aiChar) ||
                    (this.gameState[2][2] === this.playerChar && this.gameState[0][0] === this.aiChar)) {
                        
                    this.aiNeedCalc = false;
                    if (this.gameState[0][0] === '') {
                        return {
                            x: 0,
                            y: 0
                        };
                    } else if (this.gameState[2][0] === '') {
                        return {
                            x: 0,
                            y: 2
                        };
                    } else if (this.gameState[0][2] === '') {
                        return {
                            x: 2,
                            y: 0
                        };
                    } else if (this.gameState[2][2] === '') {
                        return {
                            x: 2,
                            y:2
                        };
                    }
                }
                    
                this.aiNeedCalc = false;
                break;
            case 4:
                if (this.lastPlayerMove.x === 1 && this.lastPlayerMove.y === 1) {
                    this.aiNeedCalc = false;
                    if (this.gameState[0][0] === this.aiChar) {
                        return {
                            x: 2,
                            y: 2
                        };
                    } else if (this.gameState[0][2] === this.aiChar) {
                        return {
                            x: 0,
                            y: 2
                        };
                    } else if (this.gameState[2][0] === this.aiChar) {
                        return {
                            x: 2,
                            y: 0
                        };
                    } else if (this.gameState[2][2] === this.aiChar) {
                        return {
                            x: 0,
                            y: 0
                        };
                    }
                } else {
                    this.aiState = 6;
                    if (this.gameState[0][0] === this.aiChar) {
                        if (this.gameState[0][1] === '' && this.gameState[0][2] === '') {
                            return {
                                x: 2,
                                y: 0
                            };
                        } else if (this.gameState[1][0] === '' && this.gameState[2][0] === '') {
                            return {
                                x: 0,
                                y: 2
                            };
                        }
                    } else if (this.gameState[0][2] === this.aiChar) {
                        if (this.gameState[0][0] === '' && this.gameState[0][1] === '') {
                            return {
                                x: 0,
                                y: 0
                            };
                        } else if (this.gameState[1][2] === '' && this.gameState[2][2] === '') {
                            return {
                                x: 2,
                                y: 2
                            };
                        }
                    } else if (this.gameState[2][0] === this.aiChar) {
                        if (this.gameState[0][0] === '' && this.gameState[1][0] === '') {
                            return {
                                x: 0,
                                y: 0
                            };
                        } else if (this.gameState[2][1] === '' && this.gameState[2][2] === '') {
                            return {
                                x: 2,
                                y: 2
                            };
                        }
                    } else if (this.gameState[2][2] === this.aiChar) {
                       	if (this.gameState[2][0] === '' && this.gameState[2][1] === '') {
                            return {
                                x: 0,
                                y: 2
                            };
                        } else if (this.gameState[0][2] === '' && this.gameState[1][2] === '') {
                            return {
                                x: 2,
                                y: 0
                            };
                        }
                    }
                }
                break;
            case 5:
                this.aiState = 7;
                if ((this.lastPlayerMove.x === 0 && this.lastPlayerMove.y === 0) ||
                    (this.lastPlayerMove.x === 0 && this.lastPlayerMove.y === 2) ||
                    (this.lastPlayerMove.x === 2 && this.lastPlayerMove.y === 0) ||
                    (this.lastPlayerMove.x === 2 && this.lastPlayerMove.y ===2)) {
                        
                    if (this.gameState[0][1] === '') {
                        return {
                    	    x: 1,
                    	    y: 0
                        };
                    } else if (this.gameState[1][0] === '') {
                        return {
                    	    x: 0,
                    	    y: 1
                    	};
                    } else if (this.gameState[2][1] === '') {
                        return {
                            x: 1,
                            y: 2
                        };
                    } else if (this.gameState[1][2] === '') {
                        return {
                            x: 2,
                            y: 1
                        };
                    }
                }
                break;
            case 6:
                this.aiNeedCalc = false;
                    
                if (this.gameState[0][0] === '' && this.gameState[0][1] !== this.playerChar && this.gameState[0][2] !== this.playerChar &&
                   	this.gameState[1][0] !== this.playerChar && this.gameState[2][0] !== this.playerChar) {
                    return {
                        x: 0,
                        y: 0
                    };
                } else if (this.gameState[0][2] === '' && this.gameState[0][0] !== this.playerChar && this.gameState[0][1] !== this.playerChar &&
                           this.gameState[1][2] !== this.playerChar && this.gameState[2][2] !== this.playerChar) {
                    return {
                        x: 2,
                        y: 0
                    };
                } else if (this.gameState[2][0] === '' && this.gameState[0][0] !== this.playerChar && this.gameState[1][0] !== this.playerChar &&
                           this.gameState[2][1] !== this.playerChar && this.gameState[2][2] !== this.playerChar) {
                    return {
                        x: 0,
                        y: 2
                    };
                } else if (this.gameState[2][2] === '' && this.gameState[2][0] !== this.playerChar && this.gameState[2][1] !== this.playerChar &&
                           this.gameState[0][2] !== this.playerChar && this.gameState[1][2] !== this.playerChar) {
                    return {
                        x: 2,
                        y: 2
                    };
                }
                    
                break;
            case 7:
                this.aiNeedCalc = false;
                if (this.gameState[0][0] === '' && (this.gameState[0][1] === '' || this.gameState[1][0] === '')) {
                    return {
                        x: 0,
                        y: 0
                    };
                } else if (this.gameState[0][2] === '' && (this.gameState[0][1] === '' || this.gameState[1][2] === '')) {
                    return {
                        x: 2,
                        y: 0
                    };
                } else if (this.gameState[2][0] === '' && (this.gameState[1][0]  === '' || this.gameState[2][1] === '')) {
                    return {
                        x: 0,
                        y: 2
                    };
                } else if (this.gameState[2][2] === '' && (this.gameState[2][1] === '' || this.gameState[1][2] === '')) {
                    return {
                        x: 2,
                        y: 2
                    };
                }
                break;
        }
            
        return null;
    };
        
    //method that returns next available move or null if board if full
    gameObj.aiNextMove = function() {
        var i = 0,
            j = 0;
        	
        for (i = 0; i < 3; ++i) {
            for (j = 0; j < 3; ++j) {
                if (this.gameState[i][j] === '') {
                    return {
                        y: i,
                        x: j
                    };
                }
            }
        }
           
        return null;
    };
             
    //method that return object containing coordinates to which computer played
    gameObj.aiThink = function() {
        var move;
            
        move = this.aiWin();
        if (move !== null) {
            this.aiCalc = false;
            return move;
        }
            
        move = this.aiBlockWin();
        if (move !== null) {
            this.aiCalc = false;
            return move;
        }
            
        if (this.aiNeedCalc) {
            move = this.aiCalculateMove();
            if (move !== null) return move;
        }
        	
        this.aiNeedCalc = false;
            
        return this.aiNextMove();
    };
        
    //method that handles computers move and returns true if computer won and false otherwise
    gameObj.aiMove = function() {
        var move = this.aiThink();
        if (move !== null) {
            this.changeGameState(this.aiChar, move.x, move.y);
            this.drawMove(this.aiChar, move.x, move.y);
        }
        return this.checkWin(this.aiChar);
    };
        
    //method that handles computers move and returns true if computer won and false otherwise
    gameObj.playerMove = function(x, y) {
        this.changeGameState(this.playerChar, x, y);
        this.drawMove(this.playerChar, x, y);
        return this.checkWin(this.playerChar);
    };
        
    //method for drawing grid
    gameObj.drawGrid = function() {
        this.context.beginPath();
        this.context.strokeStyle = this.gridStyle; 
        this.context.lineWidth   = this.gridWidth;

        this.context.moveTo((this.width / 3), 0);
        this.context.lineTo((this.width / 3), this.height);

        this.context.moveTo((this.width / 3) * 2, 0);
        this.context.lineTo((this.width / 3) * 2, this.height);

        this.context.moveTo(0, (this.height / 3));
        this.context.lineTo(this.width, (this.height / 3));

        this.context.moveTo(0, (this.height / 3) * 2);
        this.context.lineTo(this.width, (this.height / 3) * 2);

        this.context.stroke();
        this.context.closePath();
    };
        
    //method to clear the canvas
    gameObj.clearCanvas = function() {
        this.context.clearRect(0, 0, this.width, this.height);
    };
        
    //method that print messages to user
    gameObj.printMessage = function(value) {
        this.message.innerHTML = value;
    };
        
    //method to retrieve click coordinates
    gameObj.getClickCoordinates = function(evt) {
        var rect = this.canvas.getBoundingClientRect();
        var xRel = evt.clientX - rect.left;
        var yRel = evt.clientY - rect.top;
        var yCalc = Math.floor(yRel / (this.height / 3));    
        var xCalc =  Math.floor(xRel / (this.width/ 3));
            
        return {
            x: xCalc,
            y: yCalc
        };
    };
        
    //method that handles the move that was played
    gameObj.handleMove = function(x, y) {
        if (!this.gameInProgress) {
            return;
        }
        
        if(!this.checkLegalMove(x, y)) {
            return;
        }
        	
       	if (this.playerMove(x, y)) {
            this.gameInProgress = false;
        	this.printMessage(this.playerWon);
        	return;
        }
        	
       	this.lastPlayerMove = {
            x: x,
            y: y
        };
        	
       	if (this.checkDraw()) {
       	    this.gameInProgress = false;
       	    this.printMessage(this.draw);
       	    return;
       	}
        	
       	if (this.aiMove()) {
       	    this.gameInProgress = false;
       	    this.printMessage(this.aiWon);
       	    return;
       	}
        	
       	if (this.checkDraw()) {
       	    this.gameInProgress = false;
       	    this.printMessage(this.draw);
       	    return;
       	}
    };
        
    //method that handles click on canvas
    gameObj.handleClick = function(evt) {
        var cor = this.getClickCoordinates(evt);
        this.handleMove(cor.x, cor.y);
    };
        
    //method that handles window resize
    gameObj.handleResize = function() {
        var i = 0,
            j = 0;
        	
        this.canvas.height = this.canvas.clientHeight;
        this.canvas.width = this.canvas.clientWidth;
        this.height = this.canvas.height;
        this.width = this.canvas.width;
        this.gridWidth = this.width / 50;
        this.characterWidth = this.width / 25;
        this.clearCanvas();
        this.drawGrid();
            
        for (i = 0; i < 3; ++i) {
       	    for (j = 0; j < 3; ++j) {
                if (this.gameState[i][j] !== '') {
        		    this.drawMove(this.gameState[i][j], j, i);
        		}
            }
        }
    };
}());