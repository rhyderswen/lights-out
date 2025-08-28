import Tile from "../Tile";
import "./GameArea.css";

interface IGameArea {
  rows: number;
  columns: number;
  tileStates: Array<boolean>;
  flipTile: (row: number, column: number) => void;
}

const GameArea = ({ rows, columns, tileStates, flipTile }: IGameArea) => {
  return (
    <div
      className="tileContainer"
      style={{
        gridTemplateColumns: "1fr ".repeat(columns),
        maxWidth: columns * 100,
      }}
    >
      {[...Array(columns * rows)].map((_, i) => (
        <Tile
          isLit={tileStates[i]}
          onClick={() => flipTile(Math.floor(i / columns), i % columns)}
          key={i}
        />
      ))}
    </div>
  );
};

export default GameArea;
