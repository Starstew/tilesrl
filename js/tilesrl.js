var tilesrl = {
	"tileSize": 5,
	"tileMapCols": 5,
	"tileMapRows": 5,
	"gameData": {},
	"rotLabels": ["rot0","rot90","rot180","rot270"],
	"tileWallMin": 9,
	"tileWallMax": 16,

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
		console.log(sqArray);
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
			// [1,0,1,1,1,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,1,0,1,1,1] //tester
			tilesrl.createRandomTile(tilesrl.tileWallMin, tilesrl.tileWallMax),
			tilesrl.createRandomTile(tilesrl.tileWallMin, tilesrl.tileWallMax),
			tilesrl.createRandomTile(tilesrl.tileWallMin, tilesrl.tileWallMax),
			tilesrl.createRandomTile(tilesrl.tileWallMin, tilesrl.tileWallMax)

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
	"commitTileToMap": function(levelMap, tileRot, x, y) {
		levelMap[x][y] = tileRot;
	},
	"generateEmptyTileMap": function() {
		let levelMap = [];
		for (let x = 0; x < tilesrl.tileMapCols; x++) {
			let xcol = []
			for (let y = 0; y < tilesrl.tileMapRows; y++) {
				xcol.push("");
			}
			levelMap.push(xcol);
		}
		return levelMap;
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
	"getDiagonalScrubbedFlatMap": function(flatMap) {
		flatMap = tilesrl.makeCopyOfMultidimensionalArray(flatMap);
		let maxSqX = tilesrl.tileMapCols * tilesrl.tileSize,
			maxSqY = tilesrl.tileMapRows * tilesrl.tileSize,
			diagonalsScrubbed = false;

		while(diagonalsScrubbed == false) {
			diagonalsScrubbed = true;
			for (let x = 0; x < maxSqX; x++) {
				for (let y = 0; y < maxSqY; y++) {
					let sqAdj = tilesrl.getAdjacentSquares(flatMap,x,y),
						sq = flatMap[x][y];
					if (sq == 0) {
						if ( (sqAdj[0] < 1 && (sqAdj[1] + sqAdj[7] == 2))
							|| (sqAdj[2] < 1 && (sqAdj[1] + sqAdj[3] == 2))
							|| (sqAdj[4] < 1 && (sqAdj[3] + sqAdj[5] == 2))
							|| (sqAdj[6] < 1 && (sqAdj[5] + sqAdj[7] == 2)) ) {
								flatMap[x][y] = 1; // a "dumb" change to wall (TODO: make it choosier? Such as not-blocking a corridor)
								diagonalsScrubbed = false;
						}
					}
				}
			}
		}

		return flatMap;
	},
	"getPostProcessedFlatMap": function(flatMap) {
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
			"phase": 1, // starting
			"collectedTiles": tilesrl.generateStartingTileStack(),
			"levelTileStack": null,
			"currentLevel": 1,
			"levelMap": tilesrl.generateEmptyTileMap()
		};
		tilesrl.startNewLevel();
		tilesrl.initTilePlacementPhase();
	},
	"startNewLevel": function() {
		// build a stack of tiles, 
		// ... use all (if any) generated tiles from previous level, >> TODO
		// ... fill rest of deck with random choices from legacy stack. >> TODO
		let levelTileStack = [];
		while(levelTileStack.length < 20) {
			levelTileStack.push(tilesrl.getRandomFromArray(tilesrl.gameData.collectedTiles));
		}
		// add an entrance to 0th position of stack >> TODO
		// add an exit tile to 20th position of stack >> TODO

		// commit this stack to the game data
		tilesrl.gameData.levelTileStack = levelTileStack;
	},
	"initTilePlacementPhase": function() {
		tilesrl.gameData.phase = 2; // tile placement

		// TEMP auto placement
			let tileMapTemp = tilesrl.generateEmptyTileMap();
			let fixerRot = [[0,0,0,0,0],[0,1,1,1,0],[0,1,0,1,0],[0,1,1,1,0],[0,0,0,0,0]];
			tilesrl.commitTileToMap(tileMapTemp, fixerRot, 0, 0); // starter in upper left (for now)

			let autoPlaceTile = function(sr) {
				if (sr > 0) {
					let placementSuccess = false,
					testTile = tilesrl.getRandomFromArray(tilesrl.gameData.levelTileStack),
					validTilePlacements = tilesrl.getAllValidTilePlacements([0, 0], testTile, tileMapTemp),
					chosenPlacement = tilesrl.getRandomFromArray(validTilePlacements);
					if (validTilePlacements.length == 0) {
						console.log(["broke at " + slotsRemaining, testTile]);
						return;
					}
					let chosenRot = testTile[tilesrl.rotLabels[chosenPlacement[2]]];
					tilesrl.commitTileToMap(tileMapTemp, chosenRot, chosenPlacement[0], chosenPlacement[1]);
					placementSuccess = validTilePlacements.length > 0;
					if (placementSuccess) {
						slotsRemaining--;
					}

					tilesrl.drawMap(tilesrl.getBasicFlatMap(tileMapTemp));
					setTimeout(function(){
						autoPlaceTile(slotsRemaining);
					},500);
				} else {
					let fm = tilesrl.getBasicFlatMap(tileMapTemp),
						dsfm = tilesrl.getDiagonalScrubbedFlatMap(fm),
						bfm = tilesrl.getPostProcessedFlatMap(dsfm);
					tilesrl.drawMap(bfm);
				}
			};
			// go through deck and place until we fill the map
			let slotsRemaining = 24;
			autoPlaceTile(slotsRemaining);
	},
	/*
		@entrance: [x,y]
		@newTile: [[rot0],[rot90],etc]
		@tileMap: 5*5 reference of map so far
	*/
	"getAllValidTilePlacements" : function(entrance, newTile, tileMap) {
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
		let eX = entrance[0],
			eY = entrance[1];
		for (let t = 0; t < openTilesAdjacent.length; t++) {
			let tileMapCopy = tilesrl.makeCopyOfMultidimensionalArray(tileMap);
			let x = openTilesAdjacent[t][0],
				y = openTilesAdjacent[t][1];
			for (let r = 0; r < 4; r++) {
				let testRot = newTile[tilesrl.rotLabels[r]];
				tilesrl.commitTileToMap(tileMapCopy, testRot, x, y);
				let flatMap = tilesrl.getBasicFlatMap(tileMapCopy);
				if (tilesrl.canPathToTile(flatMap, eX, eY, x, y)) {
					validPlacements.push([x, y, r]);
				}
			}
		}
		//console.log([openTilesAdjacent,validPlacements]);
		return validPlacements;
	},
	"canPathToTile": function(sqmap, sqx, sqy, tx, ty) {
		// from a specific square, can we path to (follow open squares) ANY open square in tx,ty/tx+5,ty+5 range?
		// build list of all contingous "floors" from start square
		let pathables = (sqmap[sqx][sqy] == 0) ? tilesrl.getContiguousSquares(sqmap, sqx, sqy) : [];
		//console.log(["pathables",pathables]);
		// loop through target tile "floors", record a canPath true if we find a match
		let txMax = (tx*5) + tilesrl.tileSize,
			tyMax = (ty*5) + tilesrl.tileSize;
		let i = 0;
		for (let x = tx; x < txMax; x++) {
			for (let y = ty; y < tyMax; y++) {
				if (sqmap[x][y] == 0) { // is a floor here
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
		let squareList = [[x,y,tilesrl.getAdjacentSquares(flatMap,x,y)]],
			squareListSurveyed = {},
			matchVal = flatMap[x][y],
			tested = [];

		while(squareList.length) {
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

			tested.push(newPos);

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
				if (newPosToPush) {
					let isOkToPushToTestList = true,
						compareList = tested.concat(squareList); // need to test both lists, tested and to-test

					for (let i = 0; i < compareList.length; i++) { // already tested or in list?
						if (compareList[i][0] + 0 == newPosToPush[0] + 0
							&& compareList[i][1] + 0 == newPosToPush[1] + 0) {
							isOkToPushToTestList = false;
							continue;
						}
					}
					isOkToPushToTestList = isOkToPushToTestList && (newPosToPush[0] >= 0 && newPosToPush[1] >= 0);
					if (isOkToPushToTestList) {
						squareList.push(newPosToPush);
					}
				}
			}
		}

		return tested; // aka "contiguous"
	},

	/** helpers **/
	"getRandomFromArray": function(a) {
		return a[Math.floor(Math.random()*a.length)];
	},
	"makeCopyOfMultidimensionalArray": function(tm) {
		return JSON.parse(JSON.stringify(tm));
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