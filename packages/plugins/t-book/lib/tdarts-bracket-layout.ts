/**
 * Knockout bracket layout for the tDarts embed — a port of tdarts.hu's own
 * `knockout-bracket-layout.ts` / `knockout-bracket-path.ts` (tdarts_torunament
 * apps/web/src/features/tournaments/lib) so the WDF site draws the same tree:
 * absolutely positioned match cards, each later-round match centered between
 * its two feeder matches, joined by elbow connector lines.
 */

export type TDartsBracketMatch = {
  matchId?: string | null
  player1?: string | null
  player2?: string | null
  player1Name?: string | null
  player2Name?: string | null
  player1SeedNumber?: number | null
  player2SeedNumber?: number | null
  status?: "pending" | "ongoing" | "finished"
  player1LegsWon?: number | null
  player2LegsWon?: number | null
  winnerId?: string | null
  walkover?: boolean
  boardNumber?: number | null
}

export type TDartsBracketRound = { round: number; bracketId?: string; matches: TDartsBracketMatch[] }

export type TDartsBracketDto = {
  rounds: TDartsBracketRound[]
  brackets?: { bracketId: string; label: string; rounds: TDartsBracketRound[] }[]
  bronzeMatch?: TDartsBracketMatch | null
  eliminationTopology?: string
}

export type TDartsBracketPanel = { bracketId: string; label: string; rounds: TDartsBracketRound[] }

export type BracketDimensions = {
  cardWidth: number
  cardHeight: number
  columnGap: number
  rowGap: number
  compact: boolean
}

export const BRACKET_DIMENSIONS: BracketDimensions = {
  cardWidth: 232,
  cardHeight: 104,
  columnGap: 56,
  rowGap: 20,
  compact: false,
}

export const BRACKET_COMPACT_DIMENSIONS: BracketDimensions = {
  cardWidth: 200,
  cardHeight: 96,
  columnGap: 40,
  rowGap: 12,
  compact: true,
}

export function resolveBracketDimensions(firstRoundMatchCount: number, roundCount: number): BracketDimensions {
  return firstRoundMatchCount >= 16 || roundCount >= 5 ? BRACKET_COMPACT_DIMENSIONS : BRACKET_DIMENSIONS
}

export type BracketLayoutMatch<T> = {
  data: T
  x: number
  y: number
  center: number
  roundIndex: number
  matchIndex: number
}

export type BracketConnector = { id: string; path: string }

export type BracketLayoutResult<T> = {
  width: number
  height: number
  dimensions: BracketDimensions
  matches: BracketLayoutMatch<T>[]
  connectors: BracketConnector[]
}

const BRACKET_SORT_ORDER: Record<string, number> = {
  main: 0,
  losers: 1,
  side: 2,
  consolation: 3,
  repechage: 4,
  grand_final: 5,
}

/** Split the DTO into ordered panels (main first), like tdarts' `resolveKnockoutBracketPanels`. */
export function resolveBracketPanels(bracket: TDartsBracketDto, mainLabel: string): TDartsBracketPanel[] {
  const order = (id: string) => BRACKET_SORT_ORDER[id] ?? 99
  if (bracket.brackets && bracket.brackets.length > 0) {
    return [...bracket.brackets]
      .sort((a, b) => order(a.bracketId) - order(b.bracketId))
      .map((b) => ({
        bracketId: b.bracketId,
        label: b.label || (b.bracketId === "main" ? mainLabel : b.bracketId),
        rounds: [...b.rounds].sort((x, y) => x.round - y.round),
      }))
      .filter((p) => p.rounds.some((r) => r.matches.length > 0))
  }

  const byId = new Map<string, TDartsBracketRound[]>()
  for (const round of bracket.rounds ?? []) {
    const id = round.bracketId ?? "main"
    byId.set(id, [...(byId.get(id) ?? []), round])
  }
  return [...byId.entries()]
    .sort(([a], [b]) => order(a) - order(b))
    .map(([bracketId, rounds]) => ({
      bracketId,
      label: bracketId === "main" ? mainLabel : bracketId,
      rounds: [...rounds].sort((a, b) => a.round - b.round),
    }))
    .filter((p) => p.rounds.some((r) => r.matches.length > 0))
}

/** True when every round has exactly half (rounded up) the matches of the previous one. */
export function isBinaryTreeRounds<T>(rounds: T[][]): boolean {
  const filled = rounds.filter((r) => r.length > 0)
  for (let i = 1; i < filled.length; i++) {
    if (filled[i]!.length !== Math.ceil(filled[i - 1]!.length / 2)) return false
  }
  return filled.length > 0
}

export function buildBracketConnectorPath(
  startX: number,
  startY: number,
  midX: number,
  endX: number,
  endY: number
): string {
  return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`
}

/** Tree layout: each later-round match sits between its two feeder matches. */
export function computeBracketLayout<T>(
  rounds: T[][],
  dimensions: BracketDimensions = resolveBracketDimensions(rounds[0]?.length ?? 0, rounds.length)
): BracketLayoutResult<T> | null {
  const sanitized = rounds.filter((round) => round.length > 0)
  if (sanitized.length === 0) return null

  const { cardWidth, cardHeight, columnGap, rowGap } = dimensions
  const positioned: BracketLayoutMatch<T>[][] = []

  sanitized.forEach((round, roundIndex) => {
    positioned[roundIndex] = []
    round.forEach((match, matchIndex) => {
      let y: number
      if (roundIndex === 0) {
        y = matchIndex * (cardHeight + rowGap)
      } else {
        const parentRound = positioned[roundIndex - 1]!
        const parent1 = parentRound[matchIndex * 2]
        const parent2 = parentRound[matchIndex * 2 + 1]
        if (parent1 && parent2) {
          y = (parent1.center + parent2.center) / 2 - cardHeight / 2
        } else if (parent1 || parent2) {
          y = (parent1 ?? parent2)!.center - cardHeight / 2
        } else {
          y = matchIndex * (cardHeight + rowGap)
        }
      }
      const x = roundIndex * (cardWidth + columnGap)
      positioned[roundIndex]!.push({ data: match, x, y, center: y + cardHeight / 2, roundIndex, matchIndex })
    })
  })

  const flat = positioned.flat()
  const height = flat.reduce((max, item) => Math.max(max, item.y + cardHeight), cardHeight)
  const width = sanitized.length * cardWidth + (sanitized.length - 1) * columnGap
  const connectors: BracketConnector[] = []

  positioned.forEach((roundMatches, roundIndex) => {
    if (roundIndex === 0) return
    const previous = positioned[roundIndex - 1]!
    roundMatches.forEach((child, matchIndex) => {
      const midX = child.x - columnGap / 2
      const feeders: [BracketLayoutMatch<T> | undefined, "p1" | "p2"][] = [
        [previous[matchIndex * 2], "p1"],
        [previous[matchIndex * 2 + 1], "p2"],
      ]
      for (const [parent, slot] of feeders) {
        if (!parent) continue
        connectors.push({
          id: `${roundIndex}-${matchIndex}-${slot}`,
          path: buildBracketConnectorPath(parent.x + cardWidth, parent.center, midX, child.x, child.center),
        })
      }
    })
  })

  return { width, height, dimensions, matches: flat, connectors }
}

/**
 * Column layout for brackets that are not a strict binary tree (losers / side
 * brackets): rounds are stacked and vertically centered; a match links to its
 * same-index feeder when the counts don't halve.
 */
export function computeColumnBracketLayout<T>(
  rounds: T[][],
  dimensions: BracketDimensions = resolveBracketDimensions(rounds[0]?.length ?? 0, rounds.length)
): BracketLayoutResult<T> | null {
  const sanitized = rounds.filter((round) => round.length > 0)
  if (sanitized.length === 0) return null

  const { cardWidth, cardHeight, columnGap, rowGap } = dimensions
  const tallest = Math.max(...sanitized.map((r) => r.length))
  const anchorHeight = tallest * (cardHeight + rowGap) - rowGap
  const positioned: BracketLayoutMatch<T>[][] = []

  sanitized.forEach((round, roundIndex) => {
    positioned[roundIndex] = []
    const colHeight = round.length * (cardHeight + rowGap) - rowGap
    const yOffset = Math.max(0, (anchorHeight - colHeight) / 2)
    round.forEach((match, matchIndex) => {
      const y = yOffset + matchIndex * (cardHeight + rowGap)
      const x = roundIndex * (cardWidth + columnGap)
      positioned[roundIndex]!.push({ data: match, x, y, center: y + cardHeight / 2, roundIndex, matchIndex })
    })
  })

  const flat = positioned.flat()
  const height = flat.reduce((max, item) => Math.max(max, item.y + cardHeight), cardHeight)
  const width = sanitized.length * cardWidth + (sanitized.length - 1) * columnGap
  const connectors: BracketConnector[] = []

  positioned.forEach((roundMatches, roundIndex) => {
    if (roundIndex === 0) return
    const previous = positioned[roundIndex - 1]!
    const halves = roundMatches.length === Math.ceil(previous.length / 2)
    roundMatches.forEach((child, matchIndex) => {
      const midX = child.x - columnGap / 2
      const feeders: [BracketLayoutMatch<T> | undefined, string][] = halves
        ? [
            [previous[matchIndex * 2], "p1"],
            [previous[matchIndex * 2 + 1], "p2"],
          ]
        : [[previous[matchIndex], "parallel"]]
      for (const [parent, slot] of feeders) {
        if (!parent) continue
        connectors.push({
          id: `${roundIndex}-${matchIndex}-${slot}`,
          path: buildBracketConnectorPath(parent.x + cardWidth, parent.center, midX, child.x, child.center),
        })
      }
    })
  })

  return { width, height, dimensions, matches: flat, connectors }
}

/** Placeholder slot names the API uses for not-yet-known / bye slots. */
export function isPlaceholderPlayerName(name: string | null | undefined): boolean {
  const n = (name ?? "").trim()
  return n === "" || n === "TBD" || n === "BYE"
}

/** Which side won: by `winnerId`, else (finished, non-walkover) by legs. */
export function matchWinnerSide(match: TDartsBracketMatch): 1 | 2 | null {
  if (match.winnerId) {
    if (match.player1 && String(match.winnerId) === String(match.player1)) return 1
    if (match.player2 && String(match.winnerId) === String(match.player2)) return 2
  }
  if (match.status === "finished" && !match.walkover) {
    const a = match.player1LegsWon ?? null
    const b = match.player2LegsWon ?? null
    if (a != null && b != null && a !== b) return a > b ? 1 : 2
  }
  return null
}

export type BracketRoundLabelCopy = {
  final: string
  semiFinal: string
  quarterFinal: string
  roundOf: (n: number) => string
  roundN: (n: number) => string
}

/**
 * Round heading. Tree panels count back from the final (Döntő, Elődöntő,
 * Negyeddöntő, Legjobb 16…); other panels just number their rounds.
 */
export function bracketRoundLabel(
  roundIndex: number,
  roundCount: number,
  isTree: boolean,
  copy: BracketRoundLabelCopy
): string {
  if (!isTree) return copy.roundN(roundIndex + 1)
  const fromEnd = roundCount - 1 - roundIndex
  if (fromEnd === 0) return copy.final
  if (fromEnd === 1) return copy.semiFinal
  if (fromEnd === 2) return copy.quarterFinal
  return copy.roundOf(Math.pow(2, fromEnd + 1))
}

export type BracketPathTarget = { playerId: string | null; playerName: string }

function slotMatches(match: TDartsBracketMatch, slot: 1 | 2, target: BracketPathTarget): boolean {
  const id = slot === 1 ? match.player1 : match.player2
  const name = slot === 1 ? match.player1Name : match.player2Name
  if (target.playerId && id) return String(id) === String(target.playerId)
  return !isPlaceholderPlayerName(target.playerName) && name === target.playerName
}

export function playerInBracketMatch(match: TDartsBracketMatch, target: BracketPathTarget): boolean {
  return slotMatches(match, 1, target) || slotMatches(match, 2, target)
}

/**
 * A player's run through a tree panel: the matches they played and the
 * connectors between them, stopping after the match they lost.
 */
export function computePlayerBracketPath(
  rounds: TDartsBracketMatch[][],
  target: BracketPathTarget
): { matchKeys: Set<string>; connectorIds: Set<string> } {
  const matchKeys = new Set<string>()
  const connectorIds = new Set<string>()
  let previousMatchIndex: number | null = null

  for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
    const round = rounds[roundIndex] ?? []
    const matchIndex = round.findIndex((m) => playerInBracketMatch(m, target))
    if (matchIndex < 0) continue
    const match = round[matchIndex]!
    matchKeys.add(`${roundIndex}-${matchIndex}`)
    if (previousMatchIndex != null) {
      connectorIds.add(`${roundIndex}-${matchIndex}-${previousMatchIndex % 2 === 0 ? "p1" : "p2"}`)
    }
    previousMatchIndex = matchIndex
    const winner = matchWinnerSide(match)
    if (match.status === "finished" && winner != null && !slotMatches(match, winner, target)) break
  }
  return { matchKeys, connectorIds }
}
