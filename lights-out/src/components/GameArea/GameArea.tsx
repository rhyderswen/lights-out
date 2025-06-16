import { useCallback, useEffect, useState } from "react";
import Tile from "../Tile";
import "./GameArea.css";

interface IGameArea {
  incrementMoves: () => void
}

const GameArea = ({ incrementMoves }: IGameArea) => {
  const columns = 7;
  const rows = 5;
  const [tileStates, setTileStates] = useState<Array<boolean>>([]);
  function flipTile(row: number, column: number) {
    incrementMoves();
    const clicked = row*columns + column;
    const updatedTiles = tileStates.map((state, i) => {
      if (i === clicked) {
        return !state;
      } else if (clicked % columns !== 0 && i+1 === clicked) { // Switch left square if it the clicked square isn't on the left edge
        return !state;
      } else if (clicked % columns !== 6 && i-1 === clicked) { // Switch right square if it the clicked square isn't on the right edge
        return !state;
      } else if (clicked / columns >= 1 && i+columns === clicked) { // Switch upper square if it the clicked square isn't on the top edge
        return !state;
      } else if (clicked / columns < rows-1 && i-columns === clicked) { // Switch lower square if it the clicked square isn't on the bottom edge
        return !state;
      } else {
        return state;
      }
    });
    setTileStates(updatedTiles);
  }

  const randomizeTiles = useCallback(() => {
    const arr = Array(rows*columns);
    for (let i = 0; i < rows*columns; i++) {
      arr[i] = Boolean(Math.round(Math.random())); // Generates a random boolean
    }
    setTileStates(arr);
  }, []);
  
  useEffect(() => {
    randomizeTiles();
  }, [randomizeTiles]);

  return (
    <div className="tileContainer" style={{gridTemplateColumns: "1fr ".repeat(columns), maxWidth: columns*120}}>
      {[...Array(columns*rows)].map((_, i) => <Tile state={tileStates[i]} row={Math.floor(i/columns)} column={i%columns} key={i} flipTile={flipTile} />)}
    </div>
  )
}

export default GameArea;
