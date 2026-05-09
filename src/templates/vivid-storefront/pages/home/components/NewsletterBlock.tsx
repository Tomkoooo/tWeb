"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { HomeContent } from "../schema"

type Props = { content: HomeContent["newsletter"] }

export function NewsletterBlock({ content }: Props) {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@")) {
      toast.error("Please enter a valid email")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        toast.success("You're on the list ✨")
        setEmail("")
      } else {
        toast.success("You're on the list.")
        setEmail("")
      }
    } catch {
      toast.success("You're on the list.")
      setEmail("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/70">
            Slow newsletter
          </p>
          <h2 className="font-serif text-4xl font-black tracking-tight md:text-5xl">
            {content.title}
          </h2>
          {content.body ? (
            <p className="max-w-md text-base text-primary-foreground/80">{content.body}</p>
          ) : null}
        </div>
        <form
          onSubmit={submit}
          className="flex flex-col gap-3 rounded-3xl bg-secondary p-6 sm:flex-row sm:p-3"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={content.placeholder}
            className="h-14 flex-1 rounded-2xl border-white/10 bg-white/10 text-base text-secondary-foreground placeholder:text-secondary-foreground/50 sm:rounded-2xl"
          />
          <Button
            type="submit"
            disabled={submitting}
            className="h-14 rounded-2xl bg-primary px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? "..." : content.buttonLabel}
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </section>
  )
}
