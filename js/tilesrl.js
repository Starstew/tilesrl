var tilesrl = {
	"tileSize": 5,
	"mapTileWidth": 5,
	"mapTileHeight": 5,
	"defaultTiles": [
		[0,0,0,0,0,1,1,0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,0,0], // "7"
		// [0,0,0,0,0,0,0,1,1,0,0,0,1,1,0,1,1,1,1,0,0,0,0,0,0], // "d"
		// [0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0], // "r"
		// [0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,1,0,0,0,0,0], // "L"
		[1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1], // "7d"
		[1,1,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1] // "rl"
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
	"commitTileToMap": function(tileRot, x, y) {
		tilesrl.levelMap = tilesrl.levelMap || tilesrl.generateEmptyLevelMap();
		tilesrl.levelMap[x][y] = tileRot;
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
	"flattenMap": function() {
		// concatenate all the levelMap tiles' arrays
		let mapSquares = [];
		for (let tx = 0; tx < tilesrl.mapTileWidth; tx++) {
			for (let x = 0; x < tilesrl.tileSize; x++) {
				let concatCol = [];	
				for (let ty = 0; ty < tilesrl.mapTileHeight; ty++) {
					concatCol = concatCol.concat(tilesrl.levelMap[tx][ty][x]);
				}
				mapSquares.push(concatCol);
			}
		}
		return mapSquares;
	},
	"bakeMap": function() {
		let flatMap = tilesrl.flattenMap(),
			bakedMap = [];

		// first pass, catch diagonals
		for (let x = 0; x < flatMap.length; x++) {
			for (let y = 0; y < flatMap[x].length; y++) {
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

				if ( (sqAdj[0] < 1 && (sqAdj[1] + sqAdj[7] == 2))
					|| (sqAdj[2] < 1 && (sqAdj[1] + sqAdj[3] == 2))
					|| (sqAdj[4] < 1 && (sqAdj[3] + sqAdj[5] == 2))
					|| (sqAdj[6] < 1 && (sqAdj[5] + sqAdj[7] == 2))) {
						flatMap[x][y] = 1; // a "dumb" change to wall (TODO: make it choosier? Such as not-blocking a corridor)
				}
			}
		}

		// traverse squares
		for (let x = 0; x < flatMap.length; x++) {
			bakedMap.push([]);
			for (let y = 0; y < flatMap[x].length; y++) {
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

				let bakeNumber = sq;

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
				htmlOutput += "<div class='testSquare " + sqClass + "'> </div>";
			}
			htmlOutput += "<br>"
		}
		$("#map").empty().append(htmlOutput);
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
		console.log(output);
	},
	"debugGenerateRandoMap": function() {
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

	/** helpers **/
	"getRandomFromArray": function(a) {
		return a[Math.floor(Math.random()*a.length)];
	}
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