import { describe, it, expect } from "vitest"; // I shouldn't need to import this :(
import { render, screen, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";
import App from "../App";
import { gfMatrixGaussian } from "../util/gauss";
import Matrix from "ml-matrix";

function getTileStates() {
  console.log(screen.getAllByTestId("tile")[0].getAttribute("data-islit"));
  return screen
    .getAllByTestId("tile")
    .map((tile) => tile.getAttribute("data-islit") === "true");
}

function flipStates(states: string[], toFlip: number[]) {
  return states.map((state, i) => (toFlip.includes(i) ? !state : state));
}

describe("Rendering", () => {
  it("Properly renders all elements", () => {
    render(<App />);
    expect(screen.getByText(/lights out/i)).toBeInTheDocument();
    expect(screen.getByText(/0 moves/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("tile")).toHaveLength(25);
  });
});

describe("Header", () => {
  it("increments move counter on tile click", async () => {
    render(<App />);
    const moveCounter = screen.getByText(/0 moves/i);
    user.click(screen.getAllByTestId("tile")[0]);
    await waitFor(() => expect(moveCounter).toHaveTextContent(/1 move/i));
    user.click(screen.getAllByTestId("tile")[0]);
    await waitFor(() => expect(moveCounter).toHaveTextContent(/2 moves/i));
  });

  it("randomizes the board and resets moves when reset is clicked", async () => {
    render(<App />);
    user.click(screen.getAllByTestId("tile")[0]);
    await screen.findByText(/1 move/i);

    const oldTiles = getTileStates();
    user.click(screen.getByText(/reset/i));

    await screen.findByText(/0 moves/i);
    const newTiles = getTileStates();
    expect(oldTiles).not.toEqual(newTiles);
  });
});

describe("GameArea", () => {
  it("clicking a middle tile toggles it and adjacent tiles", async () => {
    render(<App />);
    let currentStates = getTileStates();
    user.click(screen.getAllByTestId("tile")[12]);
    await screen.findByText(/1 move/i);

    const expectedStates = flipStates(currentStates, [7, 11, 12, 13, 17]);
    currentStates = getTileStates();
    expect(currentStates).toEqual(expectedStates);
  });

  describe("clicking a corner only toggles 3 tiles", () => {
    // I probably didn't have to do all 4 corners but oh well
    it("top left", async () => {
      render(<App />);
      let currentStates = getTileStates();
      user.click(screen.getAllByTestId("tile")[0]); // top left
      await screen.findByText(/1 move/i);

      const expectedStates = flipStates(currentStates, [0, 1, 5]);
      currentStates = getTileStates();
      expect(currentStates).toEqual(expectedStates);
    });

    it("top right", async () => {
      render(<App />);
      let currentStates = getTileStates();
      user.click(screen.getAllByTestId("tile")[4]); // top right
      await screen.findByText(/1 move/i);

      const expectedStates = flipStates(currentStates, [3, 4, 9]);
      currentStates = getTileStates();
      expect(currentStates).toEqual(expectedStates);
    });

    it("bottom left", async () => {
      render(<App />);
      let currentStates = getTileStates();
      user.click(screen.getAllByTestId("tile")[20]); // bottom left
      await screen.findByText(/1 move/i);

      const expectedStates = flipStates(currentStates, [15, 20, 21]);
      currentStates = getTileStates();
      expect(currentStates).toEqual(expectedStates);
    });

    it("bottom right", async () => {
      render(<App />);
      let currentStates = getTileStates();
      user.click(screen.getAllByTestId("tile")[24]); // bottom right
      await screen.findByText(/1 move/i);

      const expectedStates = flipStates(currentStates, [23, 24, 19]);
      currentStates = getTileStates();
      expect(currentStates).toEqual(expectedStates);
    });
  });

  describe("clicking an edge only toggles 4 tiles", async () => {
    it("top", async () => {
      render(<App />);
      let currentStates = getTileStates();
      user.click(screen.getAllByTestId("tile")[2]);
      await screen.findByText(/1 move/i);

      const expectedStates = flipStates(currentStates, [1, 2, 3, 7]);
      currentStates = getTileStates();
      expect(currentStates).toEqual(expectedStates);
    });

    it("left", async () => {
      render(<App />);
      let currentStates = getTileStates();
      user.click(screen.getAllByTestId("tile")[10]);
      await screen.findByText(/1 move/i);

      const expectedStates = flipStates(currentStates, [5, 10, 11, 15]);
      currentStates = getTileStates();
      expect(currentStates).toEqual(expectedStates);
    });

    it("right", async () => {
      render(<App />);
      let currentStates = getTileStates();
      user.click(screen.getAllByTestId("tile")[14]);
      await screen.findByText(/1 move/i);

      const expectedStates = flipStates(currentStates, [9, 13, 14, 19]);
      currentStates = getTileStates();
      expect(currentStates).toEqual(expectedStates);
    });

    it("bottom", async () => {
      render(<App />);
      let currentStates = getTileStates();
      user.click(screen.getAllByTestId("tile")[22]);
      await screen.findByText(/1 move/i);

      const expectedStates = flipStates(currentStates, [17, 21, 22, 23]);
      currentStates = getTileStates();
      expect(currentStates).toEqual(expectedStates);
    });
  });
});

function generateMatrixA(n = 5) {
  const size = n * n;
  const A = Array.from({ length: size }, () => Array(size).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const idx = i * n + j;
      A[idx][idx] = 1;
      const neighbors = [
        [i - 1, j],
        [i + 1, j],
        [i, j - 1],
        [i, j + 1],
      ];
      for (const [ni, nj] of neighbors) {
        if (ni >= 0 && ni < n && nj >= 0 && nj < n) {
          const nIdx = ni * n + nj;
          A[idx][nIdx] = 1;
        }
      }
    }
  }
  return A;
}

function generateSolutions(b: number[]) {
  // binary gaussian elimination woo!!!!
  // Math help from http://cau.ac.kr/~mhhgtx/courses/LinearAlgebra/references/MadsenLightsOut.pdf
  const A = generateMatrixA();
  const matrix = new Matrix(A).addColumn(b);
  const echelon = gfMatrixGaussian(matrix, 2);
  if (
    !echelon ||
    echelon
      .to2DArray()
      .some((x) => x.slice(0, -1).every((y) => y === 0) && x.at(-1) !== 0)
  ) {
    // No solution
    return [];
  }
  const solution = echelon.getColumn(A.length);
  return solution;
}

describe("App", () => {
  it("is solvable and win screen appears", async () => {
    render(<App />);
    const initialStates = getTileStates();
    const initalStatesBinary = initialStates.map((state) => (state ? 1 : 0));
    const solution = generateSolutions(initalStatesBinary);
    const tiles = screen.getAllByTestId("tile");
    solution.forEach((toClick, i) => {
      if (toClick === 1) {
        user.click(tiles[i]);
      }
    });
    expect(await screen.findByText(/you won/i)).toBeInTheDocument();
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });
  it("displays the correct amount of moves in win screen", async () => {
    render(<App />);
    user.click(screen.getAllByTestId("tile")[0]);
    user.click(screen.getByText(/trigger win/i));
    expect(
      await screen.findByText(/you won with 1 moves/i),
    ).toBeInTheDocument(); // surely nobody will win in just 1 move and I don't need to remove the s...
  });
  it("shuffles the board and clears the win screen when reset is clicked", async () => {
    render(<App />);
    const initialStates = getTileStates();
    user.click(screen.getAllByTestId("tile")[0]);
    user.click(screen.getByText(/trigger win/i));
    await screen.findByTestId("winReset");
    user.click(screen.getByTestId("winReset"));

    expect(await screen.findByText(/0 moves/i)).toBeInTheDocument();
    expect(screen.queryByTestId("winReset")).not.toBeInTheDocument();
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    const shuffledStates = getTileStates();
    expect(shuffledStates).not.toEqual(initialStates);
  });
});
