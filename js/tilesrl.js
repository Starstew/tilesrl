var tilesrl = {
	"tileSize": 5,
	"mapTileWidth": 5,
	"mapTileHeight": 5,
	"gameData": {},
	"rotLabels": ["rot0","rot90","rot180","rot270"],
	"defaultTiles": [
		[0,0,0,0,0,1,1,0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0],   // "7"
		// [0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,1,1,0,0,0,0,0,0], // "d"
		// [0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0], // "r"
		// [0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,1,0,0,0,0,0], // "L"
		[1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1],   // "7d"
		[1,1,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1],   // "rl"
		[1,0,1,1,1,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,1,0,1,1,1],
		[0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,0],
		[1,1,1,1,1,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1,1,1,1,0,1]
	],

	/** functions **/
	"generateStartingTileStack": function() {
		let tileTargetCount = 40,
			tileCount = 0,
			tileStack = [];
		while (tileCount < tileTargetCount) {
			for (var i = 0; i < tilesrl.defaultTiles.length; i++) {
				tileStack.push(tilesrl.makeTile(tilesrl.defaultTiles[i]));
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
	"generateEmptyLevelMap": function() {
		let levelMap = [];
		for (let x = 0; x < tilesrl.mapTileWidth; x++) {
			let xcol = []
			for (let y = 0; y < tilesrl.mapTileHeight; y++) {
				xcol.push("");
			}
			levelMap.push(xcol);
		}
		return levelMap;
	},
	"flattenMap": function(tilemap) {
		// concatenate all the levelMap tiles' arrays
		let mapSquares = [];
		if (!tilemap) {
			return;
		}
		for (let tx = 0; tx < tilemap.length; tx++) {
			for (let x = 0; x < tilesrl.tileSize; x++) {
				let concatCol = [];	
				for (let ty = 0; ty < tilemap[tx].length; ty++) {
					if (tilemap[tx][ty]) {
						concatCol = concatCol.concat(tilemap[tx][ty][x]);
					}
				}
				mapSquares.push(concatCol);
			}
		}
		return mapSquares;
	},
	"bakeMap": function() {
		let flatMap = tilesrl.flattenMap(tilesrl.gameData.levelMap),
			bakedMap = [];

		// first pass, catch diagonals
		let diagonalsScrubbed = false;
		while(diagonalsScrubbed == false) {
			diagonalsScrubbed = true;
			for (let x = 0; x < flatMap.length; x++) {
				for (let y = 0; y < flatMap[x].length; y++) {
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

		// traverse squares
		for (let x = 0; x < flatMap.length; x++) {
			bakedMap.push([]);
			for (let y = 0; y < flatMap[x].length; y++) {
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

				bakedMap[x].push(bakeNumber);
			}
		}

		return bakedMap;
	},
	"drawMap": function() {
		let bakedMap = tilesrl.bakeMap(),
			htmlOutput = "",
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

		for (let y = 0; y < bakedMap[0].length; y++) {
			for (let x = 0; x < bakedMap.length; x++) {
				let sqClass = squareClasses[bakedMap[x][y]];
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
			"levelMap": tilesrl.generateEmptyLevelMap()
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

			let sx = 1,
				sy = 1; // TEMP! Need to scrape this after starting tile is placed.
			let levelMapTemp = tilesrl.generateEmptyLevelMap();
			let fixerRot = [[0,0,0,0,0],[0,1,1,1,0],[0,1,0,1,0],[0,1,1,1,0],[0,0,0,0,0]];
			tilesrl.commitTileToMap(levelMapTemp, fixerRot, 0, 0); // starter in upper left (for now)
			for (let x = 0; x < tilesrl.mapTileWidth; x++) {
				for (let y = 0; y < tilesrl.mapTileHeight; y++) {
					if (x == 0 && y == 0) {
						continue;
					}
					// make a copy of the game's levelMap (tile map)
					let placementSuccess = false,
						testTile = tilesrl.getRandomFromArray(tilesrl.gameData.levelTileStack);
					let validTilePlacements = tilesrl.getAllValidTilePlacements([0,0],testTile,levelMapTemp);
					let chosenPlacement = tilesrl.getRandomFromArray(validTilePlacements);
					console.log(["?",validTilePlacements,chosenPlacement]);
					let chosenRot = testTile[chosenPlacement[2]];
					tilesrl.commitTileToMap(levelMapTemp, chosenRot, chosenPlacement[0], chosenPlacement[1]);
					placementSuccess = validTilePlacements.length > 0;
					if (placementSuccess) {
						tilesrl.gameData.levelMap = levelMapTemp;
					} else {
						// TODO track unfilled positions?
						console.log("failed placement at " + x + ", " + y);
						tilesrl.commitTileToMap(levelMapTemp, fixerRot, x, y);
						tilesrl.gameData.levelMap = levelMapTemp;
					}
				}
			}

			tilesrl.drawMap();
	},
	/*
		@entrance: [x,y]
		@newTile: [[rot0],[rot90],etc]
		@tileMap: 5*5 reference of map so far
	*/
	"getAllValidTilePlacements" : function(entrance, newTile, tileMap) {
		console.log([entrance,newTile,tileMap]);
		// get list of open tile spaces that are adjacent to tiles already placed
		let openTilesAdjacent = [];
		for (let x = 0; x < tilesrl.mapTileWidth -1; x++) {
			for (let y = 0; y < tilesrl.mapTileHeight - 1; y++) {
				if (tileMap[x][y] === "") { // open if undefined
					let left = (x>0 && tileMap[x-1][y]),
						right = (x<tilesrl.mapTileWidth && tileMap[x+1][y]),
						top = (y>0 && tileMap[x][y-1]),
						bottom = (y<tilesrl.mapTileHeight && tileMap[x][y+1]);
					if(left || right || top || bottom) {
						openTilesAdjacent.push([x,y]); // seems to be adjacent and open
					}
				}
			}
		}
		console.log("openTilesAdjacent:" + openTilesAdjacent.length);

		// iterate that list, adding specific tile rotations to an array when they are valid there ([tx,ty,rotIdx])
		let validPlacements = [];
		let eX = entrance[0],
			eY = entrance[1];
		for (let t = 0; t < openTilesAdjacent.length; t++) {
			let tileMapCopy = [];
			for(let x=0;x<5;x++) {
				tileMapCopy.push(tileMap[x]);
			}
			let x = openTilesAdjacent[t][0],
				y = openTilesAdjacent[t][1];
			for (let r = 0; r < 4; r++) {
				let testRot = newTile[tilesrl.rotLabels[r]];
				tilesrl.commitTileToMap(tileMapCopy, testRot, x, y);
				let flatMap = tilesrl.flattenMap(tileMapCopy);
				if (tilesrl.canPathToTile(flatMap, eX, eY, (x*5), (y*5))) {
					validPlacements.push([x, y, r]);
					console.log("vp!");
				}
			}
		}
		console.log("validPlacements:" + validPlacements.length);
		return validPlacements;
	},
	"canPathToTile": function(sqmap, sqx, sqy, tx, ty) {
		// from a specific square, can we path to (follow open squares) ANY open square in tx,ty/tx+5,ty+5 range?
		// build list of all contingous "floors" from start square
		let pathables = (sqmap[sqx][sqy] == 0) ? tilesrl.getContiguousSquares(sqmap, sqx, sqy) : [];

		// loop through target tile "floors", record a canPath true if we find a match
		let txMax = tx + tilesrl.tileSize,
			tyMax = ty + tilesrl.tileSize;
		let i = 0;
		for (let x = tx; x < txMax; x++) {
			for (let y = ty; y < tyMax; y++) {
				if (sqmap[x][y] == 0) { // is a floor here
					for (let i = 0; i < pathables.length; i++) {
						if (pathables[i].toString() == [x,y].toString()) {
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
			matchVal = flatMap[x][y],
			tested = [];

		while(squareList.length) {
			let newPos = squareList.pop(),
				newX = newPos[0],
				newY = newPos[1];

			let	adjs = tilesrl.getAdjacentSquares(flatMap, newX, newY);

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
					let isSafe = true,
						nppString = newPosToPush.toString(),
						compareList = tested.concat(squareList); // need to test both lists, tested and to-test

					for (let i = 0; i < compareList.length; i++) { // already tested or in list?
						if (compareList[i].toString() == nppString) {
							isSafe = false;
							continue;
						}
					}
					isSafe = isSafe && (newPosToPush[0] >= 0 && newPosToPush[1] >= 0);
					if (isSafe) {
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

	/** debug stuff **/
	"debugDisplayTileRotations": function(t){
		let objs = [t.rot0, t.rot90, t.rot180, t.rot270],
			output = "--------\n",
			htmlOutput = "";

		for (let i = 0; i < objs.length; i++) {
			output += "\n\n";
			htmlOutput += "<p>";

			let rot = objs[i];
			for (let y = 0; y < 5; y++) {
				output += "\n";
				htmlOutput += "<br>"
				for (let x = 0; x < 5; x++) {
					let sq = (rot[x][y] > 0) ? "=" : "-";
					output += sq;
					htmlOutput += "<div class='testSquare ";
					htmlOutput += (rot[x][y] > 0) ? "wall" : "floor";
					htmlOutput += "'> </div>";
				}
			}
		}
		
		$("#map").empty().append(htmlOutput);
	},
	"debugGenerateRandomMap": function() {
		$("#map").empty();
		let stack = tilesrl.generateStartingTileStack(),
			rots = ["rot0","rot90","rot180","rot270"];
		for (let x = 0; x < tilesrl.mapTileWidth; x++) {
			for (let y = 0; y < tilesrl.mapTileHeight; y++) {
				tilesrl.commitTileToMap(tilesrl.getRandomFromArray(stack)[tilesrl.getRandomFromArray(rots)], x, y);
			}
		}
		tilesrl.drawMap();
	},
	"debugAddRandomTile": function() {
		let stack = tilesrl.generateStartingTileStack(),
			rots = ["rot0","rot90","rot180","rot270"];
		tilesrl.commitTileToMap(tilesrl.getRandomFromArray(stack)[tilesrl.getRandomFromArray(rots)], Math.floor(Math.random()*5), Math.floor(Math.random()*5));
		tilesrl.drawMap();
	},
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