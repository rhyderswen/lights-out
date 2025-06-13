import './Header.css';

interface IHeader {
  moves: number
}

const Header = ({ moves }: IHeader) => {

  return (
    <div className="header">
      <h1>Lights Out</h1>
      <div className="scoreBox">
          {moves} move{moves === 1 ? "" : "s"}
      </div>
    </div>
  )
}

export default Header;
