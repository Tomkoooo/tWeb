"use client"

import { useMemo, useState } from "react"
import { Minus, Plus, RotateCcw, Trophy, X } from "lucide-react"
import { cn } from "@wse/core/lib/utils"
import {
  bracketRoundLabel,
  computeBracketLayout,
  computeColumnBracketLayout,
  computePlayerBracketPath,
  isBinaryTreeRounds,
  isPlaceholderPlayerName,
  matchWinnerSide,
  playerInBracketMatch,
  resolveBracketDimensions,
  type BracketPathTarget,
  type BracketRoundLabelCopy,
  type TDartsBracketMatch,
  type TDartsBracketPanel,
} from "../lib/tdarts-bracket-layout"

export type TDartsBracketCopy = {
  rounds: BracketRoundLabelCopy
  bronzeMatch: string
  tbd: string
  bye: string
  board: (n: number) => string
  walkover: string
  pathHint: string
  pathActive: (name: string) => string
  clearPath: string
  zoomIn: string
  zoomOut: string
  zoomReset: string
  statusLabels: Record<string, string>
}

const ZOOM_STEPS = [0.5, 0.65, 0.8, 1] as const
const HEADER_HEIGHT = 32
const BRONZE_GAP = 40

const STATUS_BADGE_CLASSES: Record<string, string> = {
  ongoing: "border-destructive/30 bg-destructive/10 text-destructive animate-pulse",
  finished: "border-border bg-muted text-muted-foreground",
  pending: "border-primary/30 bg-primary/10 text-primary",
}

function displayName(name: string | null | undefined, copy: TDartsBracketCopy): string {
  const n = (name ?? "").trim()
  if (n === "BYE") return copy.bye
  if (isPlaceholderPlayerName(n)) return copy.tbd
  return n
}

export function TDartsBracketPanels({
  panels,
  bronzeMatch,
  copy,
}: {
  panels: TDartsBracketPanel[]
  bronzeMatch?: TDartsBracketMatch | null
  copy: TDartsBracketCopy
}) {
  const [zoomIndex, setZoomIndex] = useState(ZOOM_STEPS.length - 1)
  const [target, setTarget] = useState<BracketPathTarget | null>(null)
  const zoom = ZOOM_STEPS[zoomIndex]!

  const toggleTarget = (next: BracketPathTarget) => {
    setTarget((current) =>
      current &&
      (current.playerId && next.playerId
        ? current.playerId === next.playerId
        : current.playerName === next.playerName)
        ? null
        : next
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {target ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {copy.pathActive(target.playerName)}
            <button
              type="button"
              onClick={() => setTarget(null)}
              aria-label={copy.clearPath}
              className="rounded-full p-0.5 hover:bg-primary/15"
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
        ) : (
          <p className="text-xs text-muted-foreground">{copy.pathHint}</p>
        )}
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/50 p-0.5">
          <ZoomButton
            label={copy.zoomOut}
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
          >
            <Minus className="size-3.5" aria-hidden />
          </ZoomButton>
          <span className="w-10 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <ZoomButton
            label={copy.zoomIn}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
          >
            <Plus className="size-3.5" aria-hidden />
          </ZoomButton>
          <ZoomButton
            label={copy.zoomReset}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            onClick={() => setZoomIndex(ZOOM_STEPS.length - 1)}
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </ZoomButton>
        </div>
      </div>

      {panels.map((panel, panelIndex) => (
        <div key={panel.bracketId} className="space-y-2">
          {panels.length > 1 ? <h3 className="text-sm font-semibold text-foreground">{panel.label}</h3> : null}
          <BracketPanelDiagram
            panel={panel}
            bronzeMatch={panelIndex === 0 ? bronzeMatch : null}
            copy={copy}
            zoom={zoom}
            target={target}
            onPlayerClick={toggleTarget}
          />
        </div>
      ))}
    </div>
  )
}

function ZoomButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function BracketPanelDiagram({
  panel,
  bronzeMatch,
  copy,
  zoom,
  target,
  onPlayerClick,
}: {
  panel: TDartsBracketPanel
  bronzeMatch?: TDartsBracketMatch | null
  copy: TDartsBracketCopy
  zoom: number
  target: BracketPathTarget | null
  onPlayerClick: (target: BracketPathTarget) => void
}) {
  const rounds = useMemo(
    () => panel.rounds.map((r) => r.matches).filter((m) => m.length > 0),
    [panel.rounds]
  )
  const isTree = useMemo(() => isBinaryTreeRounds(rounds), [rounds])
  const layout = useMemo(() => {
    const dims = resolveBracketDimensions(rounds[0]?.length ?? 0, rounds.length)
    return isTree ? computeBracketLayout(rounds, dims) : computeColumnBracketLayout(rounds, dims)
  }, [isTree, rounds])

  const path = useMemo(() => {
    if (!target) return null
    if (isTree) return computePlayerBracketPath(rounds, target)
    // Non-tree panels: just highlight the player's matches, no connector path.
    const matchKeys = new Set<string>()
    rounds.forEach((round, ri) =>
      round.forEach((m, mi) => {
        if (playerInBracketMatch(m, target)) matchKeys.add(`${ri}-${mi}`)
      })
    )
    return { matchKeys, connectorIds: new Set<string>() }
  }, [isTree, rounds, target])

  if (!layout) return null

  const { cardWidth, cardHeight } = layout.dimensions
  const finalItem = layout.matches.filter((m) => m.roundIndex === rounds.length - 1)[0]
  const bronzeX = finalItem?.x ?? 0
  const bronzeY = (finalItem ? finalItem.y + cardHeight : layout.height) + BRONZE_GAP
  const contentHeight = bronzeMatch ? Math.max(layout.height, bronzeY + cardHeight) : layout.height
  const totalHeight = HEADER_HEIGHT + contentHeight
  const bronzeHighlighted = Boolean(target && bronzeMatch && playerInBracketMatch(bronzeMatch, target))

  return (
    <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-border/60 bg-background/40 p-3 sm:p-4">
      <div style={{ width: layout.width * zoom, height: totalHeight * zoom }}>
        <div
          className="relative origin-top-left"
          style={{ width: layout.width, height: totalHeight, transform: zoom === 1 ? undefined : `scale(${zoom})` }}
        >
          {rounds.map((_, roundIndex) => (
            <div
              key={roundIndex}
              className="absolute top-0 flex items-center justify-center"
              style={{ left: roundIndex * (cardWidth + layout.dimensions.columnGap), width: cardWidth, height: 20 }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {bracketRoundLabel(roundIndex, rounds.length, isTree, copy.rounds)}
              </span>
            </div>
          ))}

          <div className="absolute inset-x-0" style={{ top: HEADER_HEIGHT, height: contentHeight }}>
            <svg
              className="pointer-events-none absolute inset-0 text-border"
              width={layout.width}
              height={layout.height}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              aria-hidden
            >
              {layout.connectors.map((connector) => {
                const active = path?.connectorIds.has(connector.id) ?? false
                return (
                  <path
                    key={connector.id}
                    d={connector.path}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={active ? 3 : 2}
                    strokeLinejoin="round"
                    className={cn(active && "text-primary")}
                    opacity={path && !active ? 0.35 : 1}
                  />
                )
              })}
            </svg>

            {layout.matches.map((item) => {
              const key = `${item.roundIndex}-${item.matchIndex}`
              const highlighted = path?.matchKeys.has(key) ?? false
              return (
                <div key={key} className="absolute" style={{ left: item.x, top: item.y }}>
                  <BracketMatchCard
                    match={item.data}
                    width={cardWidth}
                    height={cardHeight}
                    copy={copy}
                    highlighted={highlighted}
                    dimmed={Boolean(path) && !highlighted}
                    target={target}
                    onPlayerClick={onPlayerClick}
                  />
                </div>
              )
            })}

            {bronzeMatch ? (
              <>
                <div
                  className="absolute flex items-center justify-center"
                  style={{ left: bronzeX, top: bronzeY - 24, width: cardWidth, height: 20 }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {copy.bronzeMatch}
                  </span>
                </div>
                <div className="absolute" style={{ left: bronzeX, top: bronzeY }}>
                  <BracketMatchCard
                    match={bronzeMatch}
                    width={cardWidth}
                    height={cardHeight}
                    copy={copy}
                    highlighted={bronzeHighlighted}
                    dimmed={Boolean(path) && !bronzeHighlighted}
                    target={target}
                    onPlayerClick={onPlayerClick}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function BracketMatchCard({
  match,
  width,
  height,
  copy,
  highlighted,
  dimmed,
  target,
  onPlayerClick,
}: {
  match: TDartsBracketMatch
  width: number
  height: number
  copy: TDartsBracketCopy
  highlighted: boolean
  dimmed: boolean
  target: BracketPathTarget | null
  onPlayerClick: (target: BracketPathTarget) => void
}) {
  const winner = matchWinnerSide(match)
  const hasScore = match.player1LegsWon != null && match.player2LegsWon != null && match.status !== "pending"
  const score = (legs: number | null | undefined, won: boolean) =>
    match.walkover ? (won ? copy.walkover : "–") : hasScore ? String(legs ?? 0) : "–"
  const status = match.status ?? "pending"

  return (
    <div
      className={cn(
        "flex flex-col justify-between overflow-hidden rounded-lg border bg-surface p-1.5 shadow-sm transition-opacity",
        highlighted ? "border-primary ring-1 ring-primary" : "border-border/70",
        status === "ongoing" && !highlighted && "border-destructive/50",
        dimmed && "opacity-35"
      )}
      style={{ width, height }}
    >
      <div className="space-y-1">
        <PlayerRow
          name={displayName(match.player1Name, copy)}
          rawName={match.player1Name}
          playerId={match.player1 ?? null}
          seed={match.player1SeedNumber}
          score={score(match.player1LegsWon, winner === 1)}
          isWinner={winner === 1}
          isLoser={winner === 2}
          inPath={Boolean(target && isSlotTarget(match.player1 ?? null, match.player1Name, target))}
          onPlayerClick={onPlayerClick}
        />
        <PlayerRow
          name={displayName(match.player2Name, copy)}
          rawName={match.player2Name}
          playerId={match.player2 ?? null}
          seed={match.player2SeedNumber}
          score={score(match.player2LegsWon, winner === 2)}
          isWinner={winner === 2}
          isLoser={winner === 1}
          inPath={Boolean(target && isSlotTarget(match.player2 ?? null, match.player2Name, target))}
          onPlayerClick={onPlayerClick}
        />
      </div>
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="truncate text-[10px] font-medium text-muted-foreground">
          {match.boardNumber != null ? copy.board(match.boardNumber) : ""}
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase leading-tight tracking-wide",
            STATUS_BADGE_CLASSES[status] ?? STATUS_BADGE_CLASSES.pending
          )}
        >
          {copy.statusLabels[status] ?? status}
        </span>
      </div>
    </div>
  )
}

function isSlotTarget(id: string | null, name: string | null | undefined, target: BracketPathTarget): boolean {
  if (target.playerId && id) return String(id) === String(target.playerId)
  return !isPlaceholderPlayerName(name) && name === target.playerName
}

function PlayerRow({
  name,
  rawName,
  playerId,
  seed,
  score,
  isWinner,
  isLoser,
  inPath,
  onPlayerClick,
}: {
  name: string
  rawName: string | null | undefined
  playerId: string | null
  seed?: number | null
  score: string
  isWinner: boolean
  isLoser: boolean
  inPath: boolean
  onPlayerClick: (target: BracketPathTarget) => void
}) {
  const placeholder = isPlaceholderPlayerName(rawName)
  return (
    <div
      className={cn(
        "flex h-7 items-center justify-between gap-2 rounded-md px-1.5",
        isWinner ? "bg-primary/10" : "bg-muted/40",
        inPath && "ring-1 ring-inset ring-primary/50"
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
        {isWinner ? <Trophy className="size-3 shrink-0 text-amber-500" aria-hidden /> : null}
        {placeholder ? (
          <span className="truncate text-xs italic text-muted-foreground">{name}</span>
        ) : (
          <button
            type="button"
            title={name}
            onClick={() => onPlayerClick({ playerId, playerName: rawName ?? name })}
            className={cn(
              "min-w-0 truncate text-left text-xs hover:text-primary hover:underline",
              isWinner ? "font-semibold text-foreground" : isLoser ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {name}
          </button>
        )}
        {seed != null && !placeholder ? (
          <span className="shrink-0 text-[10px] text-muted-foreground">({seed})</span>
        ) : null}
      </div>
      <span
        className={cn(
          "shrink-0 font-mono text-sm tabular-nums",
          isWinner ? "font-bold text-primary" : "text-muted-foreground"
        )}
      >
        {score}
      </span>
    </div>
  )
}
