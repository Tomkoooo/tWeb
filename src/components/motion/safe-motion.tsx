"use client"

import * as React from "react"
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionProps,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
} from "framer-motion"
import { cn } from "@/lib/utils"

type MotionInitial = MotionProps["initial"]

/** Returns `false` when the user prefers reduced motion so content stays visible on first paint. */
export function useSafeMotionInitial(initial: MotionInitial): false | MotionInitial {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return false
  return initial
}

const defaultRevealVisible: TargetAndTransition = { opacity: 1, y: 0 }

export type MotionRevealProps = Omit<HTMLMotionProps<"div">, "initial" | "animate"> & {
  children?: React.ReactNode
  visible?: TargetAndTransition | VariantLabels
  transition?: Transition
  once?: boolean
  margin?: string
}

/**
 * Fade/slide in when scrolled into view. Uses `initial={false}` so SSR and no-JS
 * users see content immediately (avoids black screen from opacity: 0 on the server).
 */
export function MotionReveal({
  children,
  className,
  visible = defaultRevealVisible,
  transition = { duration: 0.5, ease: "easeOut" },
  once = true,
  margin = "-50px",
  ...motionProps
}: MotionRevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <div className={cn(className)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={false}
      whileInView={visible}
      viewport={{ once, margin }}
      transition={transition}
      className={cn(className)}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

export type MotionRevealOptions = {
  visible?: TargetAndTransition
  transition?: Transition
  once?: boolean
  margin?: string
}

/** Spread onto `motion.*` for scroll reveals without SSR-hidden initial styles. */
export function motionRevealProps(options: MotionRevealOptions = {}): Pick<
  MotionProps,
  "initial" | "whileInView" | "viewport" | "transition"
> {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    return { initial: false }
  }
  return {
    initial: false,
    whileInView: options.visible ?? defaultRevealVisible,
    viewport: { once: options.once ?? true, margin: options.margin ?? "-50px" },
    transition: options.transition ?? { duration: 0.5, ease: "easeOut" },
  }
}

export type MotionNavbarProps = HTMLMotionProps<"header">

/** Fixed header without off-screen SSR initial state. */
export function MotionNavbar({ children, className, ...props }: MotionNavbarProps) {
  return (
    <motion.header initial={false} className={cn(className)} {...props}>
      {children}
    </motion.header>
  )
}
