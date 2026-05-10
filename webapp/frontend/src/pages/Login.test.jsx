import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Login from "./Login";
import client from "../api/client";

vi.mock("../api/client");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("Login page", () => {
  it("renders email and password inputs and a login button", () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("renders a link to the register page", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });

  it("stores the token and navigates to dashboard on successful login", async () => {
    client.post.mockResolvedValueOnce({ data: { access_token: "tok123", token_type: "bearer" } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("tok123");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error message when login fails", async () => {
    client.post.mockRejectedValueOnce({ response: { data: { detail: "Incorrect email or password" } } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Incorrect email or password")).toBeInTheDocument();
    });
  });

  it("shows a fallback error when no server detail is returned", async () => {
    client.post.mockRejectedValueOnce(new Error("Network error"));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });

  it("toggles dark mode when the toggle button is clicked", () => {
    renderLogin();
    const toggleBtn = screen.getByRole("button", { name: /dark/i });
    fireEvent.click(toggleBtn);
    expect(localStorage.getItem("darkMode")).toBe("true");
    expect(screen.getByRole("button", { name: /light/i })).toBeInTheDocument();
  });
});
