import "./Tile.css";

interface ITile {
  isLit: boolean;
  onClick: () => void;
}

const Tile = ({ isLit, onClick }: ITile) => {
  return (
    <span className="tileWrapper">
      <button
        className={"tile " + (isLit ? "lightTile" : "darkTile")}
        onClick={onClick}
      />
    </span>
  );
};

export default Tile;
