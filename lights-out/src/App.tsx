import { useState } from 'react'
import './App.css'
import Header from './components/Header';
import GameArea from './components/GameArea';

function App() {
  const [moves, setMoves] = useState(0);
  function incrementMoves() {
    setMoves(moves + 1);
  }

  return (
    <>
      <Header moves={moves}/>
      <hr className="seperator"/>
      <GameArea incrementMoves={incrementMoves}/>
    </>
  )
}

export default App
