import Tile from "../Tile";
import "./GameArea.css";

interface IGameArea {
  rows: number,
  columns: number,
  tileStates: Array<boolean>,
  flipTile: (row: number, column: number) => void
}

const GameArea = ({ rows, columns, tileStates, flipTile }: IGameArea) => {
  

  return (
    <div className="tileContainer" style={{gridTemplateColumns: "1fr ".repeat(columns), maxWidth: columns*120}}>
      {[...Array(columns*rows)].map((_, i) => <Tile state={tileStates[i]} row={Math.floor(i/columns)} column={i%columns} key={i} flipTile={flipTile} />)}
    </div>
  )
}

export default GameArea;
