import "./Tile.css";

interface ITile {
  state: boolean,
  row: number,
  column: number,
  flipTile: (row: number, column: number) => void
}

const Tile = ({ state, row, column, flipTile }: ITile) => {
  return (
    <span className="tileWrapper">
      <button className={"tile " + (state ? "lightTile" : "darkTile")} onClick={() => flipTile(row, column)} /> 
    </span>
  )
}

export default Tile;
