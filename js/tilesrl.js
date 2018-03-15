var tilesrl = {
	"tileSize": 5,
	"tileMapCols": 5,
	"tileMapRows": 5,
	"gameData": {},
	"rotLabels": ["rot0","rot90","rot180","rot270"],
	"tileWallMin": 9,
	"tileWallMax": 16,

	"PHASE_START_GAME": 1,
	"PHASE_TILE_PLACEMENT": 2,

	/** functions **/
	"createRandomTile": function(minWalls, maxWalls) {
		let wallCount = 0,
			sqArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			numWalls = Math.floor(Math.random()*(maxWalls - minWalls)) + minWalls;
		while (wallCount < numWalls) {
			let rIndex = Math.floor(Math.random()*24);
			if (sqArray[rIndex] == 0) {
				sqArray[rIndex] = 1;
				wallCount++;
			}
		}
		// filter: all internal "0" must (be a corner) || (have contiguity to a corner or other edge "0")
		// ... this will exclude diagonals and "ghost rooms"
		return sqArray;
	},
	"generateStartingTileStack": function() {
		let tileTargetCount = 40,
			tileCount = 0,
			tileStack = [];

		let defaultTiles = [
			// [0,0,0,0,0,1,1,0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0], // "7"
			// [0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,1,1,0,0,0,0,0,0], // "d"
			// [0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0], // "r"
			// [0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,1,0,0,0,0,0], // "L"
			// [1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1], // "7d"
			// [1,1,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1], // "rl"
			 // [1,1,0,1,1, 0,0,0,0,1, 1,0,0,0,0, 0,0,0,0,1, 1,1,0,1,1],
			 // [1,1,1,0,0, 1,0,0,0,0, 1,0,0,0,1, 0,0,0,0,1, 0,1,1,1,1],
			 // [1,0,1,0,1, 0,0,1,0,0, 1,0,1,1,1, 0,0,1,0,0, 1,0,1,0,1],
			 // [0,0,0,1,1, 0,0,0,1,1, 1,0,0,0,1, 0,0,1,1,1, 0,0,1,1,1],
			 // [1,1,1,1,1, 0,0,0,0,0, 1,1,0,1,1, 1,1,0,1,1, 1,1,0,1,1],
			 // [1,0,1,0,1, 1,0,1,0,1, 0,0,1,0,0, 1,1,0,0,0, 1,1,0,1,1]
			// [0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0]
			// [1,0,1,1,1,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,1,0,1,1,1] //tester
			//tilesrl.createRandomTile(tilesrl.tileWallMin, tilesrl.tileWallMax),

			// [1,1,1,1,0, 1,0,0,1,0, 0,0,0,0,0, 1,0,0,1,0, 1,1,1,1,0], // 3x2 room
			// [1,0,1,1,1, 0,0,1,0,0, 1,0,1,0,1, 0,0,1,0,0, 1,1,1,0,1], // zumlaut
			[1,1,0,0,0, 0,1,0,1,1, 0,0,0,1,1, 0,1,0,1,1, 1,1,0,0,0], // minecraft
			[0,1,1,1,0, 0,0,1,1,1, 1,0,0,0,0, 0,0,1,1,1, 0,1,1,1,0], // y-cheer
			// [1,1,0,1,1, 0,1,0,1,0, 0,0,0,0,0, 0,1,0,1,0, 1,1,0,1,1], // halfrooms with mid-corridor
			// [0,0,0,0,0, 0,0,1,0,1, 0,0,1,0,1, 0,0,1,0,1, 0,0,1,0,1], // hall and partroom

		];

		while (tileCount < tileTargetCount) {
			for (var i = 0; i < defaultTiles.length; i++) {
				tileStack.push(tilesrl.makeTile(defaultTiles[i]));
				tileCount++;
			}
		}
		return tileStack;
	},
	"makeTileMapFromArray" : function(a) { // using a tile's map array, make coord map
		var x = 0,
			y = 0,
			i = 0;
			map = [];
		for (let x = 0; x < tilesrl.tileSize; x++) {
			map.push([]);
			for (let y = 0; y < tilesrl.tileSize; y++) {
				map[x].push(a[i]);
				i++;
			}
		}
		return map;
	},
	"makeTile": function(sqArray){ // return a tile object with all rotations of given squaremap
		var t = {},
			squareMap = tilesrl.makeTileMapFromArray(sqArray);
		t.rot0 = squareMap;
		t.rot90 = tilesrl.rotateTile(t.rot0);
		t.rot180 = tilesrl.rotateTile(t.rot90);
		t.rot270 = tilesrl.rotateTile(t.rot180);
		return t;
	},
	"rotateTile": function(squareMap){ // rotate given squaremap 90 degrees
		let newMap = [];
		// prime new map
		for (let x = 0; x < tilesrl.tileSize; x++) {
			newMap.push([]);
			for (let y = 0; y < tilesrl.tileSize; y++) {
				newMap[x].push(0);
			}
		}

		// populate new map
		for (let x = 0; x < tilesrl.tileSize; x++) {
			for (let y = 0; y < tilesrl.tileSize; y++) {
				let val = squareMap[x][y],
					nx = 4-y,
					ny = x;
				newMap[nx][ny] = val;
			}
		}
		return newMap;
	},
	"commitTileToMap": function(tileMap, tileRot, x, y) {
		tileMap[x][y] = tileRot;
	},
	"generateEmptyTileMap": function() {
		let tileMap = [];
		for (let x = 0; x < tilesrl.tileMapCols; x++) {
			let xcol = []
			for (let y = 0; y < tilesrl.tileMapRows; y++) {
				xcol.push("");
			}
			tileMap.push(xcol);
		}
		return tileMap;
	},
	"getBasicFlatMap": function(tilemap) {
		// concatenate all the levelMap tiles' arrays
		let mapSquares = [];
		for (let tx = 0; tx < tilesrl.tileMapCols; tx++) {
			for (let x = 0; x < tilesrl.tileSize; x++) {
				let concatCol = [];
				for (let ty = 0; ty < tilesrl.tileMapRows; ty++) {
					if (tilemap[tx][ty]) {
						concatCol = concatCol.concat(tilemap[tx][ty][x]);
					} else {
						concatCol = concatCol.concat(new Array(tilesrl.tileSize));
					}
				}
				mapSquares.push(concatCol);
			}
		}
		return mapSquares;
	},
	"getScrubbedFlatMap": function(flatMap) {
		/* scrub the diagonals, unwanted dead-ends, and stuff from flatMap */

		flatMap = tilesrl.makeCopyOfMultidimensionalArray(flatMap);
		let maxSqX = tilesrl.tileMapCols * tilesrl.tileSize,
			maxSqY = tilesrl.tileMapRows * tilesrl.tileSize,
			diagonalsScrubbed = false;

		// get rid of all unwanted diagonals
		while(diagonalsScrubbed == false) {
			diagonalsScrubbed = true;
			for (let x = 0; x < maxSqX; x++) {
				for (let y = 0; y < maxSqY; y++) {
					let sqAdj = tilesrl.getAdjacentSquares(flatMap,x,y),
						sq = flatMap[x][y];
					if (sq == 0) {
						let dnw = (sqAdj[0] < 1 && (sqAdj[1] + sqAdj[7] == 2)),
							dne = (sqAdj[2] < 1 && (sqAdj[1] + sqAdj[3] == 2)),
							dse = (sqAdj[4] < 1 && (sqAdj[3] + sqAdj[5] == 2)),
							dsw = (sqAdj[6] < 1 && (sqAdj[5] + sqAdj[7] == 2));

						if ( dnw || dne || dse || dsw ) {
								if (dnw) {
									flatMap[x][y-1] = 0;
								}
								if (dne) {
									flatMap[x+1][y] = 0;
								}
								if (dse) {
									flatMap[x][y+1] = 0;
								}
								if (dsw) {
									flatMap[x-1][y] = 0;
								}
								diagonalsScrubbed = false;
						}
					}
				}
			}
		}

		// get rid of edge alcoves
		for (let x = 0; x < maxSqX; x++) {
			for (let y = 0; y < maxSqY; y++) {
				let sq = flatMap[x][y];
				if (sq != 0) {
					continue;
				}

				let sqAdj = tilesrl.getAdjacentSquares(flatMap,x,y),
					isEdge = (x == 0 || y == 0 || x == maxSqX || y == maxSqY),
					isToBeFilled = false;

				if ((x == 0 && sqAdj[1] == 1 && sqAdj[5] == 1)
					|| (y == 0 && sqAdj[7] == 1 && sqAdj[3] == 1)
					|| (x == maxSqX - 1 && sqAdj[1] == 1 && sqAdj[5] == 1)
					|| (y == maxSqY - 1 && sqAdj[7] == 1 && sqAdj[3] == 1)) {
					isToBeFilled = true;
				}

				flatMap[x][y] = (isToBeFilled) ? 1 : flatMap[x][y];
			}
		}

		return flatMap;
	},
	"getPostProcessedFlatMap": function(flatMap) {
		/* 
			Update values for coordinates to reflect context.
			1+ : walltypes
			 0 : room (by default)
			-1 : corridor
			-2 : alcove
		*/
		let processedFlatMap = [],
			maxSqX = tilesrl.tileMapCols * tilesrl.tileSize,
			maxSqY = tilesrl.tileMapRows * tilesrl.tileSize;

		// traverse squares
		for (let x = 0; x < maxSqX; x++) {
			processedFlatMap.push([]);
			for (let y = 0; y < maxSqY; y++) {
				let sq = flatMap[x][y],
					sqAdj = tilesrl.getAdjacentSquares(flatMap,x,y),
					bakeNumber = sq;

				// floor stuff
				let isCorridor = (sq == 0)
					&& ( Math.abs(sqAdj[0]) + Math.abs(sqAdj[1]) + Math.abs(sqAdj[7]) ) > 0
					&& ( Math.abs(sqAdj[1]) + Math.abs(sqAdj[2]) + Math.abs(sqAdj[3]) ) > 0
					&& ( Math.abs(sqAdj[3]) + Math.abs(sqAdj[4]) + Math.abs(sqAdj[5]) ) > 0
					&& ( Math.abs(sqAdj[5]) + Math.abs(sqAdj[6]) + Math.abs(sqAdj[7]) ) > 0;
				if (isCorridor) {
					bakeNumber = -1;
				}

				// wall stuff
				let isShallowWall = (sq == 1)
					&& (sqAdj[1] + sqAdj[3] + sqAdj[5] + sqAdj[7]) < 4;
				if (isShallowWall) {
					// corners
					if ((sqAdj[0] + sqAdj[1] + sqAdj[7]) < 1) {
						bakeNumber = 2;
					}
					if ((sqAdj[5] + sqAdj[6] + sqAdj[7]) < 1) {
						bakeNumber = (bakeNumber == 2) ? 9 : 5; // wcap or sw
					}
					if ((sqAdj[2] + sqAdj[1] + sqAdj[3]) < 1) {
						bakeNumber = (bakeNumber == 2) ? 6 : 3; // ncap or ne
					}
					if ((sqAdj[3] + sqAdj[4] + sqAdj[5]) < 1) {
						bakeNumber = (bakeNumber == 3) ? 7 : 4; // ecap or se
					}
					if ((sqAdj[5] + sqAdj[6] + sqAdj[7]) < 1) {
						bakeNumber = (bakeNumber == 4) ? 8 : bakeNumber; // scap or sw (already set)
					}

					// if it's still "just a wall", must be not-a-corner
					if (bakeNumber == 1) {
						if ((sqAdj[1] + sqAdj[5]) == 2) { // NS
							bakeNumber = 10;
						} else if ((sqAdj[3] + sqAdj[7]) == 2) { // EW
							bakeNumber = 11;
						} else if (sqAdj[1]) { // nwall
							bakeNumber = 12;
						} else if (sqAdj[5]) { // swall
							bakeNumber = 14;
						} else if (sqAdj[3]) { // ewall
							bakeNumber = 13;
						} else { // wwall
							bakeNumber = 15;
						}
					}
				}

				processedFlatMap[x].push(bakeNumber);
			}
		}

		return processedFlatMap;
	},
	"drawMap": function(flatMap) {
		let htmlOutput = "",
			maxSqX = tilesrl.tileMapCols * tilesrl.tileSize,
			maxSqY = tilesrl.tileMapRows * tilesrl.tileSize,
			squareClasses = {
				"-1": "corridor",
				"0": "floor",
				"1": "wall",
				"2": "wall nwcorn",
				"3": "wall necorn",
				"4": "wall secorn",
				"5": "wall swcorn",
				"6": "wall ncap",
				"7": "wall ecap",
				"8": "wall scap",
				"9": "wall wcap",
				"10": "wall walls_ns",
				"11": "wall walls_ew",
				"12": "wall wall_n",
				"13": "wall wall_e",
				"14": "wall wall_s",
				"15": "wall wall_w"
			};
		for (let y = 0; y < maxSqY; y++) {
			for (let x = 0; x < maxSqX; x++) {
				let sqClass = squareClasses[flatMap[x][y]];
				sqClass += " x" + x + " y" + y;
				htmlOutput += "<div class='testSquare " + sqClass + "' title='" + x +","+ y + "'> </div>";
			}
			htmlOutput += "<br>"
		}
		$("#map").empty().append(htmlOutput);
	},
	"startGame": function() {
		tilesrl.gameData = {
			"phase": tilesrl.PHASE_START_GAME, // starting
			"collectedTiles": tilesrl.generateStartingTileStack(),
			"levelTileStack": null,
			"currentLevel": 0,
			"levelData": {}
		};
		tilesrl.startNewLevel(1);
		//tilesrl.initTilePlacementPhase();
	},
	"startNewLevel": function(lvl) {
		// update gameData
		tilesrl.gameData.currentLevel = lvl;
		tilesrl.gameData.levelData[lvl] = {
			"tileMap": [],
			"flatMap": []
		};

		// build a stack of tiles, 
		// ... use all (if any) generated tiles from previous level, >> TODO
		// ... fill rest of deck with random choices from legacy stack. >> TODO
		let levelTileStack = [],
			numDifferentTiles = 3 * lvl;
		while(levelTileStack.length < numDifferentTiles) {
			levelTileStack.push(tilesrl.getRandomFromArray(tilesrl.gameData.collectedTiles));
		}
		// add an entrance to 0th position of stack >> TODO
		// add an exit tile to 20th position of stack >> TODO

		// commit this stack to the game data
		tilesrl.gameData.levelTileStack = levelTileStack;

		// TEMP
		tilesrl.autoGenerateMapFromTiles(function(flatMap){
			console.log(["DONE!",flatMap]);
			let dsfm = tilesrl.getScrubbedFlatMap(flatMap),
				bfm = tilesrl.getPostProcessedFlatMap(dsfm);
			tilesrl.drawMap(bfm);
			tilesrl.gameData.levelData[tilesrl.gameData.currentLevel].flatMap = bfm;
		});		
	},
	"goToGamePhase": function(phaseInt) {
		tilesrl.gameData.phase = phaseInt;
		switch(phaseInt) {
			case tilesrl.PHASE_START_GAME:
				tilesrl.startGame();
				break;
			case tilesrl.PHASE_TILE_PLACEMENT:
				tilesrl.initTilePlacementPhase();
				break;
			default:
				tilesrl.gameData.phase = 0;
				//noop;
		}
	},
	"initTilePlacementPhase": function() {
		tilesrl.gameData.phase = tilesrl.PHASE_TILE_PLACEMENT; // tile placement

		// TEMP, skip user placed tiles and generate it
		tilesrl.autoGenerateMapFromTiles(function(flatMap){
			console.log(["DONE!",flatMap]);
			let dsfm = tilesrl.getScrubbedFlatMap(flatMap),
				bfm = tilesrl.getPostProcessedFlatMap(dsfm);
			tilesrl.drawMap(bfm);
		});
	},
	"makeCellMapFromFlatMap" : function(flatMap){
		let cellMap = {};
		return cellMap;
	},
	"autoGenerateMapFromTiles": function(callbackFunction) {
		let tileMapTemp = tilesrl.generateEmptyTileMap(),
			fixerSqArray = [0,0,0,0,0, 0,1,1,1,0, 0,0,0,1,1, 0,1,1,1,0, 0,0,0,0,0],
			fixerRotTile = tilesrl.makeTile(fixerSqArray),
			xRand = Math.floor(Math.random() * 5),
			yRand = Math.floor(Math.random() * 5),
			eX = xRand * 5,
			eY = yRand * 5;
		tilesrl.commitTileToMap(tileMapTemp, fixerRotTile.rot0, xRand, yRand); // starter in random spot

		let autoPlaceTile = function(sr, attempts) {
			attempts = attempts || 1;
			let isDone = false;
			if (sr > 0) {
				let placementSuccess = false,
				testTile = (attempts < 3) ? tilesrl.getRandomFromArray(tilesrl.gameData.levelTileStack) : fixerRotTile,
				validTilePlacements = tilesrl.getAllValidTilePlacements([0, 0], testTile, tileMapTemp, eX, eY),
				chosenPlacement = tilesrl.getRandomFromArray(validTilePlacements);
				if (validTilePlacements.length == 0) {
					console.log(["broke at " + sr, testTile, attempts]);
					if (attempts < 5) {
						attempts++;
						autoPlaceTile(sr, attempts);
					} else {
						// TODO: fill rest of map with walls?
						console.log(tileMapTemp);
						console.log("FUDGE!");
						isDone = true;
					}
				} else {
					let chosenRot = testTile[tilesrl.rotLabels[chosenPlacement[2]]];
					tilesrl.commitTileToMap(tileMapTemp, chosenRot, chosenPlacement[0], chosenPlacement[1]);
					placementSuccess = validTilePlacements.length > 0;
					if (placementSuccess) {
						sr--;
					}

					tilesrl.drawMap(tilesrl.getBasicFlatMap(tileMapTemp));
					setTimeout(function(){
						autoPlaceTile(sr);
					},20);
				}
			} else {
				isDone = true;
			}
			if (isDone) {
				let fm = tilesrl.getBasicFlatMap(tileMapTemp);
				callbackFunction(fm);// return the fm
			}
		};
		// go through deck and place until we fill the map
		autoPlaceTile(24);
	},
	/*
		@entrance: [x,y]
		@newTile: [[rot0],[rot90],etc]
		@tileMap: 5*5 reference of map so far
	*/
	"getAllValidTilePlacements" : function(entrance, newTile, tileMap, eX, eY) {
		// get list of open tile spaces that are adjacent to tiles already placed
		let openTilesAdjacent = [],
			tmxMax = tilesrl.tileMapCols,
			tmyMax = tilesrl.tileMapRows,
			xCoordMax = tilesrl.tileMapCols - 1,
			yCoordMax = tilesrl.tileMapRows - 1;

		for (let x = 0; x < tmxMax; x++) {
			for (let y = 0; y < tmyMax; y++) {
				if (tileMap[x][y] == "") { // open if undefined
					let left = (x > 0 && tileMap[x - 1][y] != ""),
						right = (x < xCoordMax && tileMap[x + 1][y] != ""),
						top = (y > 0 && tileMap[x][y - 1] != ""),
						bottom = (y < yCoordMax && tileMap[x][y + 1] != "");
					if (left || right || top || bottom) {
						openTilesAdjacent.push([x, y]); // seems to be adjacent and open
					}
				}
			}
		}

		// iterate that list, adding specific tile rotations to an array when they are valid there ([tx,ty,rotIdx])
		let validPlacements = [];
		for (let t = 0; t < openTilesAdjacent.length; t++) {
			let tileMapCopy = tilesrl.makeCopyOfMultidimensionalArray(tileMap);
			let x = openTilesAdjacent[t][0],
				y = openTilesAdjacent[t][1];
			for (let r = 0; r < 4; r++) {
				let testRot = newTile[tilesrl.rotLabels[r]];
				tilesrl.commitTileToMap(tileMapCopy, testRot, x, y);
				let flatMap = tilesrl.getBasicFlatMap(tileMapCopy);
				let placedTilesCount = 0,
					pathableTilesCount = 0;
				for (let tmx = 0; tmx < tileMapCopy.length; tmx++) {
					for (let tmy = 0; tmy < tileMapCopy[tmx].length; tmy++) {
						if (tileMapCopy[tmx][tmy] != "") {
							placedTilesCount++;
							if (tilesrl.canPathToTile(flatMap, eX, eY, tmx, tmy)) {
								pathableTilesCount++
							}
						}
					}
				}
				if (placedTilesCount == pathableTilesCount) {
					validPlacements.push([x, y, r]);
				}
			}
		}
		return validPlacements;
	},
	"getShortestPath": function(startPoint, goalPoint, flatMap) {
		let sX = startPoint[0],
			sY = startPoint[1],
			gX = goalPoint[0],
			gY = goalPoint[1],
			queue = [{
				"x": sX,
				"y": sY,
				"path": [],
				"status": flatMap[sX][sY] // SHOULD be 0, floor
			}],
			grid = [];

			// init the 'grid' object to track visited, obstacle, empty
			let xlen = flatMap.length,
				ylen = flatMap[0].length;
			for (let x = 0; x < xlen; x++) {
				grid.push([]);
				for (let y = 0; y < ylen; y++) {
					grid[x].push((flatMap[x][y] <= 0) ? "empty" : "obstacle");
					if (x == gX && y == gY) {
						grid[x][y] = "goal";
					}
				}
			}

			let exploreInDirection = function(currentLocation, direction, grid) {
				let newPath = currentLocation.path.slice();
				newPath.push(direction);

				let x = currentLocation.x,
					y = currentLocation.y;

				let cInDir = tilesrl.getCoordInDirection(direction, x, y);
				x = cInDir[0];
				y = cInDir[1];
				let newLocation = {
					"x": x,
					"y": y,
					"path": newPath,
					"status": "unknown"
				};
				newLocation.status = locationStatus(newLocation, grid);

				if (newLocation.status === "valid") {
					grid[x][y] = "visited";
				}

				return newLocation;
			};

			let locationStatus = function(newLocation, grid) {
				let x = newLocation.x,
					y = newLocation.y;
				if (x < 0
					|| y < 0
					|| x >= grid.length
					|| y >= grid[0].length) {
					return "invalid";
				} else if (grid[x][y] === "goal") {
					return "goal";
				} else if (grid[x][y] != "empty") {
					return "blocked";
				} else {
					return "valid";
				}
			};

			while (queue.length > 0) {
				let currentLocation = queue.shift();
				var dirs = [1,3,5,7];
				for (let d = 0; d < dirs.length; d++) {
					let newLocation = exploreInDirection(currentLocation, dirs[d], grid);
					if (newLocation.status === "goal") {
						return newLocation.path;
					} else if (newLocation.status === "valid") {
						queue.push(newLocation);
					}
				}
			}
			return false;
	},
	"highlightPathFromTo": function(startPoint, goalPoint, flatMap) {
		$(".pathHighlight").removeClass("pathHighlight");
		let sp = tilesrl.getShortestPath(startPoint, goalPoint, flatMap),
			x = startPoint[0],
			y = startPoint[1];
		if (sp) {
			while (sp.length > 0) {
				let d = sp.shift();
				let cid = tilesrl.getCoordInDirection(d,x,y);
				x = cid[0];
				y = cid[1];
				$(".x"+x+".y"+y).addClass("pathHighlight");
			}
		}
	},
	"canPathToTile": function(flatMap, sqx, sqy, tx, ty) {
		// from a specific square, can we path to (follow open squares) ANY open square in tx,ty/tx+5,ty+5 range?
		// build list of all contingous "floors" from start square
		let pathables = (flatMap[sqx][sqy] == 0) ? tilesrl.getContiguousSquares(flatMap, sqx, sqy) : [];
		// loop through target tile "floors", record a canPath true if we find a match
		let txMax = (tx*5) + tilesrl.tileSize,
			tyMax = (ty*5) + tilesrl.tileSize;
		for (let x = (tx*5); x < txMax; x++) {
			for (let y = (ty*5); y < tyMax; y++) {
				if (flatMap[x][y] == 0) { // is a floor here
					for (let i = 0; i < pathables.length; i++) {
						if ((pathables[i][0] == x) 
							&& (pathables[i][1] == y)) {
							return true;
						}
					}
				}
			}
		}
		return false;
	},
	"getAdjacentSquares": function(flatMap, x, y) {
		let sq = flatMap[x][y],
			isNorth = (y == 0),
			isWest = (x == 0),
			isEast = (x + 1 == flatMap.length),
			isSouth = (y + 1 == flatMap[0].length),
			sqAdj = [
				(!isNorth && !isWest) ? flatMap[x - 1][y - 1] : 1, // 0 nw 
				(!isNorth) ? flatMap[x][y - 1] : 1,                // 1 n
				(!isNorth && !isEast) ? flatMap[x + 1][y - 1] : 1, // 2 ne
				(!isEast) ? flatMap[x + 1][y] : 1,                 // 3 e
				(!isSouth && !isEast) ? flatMap[x + 1][y + 1] : 1, // 4 se
				(!isSouth) ? flatMap[x][y + 1] : 1,                // 5 s
				(!isSouth && !isWest) ? flatMap[x - 1][y + 1] : 1, // 6 sw
				(!isWest) ? flatMap[x - 1][y] : 1                  // 7 w
			];
		return sqAdj; // array of square-values (0,1) around given square x,y
	},
	/* getContiguousSquares
	@flatMap : a "bitmap" of all points in map, [x][y] == int
	@x, @y: coordinate to use as starting point (gets test value int from what's there on the map)
	*/
	"getContiguousSquares": function(flatMap, x, y) {
		let squareList = [[x,y]],
			squareListSurveyed = {},
			matchVal = flatMap[x][y],
			contiguousSquares = [];

		while(squareList.length > 0) {
			let newPos = squareList.pop(),
				newX = newPos[0],
				newY = newPos[1];

			let	adjs = [];
			if (squareListSurveyed[newX] && squareListSurveyed[newX][newY]) {
				adjs = squareListSurveyed[newX][newY];
			} else {
				adjs = tilesrl.getAdjacentSquares(flatMap, newX, newY);
				squareListSurveyed[newX] = squareListSurveyed[newX] || {};
				squareListSurveyed[newX][newY] = squareListSurveyed[newX][newY] || adjs;
			}

			contiguousSquares.push(newPos);

			for (let i = 0; i < adjs.length; i++) {
				let newPosToPush = null;

				if (adjs[i] == matchVal) {
					switch(i) {
						case 1: // N
							newPosToPush = [newX, newY - 1];
							break;
						case 3: // E
							newPosToPush = [newX + 1, newY];
							break;
						case 5: // S
							newPosToPush = [newX, newY + 1];
							break;
						case 7: // W
							newPosToPush = [newX - 1, newY];
							break;
						default:
							//noop
					}
				}

				// should it be added to the list of things to test? (or has it already been tested, or already on list?)
				if (newPosToPush) {
					let isOkToPushToTestList = true,
						compareList = contiguousSquares.concat(squareList), // need to test both lists, tested and to-test
						pX = newPosToPush[0],
						pY = newPosToPush[1];

					for (let i = 0; i < compareList.length; i++) { // already tested or in list to be tested?
						let cX = compareList[i][0],
							cY = compareList[i][1];
						if (cX == pX && cY == pY) {
							isOkToPushToTestList = false;
						}
					}

					//isOkToPushToTestList = isOkToPushToTestList && (newPosToPush[0] >= 0 && newPosToPush[1] >= 0); // just make sure it's on grid

					if (isOkToPushToTestList) {
						squareList.push(newPosToPush);
					}
				}
			}
		}

		return contiguousSquares;
	},

	/** moving on map **/
	"isPathToSquare": function(liveMap, sX, sY, tX, tY) {
		// "liveMap" is an in-play map of cells ({cellType,gobjsInCell,cellX,cellY})
	},

	/** helpers **/
	"getRandomFromArray": function(a) {
		return a[Math.floor(Math.random()*a.length)];
	},
	"makeCopyOfMultidimensionalArray": function(tm) {
		return JSON.parse(JSON.stringify(tm));
	},
	"getCoordInDirection": function(d,x,y) {
		switch (d) {
			case 0:
				y--;
				x--;
				break;
			case 1:
				y--;
				break;
			case 2:
				y--;
				x++;
				break;
			case 3:
				x++;
				break;
			case 4:
				x++;
				y++;
				break;
			case 5:
				y++;
				break;
			case 6:
				x--;
				y++;
				break;
			case 7:
				x--;
				break;
		}
		return [x,y];
	},

	/** debug stuff **/
}


/**
NOTES:
squareClasses = {
	"-1": "corridor",
	"0": "floor",
	"1": "wall",
	"2": "wall nwcorn",
	"3": "wall necorn",
	"4": "wall secorn",
	"5": "wall swcorn",
	"6": "wall ncap",
	"7": "wall ecap",
	"8": "wall scap",
	"9": "wall wcap",
	"10": "wall walls_ns",
	"11": "wall walls_ew",
	"12": "wall wall_n",
	"13": "wall wall_e",
	"14": "wall wall_s",
	"15": "wall wall_w"
};

**/






























/*******           #######  ########   #######     ##       ##       ########              *******/
/*******           ##          ##      ##          ##       ##       ##    ##              *******/
/*******           #######     ##      ######      ##       ##       ########              *******/
/*******                ##     ##      ##          ##       ##       ##    ##              *******/
/*******           #######     ##      #######     #######  #######  ##    ##              *******/






