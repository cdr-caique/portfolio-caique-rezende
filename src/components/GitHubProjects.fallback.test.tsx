// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GitHubProjects } from "./GitHubProjects";

describe("GitHubProjects fallback", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("não publica zero estrelas quando a API não forneceu métricas", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<GitHubProjects />);

    expect(
      await screen.findByText(
        "Exibindo uma seleção salva — atualização automática temporariamente indisponível",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Estrelas indisponíveis").length).toBeGreaterThan(0);
    expect(screen.queryByText("0 estrelas")).not.toBeInTheDocument();
  });

  it("cancels the pending retry when unmounted", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);

    const view = render(<GitHubProjects />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText(/seleção salva/i)).toBeInTheDocument();
    view.unmount();
    await vi.advanceTimersByTimeAsync(5_000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
