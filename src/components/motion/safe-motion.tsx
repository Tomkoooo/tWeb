"use client"

import * as React from "react"
import {
  motion,
  useAnimation,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionProps,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
} from "framer-motion"
import { cn } from "@/lib/utils"

type MotionInitial = MotionProps["initial"]

const defaultRevealFrom: TargetAndTransition = { opacity: 0, y: 20 }
const defaultRevealTo: TargetAndTransition = { opacity: 1, y: 0 }

/**
 * True after hydration. Used to defer entrance animations (not for swapping DOM trees).
 */
export function useClientMotionReady(): boolean {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    setReady(true)
  }, [])
  return ready
}

/** Returns `false` until hydrated so SSR HTML never includes opacity:0. */
export function useSafeMotionInitial(initial: MotionInitial): false | MotionInitial {
  const reduceMotion = useReducedMotion()
  const ready = useClientMotionReady()
  if (reduceMotion || !ready) return false
  return initial
}

export type MotionRevealMode = "inView" | "mount"

export type MotionRevealAs = "div" | "h2" | "p" | "span"

export type MotionRevealProps = Omit<HTMLMotionProps<"div">, "initial" | "animate"> & {
  children?: React.ReactNode
  as?: MotionRevealAs
  from?: TargetAndTransition | VariantLabels
  to?: TargetAndTransition | VariantLabels
  transition?: Transition
  once?: boolean
  margin?: string
  mode?: MotionRevealMode
}

function staticTagFor(as: MotionRevealAs): "div" | "h2" | "p" | "span" {
  return as
}

/**
 * SSR-safe reveal. Always keeps the same motion element (no static→motion swap) so
 * children — especially images in Hero — are not remounted on iOS Safari.
 */
export function MotionReveal({
  children,
  className,
  as = "div",
  from = defaultRevealFrom,
  to = defaultRevealTo,
  transition = { duration: 0.5, ease: "easeOut" },
  once = true,
  margin = "-50px",
  mode = "inView",
  ...motionProps
}: MotionRevealProps) {
  const reduceMotion = useReducedMotion()
  const ready = useClientMotionReady()
  const controls = useAnimation()
  const MotionComponent = motion[as] as typeof motion.div
  const playedMount = React.useRef(false)

  React.useEffect(() => {
    if (!ready || reduceMotion || mode !== "mount" || playedMount.current) return
    playedMount.current = true
    const run = async () => {
      const target = to as TargetAndTransition
      await controls.set(from)
      await controls.start({ ...target, transition })
    }
    const id = requestAnimationFrame(() => {
      void run()
    })
    return () => cancelAnimationFrame(id)
  }, [ready, reduceMotion, mode, controls, from, to, transition])

  if (reduceMotion) {
    const StaticTag = staticTagFor(as)
    return <StaticTag className={cn(className)}>{children}</StaticTag>
  }

  if (mode === "mount") {
    return (
      <MotionComponent
        initial={false}
        animate={controls}
        className={cn(className)}
        {...motionProps}
      >
        {children}
      </MotionComponent>
    )
  }

  return (
    <MotionComponent
      initial={false}
      whileInView={to}
      viewport={{ once, margin }}
      transition={transition}
      className={cn(className)}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  )
}

export type MotionRevealOptions = {
  from?: TargetAndTransition
  to?: TargetAndTransition
  transition?: Transition
  once?: boolean
  margin?: string
  mode?: MotionRevealMode
}

export type MotionRevealHookResult =
  | { staticShell: true }
  | {
      staticShell: false
      initial: false
      whileInView?: TargetAndTransition | VariantLabels
      animate?: TargetAndTransition | VariantLabels
      viewport?: { once: boolean; margin: string }
      transition: Transition
    }

/** For existing `motion.*` nodes. */
export function useMotionRevealProps(
  from: TargetAndTransition = defaultRevealFrom,
  to: TargetAndTransition = defaultRevealTo,
  options: MotionRevealOptions = {}
): MotionRevealHookResult {
  const reduceMotion = useReducedMotion()
  const ready = useClientMotionReady()
  const mode = options.mode ?? "inView"
  const transition = options.transition ?? { duration: 0.5, ease: "easeOut" }

  if (reduceMotion || !ready) {
    return { staticShell: true }
  }

  if (mode === "mount") {
    return {
      staticShell: false,
      initial: false,
      animate: to,
      transition,
    }
  }

  return {
    staticShell: false,
    initial: false,
    whileInView: options.to ?? to,
    viewport: { once: options.once ?? true, margin: options.margin ?? "-50px" },
    transition,
  }
}

export type MotionNavbarProps = HTMLMotionProps<"header">

/**
 * Fixed header: one `motion.header` for the whole lifecycle (no remount on hydrate).
 * Entrance runs via controls after paint — avoids iOS reloading logo/session subtree.
 */
export function MotionNavbar({ children, className, ...props }: MotionNavbarProps) {
  const reduceMotion = useReducedMotion()
  const ready = useClientMotionReady()
  const controls = useAnimation()
  const played = React.useRef(false)

  React.useEffect(() => {
    if (!ready || reduceMotion || played.current) return
    played.current = true
    const id = requestAnimationFrame(() => {
      void (async () => {
        await controls.set({ y: -100 })
        await controls.start({ y: 0, transition: { duration: 0.5, ease: "easeOut" } })
      })()
    })
    return () => cancelAnimationFrame(id)
  }, [ready, reduceMotion, controls])

  if (reduceMotion) {
    return (
      <header className={cn(className)} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children as React.ReactNode}
      </header>
    )
  }

  return (
    <motion.header initial={false} animate={controls} className={cn(className)} {...props}>
      {children}
    </motion.header>
  )
}
