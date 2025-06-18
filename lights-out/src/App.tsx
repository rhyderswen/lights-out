import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import GameArea from "./components/GameArea";
import ConfettiExplosion from "react-confetti-explosion";
import Popup from "reactjs-popup";

function App() {
  const [hasWon, setHasWon] = useState(false);
  const [moves, setMoves] = useState(0);
  function incrementMoves() {
    setMoves(moves + 1);
  }

  const columns = 5; // Note: Valid solution checking is only implemented for 5x5. There will be errors if this is changed
  const rows = 5;
  const [tileStates, setTileStates] = useState<Array<boolean>>([]);
  function flipTile(row: number, column: number) {
    incrementMoves();
    const clicked = row * columns + column;
    const updatedTiles = tileStates.map((state, i) => {
      if (i === clicked) {
        return !state;
      } else if (clicked % columns !== 0 && i + 1 === clicked) {
        // Switch left square if it the clicked square isn't on the left edge
        return !state;
      } else if (clicked % columns !== columns - 1 && i - 1 === clicked) {
        // Switch right square if it the clicked square isn't on the right edge
        return !state;
      } else if (clicked / columns >= 1 && i + columns === clicked) {
        // Switch upper square if it the clicked square isn't on the top edge
        return !state;
      } else if (clicked / columns < rows - 1 && i - columns === clicked) {
        // Switch lower square if it the clicked square isn't on the bottom edge
        return !state;
      } else {
        return state;
      }
    });
    setTileStates(updatedTiles);
  }

  const dotProduct = useCallback((a: number[], b: number[]) => {
    if (a.length !== b.length) {
      console.error("Tried to do dot product on vectors of different length!");
      return NaN;
    }
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }, []);

  const checkIfSolvable = useCallback(
    (arr: boolean[]) => {
      const n1 = [
        0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1,
        0,
      ]; // from "Turning Lights Out with Linear Algebra" by Marlow Anderson and Todd Feil
      const n2 = [
        1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0,
        1,
      ];

      const numArr = arr.map((state) => +state);
      if (
        dotProduct(numArr, n1) % 2 === 0 &&
        dotProduct(numArr, n2) % 2 === 0
      ) {
        return true;
      }
      return false;
    },
    [dotProduct]
  );

  const randomizeTiles = useCallback(() => {
    const arr = Array(rows * columns);
    do {
      for (let i = 0; i < rows * columns; i++) {
        arr[i] = Boolean(Math.round(Math.random())); // Generates a random boolean
      }
    } while (!checkIfSolvable(arr));
    setTileStates(arr);
  }, [checkIfSolvable]);

  useEffect(() => {
    // Randomize tiles on page load
    randomizeTiles();
  }, [randomizeTiles]);

  function reset() {
    setHasWon(false);
    setMoves(0);
    randomizeTiles();
  }

  useEffect(() => {
    if (moves > 1 && tileStates.every((state) => !state)) {
      setHasWon(true);
    }
  }, [moves, tileStates]);

  return (
    <>
      <button onClick={() => setHasWon(true)}>Trigger Win</button>
      {hasWon && <ConfettiExplosion className="confetti" />}
      <Popup open={hasWon} closeOnDocumentClick onClose={reset}>
        <div className="winPopup">
          You won with {moves} moves! Congrats!
          <div className="popupButtons">
            <button className="button resetButton" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      </Popup>
      <Header moves={moves} reset={reset} />
      <hr className="seperator" />
      <GameArea
        rows={rows}
        columns={columns}
        tileStates={tileStates}
        flipTile={flipTile}
      />
    </>
  );
}

export default App;
