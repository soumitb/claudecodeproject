import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Register from "./Register";
import client from "../api/client";

vi.mock("../api/client");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("Register page", () => {
  it("renders email and password inputs and a register button", () => {
    renderRegister();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("renders a link to the login page", () => {
    renderRegister();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("navigates to login on successful registration", async () => {
    client.post.mockResolvedValueOnce({ data: { id: 1, email: "user@example.com", is_active: true } });
    renderRegister();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("shows an error when registration fails with a server message", async () => {
    client.post.mockRejectedValueOnce({ response: { data: { detail: "Email already registered" } } });
    renderRegister();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "taken@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument();
    });
  });

  it("shows a fallback error when no server detail is returned", async () => {
    client.post.mockRejectedValueOnce(new Error("Network error"));
    renderRegister();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });
  });

  it("toggles dark mode when the toggle button is clicked", () => {
    renderRegister();
    const toggleBtn = screen.getByRole("button", { name: /dark/i });
    fireEvent.click(toggleBtn);
    expect(localStorage.getItem("darkMode")).toBe("true");
    expect(screen.getByRole("button", { name: /light/i })).toBeInTheDocument();
  });
});
