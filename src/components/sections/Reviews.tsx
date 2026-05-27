"use client"

import * as React from "react"
import { MotionReveal } from "@/components/motion/safe-motion"
import { Quote, Star } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import { EditableTextInline } from "@/features/homepage-cms/components/primitives/EditableTextInline"
import { FallbackImage } from "@/components/common/FallbackImage"

type ReviewItem = {
  id: string
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

export function Reviews({
  reviews = [],
  title,
  subtitle,
}: {
  reviews?: ReviewItem[]
  title?: string
  subtitle?: string
}) {
  const cms = useCmsEdit()
  if (reviews.length === 0) {
    return null
  }

  return (
    <section id="reviews" className="py-32 bg-background-dark border-t border-border/40 relative overflow-hidden">
      {/* Background glow shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <MotionReveal
            as="h2"
            className="text-4xl md:text-7xl font-heading font-black mb-6 text-foreground uppercase tracking-tighter"
          >
            {cms.enabled ? (
              <EditableTextInline blockType="testimonials" field="title" value={title ?? "LOREM REVIEWS"} className="text-4xl md:text-7xl font-heading font-black text-white uppercase tracking-tighter text-center" />
            ) : (
              title ?? "LOREM REVIEWS"
            )}
          </MotionReveal>
          <MotionReveal
            as="p"
            transition={{ delay: 0.1 }}
            className="text-neutral-400 text-xl max-w-2xl mx-auto leading-relaxed"
          >
            {cms.enabled ? (
              <EditableTextInline
                blockType="testimonials"
                field="subtitle"
                value={subtitle ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                className="text-neutral-400 text-xl max-w-2xl mx-auto leading-relaxed text-center"
              />
            ) : (
              subtitle ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            )}
          </MotionReveal>
        </div>

        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {reviews.map((review, idx) => (
              <CarouselItem key={review.id} className="p-4">
                <MotionReveal
                  from={{ opacity: 0, scale: 0.95 }}
                  to={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <div className="glass-card p-12 md:p-16 relative overflow-hidden h-full border-border group hover:border-primary-foreground/30 transition-all duration-500">
                    <Quote className="w-24 h-24 text-primary-foreground/10 absolute -top-4 -right-4 transition-transform group-hover:scale-110" />
                    
                    <div className="flex gap-1.5 mb-10">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? "fill-highlight text-highlight" : "text-white/10"}`}
                        />
                      ))}
                    </div>

                    <p className="text-foreground text-2xl md:text-3xl italic mb-14 relative z-10 font-medium leading-normal tracking-tight">
                      &ldquo;{review.content}&rdquo;
                    </p>

                    <div className="flex items-center gap-6 border-t border-border/40 pt-10">
                      <div className="relative w-16 h-16 rounded-none overflow-hidden border-2 border-primary-foreground/30">
                        <FallbackImage
                          src={review.avatar}
                          alt={review.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-foreground text-xl font-heading font-black tracking-wider uppercase mb-1">{review.name}</h4>
                        <p className="text-primary-foreground text-sm font-black uppercase tracking-[0.2em]">{review.role}</p>
                      </div>
                    </div>
                  </div>
                </MotionReveal>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-16 gap-6">
            <CarouselPrevious className="relative left-0 translate-y-0 h-16 w-16 bg-muted/40 border-border text-foreground hover:bg-primary hover:border-primary-foreground/40 rounded-none" />
            <CarouselNext className="relative right-0 translate-y-0 h-16 w-16 bg-muted/40 border-border text-foreground hover:bg-primary hover:border-primary-foreground/40 rounded-none" />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
