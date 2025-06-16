import './Header.css';

interface IHeader {
  moves: number,
  reset: () => void
}

const Header = ({ moves, reset }: IHeader) => {

  return (
    <div className="header">
      <h1>Lights Out</h1>
      <div className="scoreBox">
          {moves} move{moves === 1 ? "" : "s"}
      </div>
      <button className="button resetButton" onClick={reset}>Reset</button>
    </div>
  )
}

export default Header;
