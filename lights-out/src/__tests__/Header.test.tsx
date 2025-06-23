import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";
import App from "../App";

describe("Header", () => {
  it("increments move on tile click", async () => {
    render(<App />);
    const moveCounter = screen.getByText(/0 moves/i);
    user.click(screen.getAllByTestId("tile")[0]);
    await waitFor(() => expect(moveCounter).toHaveTextContent(/1 move/i));
  });
});
