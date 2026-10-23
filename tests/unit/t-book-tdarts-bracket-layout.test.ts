import { describe, expect, it } from "vitest"
import {
  BRACKET_DIMENSIONS,
  bracketRoundLabel,
  computeBracketLayout,
  computeColumnBracketLayout,
  computePlayerBracketPath,
  isBinaryTreeRounds,
  matchWinnerSide,
  resolveBracketPanels,
  type TDartsBracketMatch,
} from "@wse/plugin-t-book/lib/tdarts-bracket-layout"

const dims = BRACKET_DIMENSIONS
const m = (p1: string, p2: string, extra: Partial<TDartsBracketMatch> = {}): TDartsBracketMatch => ({
  player1: p1,
  player2: p2,
  player1Name: p1,
  player2Name: p2,
  status: "pending",
  ...extra,
})

const labels = {
  final: "Döntő",
  semiFinal: "Elődöntő",
  quarterFinal: "Negyeddöntő",
  roundOf: (n: number) => `Legjobb ${n}`,
  roundN: (n: number) => `${n}. forduló`,
}

describe("computeBracketLayout", () => {
  it("centers each later-round match between its two feeders", () => {
    const layout = computeBracketLayout([["a", "b", "c", "d"], ["ab", "cd"], ["final"]], dims)!
    const byKey = (r: number, i: number) => layout.matches.find((x) => x.roundIndex === r && x.matchIndex === i)!
    expect(byKey(1, 0).center).toBe((byKey(0, 0).center + byKey(0, 1).center) / 2)
    expect(byKey(1, 1).center).toBe((byKey(0, 2).center + byKey(0, 3).center) / 2)
    expect(byKey(2, 0).center).toBe((byKey(1, 0).center + byKey(1, 1).center) / 2)
    expect(byKey(2, 0).x).toBe(2 * (dims.cardWidth + dims.columnGap))
  })

  it("draws one connector per feeder and sizes the canvas", () => {
    const layout = computeBracketLayout([["a", "b", "c", "d"], ["ab", "cd"], ["final"]], dims)!
    expect(layout.connectors.map((c) => c.id).sort()).toEqual(
      ["1-0-p1", "1-0-p2", "1-1-p1", "1-1-p2", "2-0-p1", "2-0-p2"].sort()
    )
    expect(layout.width).toBe(3 * dims.cardWidth + 2 * dims.columnGap)
    expect(layout.height).toBe(4 * dims.cardHeight + 3 * dims.rowGap)
    // Elbow: out of the feeder's right edge, into the child's left edge.
    expect(layout.connectors[0]!.path).toMatch(/^M \d+(\.\d+)? \d+(\.\d+)? H [\d.]+ V [\d.]+ H [\d.]+$/)
  })

  it("returns null for an empty bracket", () => {
    expect(computeBracketLayout([], dims)).toBeNull()
    expect(computeColumnBracketLayout([[]], dims)).toBeNull()
  })
})

describe("computeColumnBracketLayout", () => {
  it("links same-size rounds in parallel (double-elim losers)", () => {
    const layout = computeColumnBracketLayout([["a", "b"], ["c", "d"], ["e"]], dims)!
    const ids = layout.connectors.map((c) => c.id)
    expect(ids).toContain("1-0-parallel")
    expect(ids).toContain("1-1-parallel")
    expect(ids).toContain("2-0-p1")
    expect(ids).toContain("2-0-p2")
  })
})

describe("isBinaryTreeRounds", () => {
  it("accepts halving rounds and rejects parallel rounds", () => {
    expect(isBinaryTreeRounds([[1, 2, 3, 4], [1, 2], [1]])).toBe(true)
    expect(isBinaryTreeRounds([[1, 2, 3], [1, 2], [1]])).toBe(true)
    expect(isBinaryTreeRounds([[1, 2], [1, 2], [1]])).toBe(false)
  })
})

describe("bracketRoundLabel", () => {
  it("counts back from the final in a tree", () => {
    expect([0, 1, 2, 3, 4].map((i) => bracketRoundLabel(i, 5, true, labels))).toEqual([
      "Legjobb 32",
      "Legjobb 16",
      "Negyeddöntő",
      "Elődöntő",
      "Döntő",
    ])
  })

  it("numbers rounds of non-tree panels", () => {
    expect(bracketRoundLabel(1, 4, false, labels)).toBe("2. forduló")
  })
})

describe("matchWinnerSide", () => {
  it("uses winnerId first", () => {
    expect(matchWinnerSide(m("a", "b", { winnerId: "b", status: "finished" }))).toBe(2)
  })

  it("falls back to legs for a finished match", () => {
    expect(
      matchWinnerSide(m("a", "b", { status: "finished", player1LegsWon: 4, player2LegsWon: 2 }))
    ).toBe(1)
  })

  it("has no winner for pending matches", () => {
    expect(matchWinnerSide(m("a", "b", { player1LegsWon: 1, player2LegsWon: 0 }))).toBeNull()
  })
})

describe("computePlayerBracketPath", () => {
  const rounds = [
    [m("a", "b", { status: "finished", winnerId: "a" }), m("c", "d", { status: "finished", winnerId: "d" })],
    [m("a", "d", { status: "finished", winnerId: "d" })],
  ]

  it("follows a player until the match they lost", () => {
    const path = computePlayerBracketPath(rounds, { playerId: "a", playerName: "a" })
    expect([...path.matchKeys]).toEqual(["0-0", "1-0"])
    expect([...path.connectorIds]).toEqual(["1-0-p1"])
  })

  it("uses the lower feeder connector for the second slot", () => {
    const path = computePlayerBracketPath(rounds, { playerId: "d", playerName: "d" })
    expect([...path.connectorIds]).toEqual(["1-0-p2"])
  })

  it("stops after an early loss", () => {
    const path = computePlayerBracketPath(rounds, { playerId: "b", playerName: "b" })
    expect([...path.matchKeys]).toEqual(["0-0"])
  })
})

describe("resolveBracketPanels", () => {
  it("orders panels main-first and drops empty ones", () => {
    const panels = resolveBracketPanels(
      {
        rounds: [],
        brackets: [
          { bracketId: "losers", label: "Vesztes ág", rounds: [{ round: 1, matches: [m("a", "b")] }] },
          { bracketId: "main", label: "Főág", rounds: [{ round: 1, matches: [m("c", "d")] }] },
          { bracketId: "side", label: "Üres", rounds: [{ round: 1, matches: [] }] },
        ],
      },
      "Egyenes kiesés"
    )
    expect(panels.map((p) => p.bracketId)).toEqual(["main", "losers"])
  })

  it("groups flat rounds by bracketId", () => {
    const panels = resolveBracketPanels(
      {
        rounds: [
          { round: 2, matches: [m("a", "b")] },
          { round: 1, matches: [m("a", "b"), m("c", "d")] },
        ],
      },
      "Egyenes kiesés"
    )
    expect(panels).toHaveLength(1)
    expect(panels[0]!.label).toBe("Egyenes kiesés")
    expect(panels[0]!.rounds.map((r) => r.round)).toEqual([1, 2])
  })
})
