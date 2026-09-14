// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProfilePortrait } from "./ProfilePortrait";

afterEach(cleanup);

describe("ProfilePortrait", () => {
  it("usa o retrato hospedado no próprio site", () => {
    render(<ProfilePortrait />);

    const portrait = screen.getByRole("img", {
      name: "Foto de perfil de Caíque Rezende",
    });
    expect(portrait).toHaveAttribute("src", "/profile/caique-rezende.png");
  });

  it("mantém uma identificação acessível quando o retrato falha", () => {
    render(<ProfilePortrait />);

    const portrait = screen.getByRole("img", {
      name: "Foto de perfil de Caíque Rezende",
    });

    fireEvent.error(portrait);

    expect(
      screen.getByRole("img", { name: "Foto de perfil de Caíque Rezende" }),
    ).toHaveTextContent("CR");
  });
});
