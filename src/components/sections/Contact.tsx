"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import { EditableTextInline } from "@/features/homepage-cms/components/primitives/EditableTextInline"
import { hasContactFieldValue } from "@/lib/contact-display"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-none border border-border bg-surface px-3 py-4 text-sm text-foreground outline-none focus:border-primary-foreground/50 placeholder:text-muted-foreground transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
})

interface ContactProps {
  email?: string
  phone?: string
  address?: string
  title?: string
  description?: string
  sendButtonLabel?: string
  nameLabel?: string
  emailLabel?: string
  messageLabel?: string
}

export function Contact({ email, phone, address, title, description, sendButtonLabel, nameLabel, emailLabel, messageLabel }: ContactProps) {
  const cms = useCmsEdit()
  const displayEmail = email?.trim() ?? ""
  const displayPhone = phone?.trim() ?? ""
  const displayAddress = address?.trim() ?? ""
  const showPhone = cms.enabled || hasContactFieldValue(displayPhone)
  const showEmail = cms.enabled || hasContactFieldValue(displayEmail)
  const showAddress = cms.enabled || hasContactFieldValue(displayAddress)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (cms.enabled) return
    console.log(values)
    alert("Message sent. We will get back to you soon.")
    form.reset()
  }

  return (
    <section id="contact" className="py-32 bg-background-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {cms.enabled ? (
              <div className="space-y-3">
                <EditableTextInline blockType="contact" field="title" value={title ?? "LOREM IPSUM CONTACT"} className="text-5xl md:text-7xl font-heading font-black text-foreground" />
                <EditableTextInline
                  blockType="contact"
                  field="description"
                  value={description ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                  multiline
                  className="text-neutral-400 text-xl max-w-xl leading-relaxed"
                />
              </div>
            ) : (
              <>
                <h2 className="text-5xl md:text-7xl font-heading font-black mb-10 text-foreground">{title ?? "LOREM IPSUM CONTACT"}</h2>
                <p className="text-neutral-400 text-xl mb-16 max-w-xl leading-relaxed">
                  {description ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                </p>
              </>
            )}

            <div className="space-y-10">
              {showPhone ? (
                <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 bg-muted/40 flex items-center justify-center border border-border group-hover:border-primary-foreground/50 transition-all">
                    <Phone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-heading font-bold uppercase tracking-[0.2em] text-sm mb-1">Phone</h4>
                    {cms.enabled ? (
                      <EditableTextInline blockType="contact" field="phone" value={displayPhone} className="text-neutral-300 text-lg" placeholder="Telefonszám" />
                    ) : (
                      <p className="text-neutral-300 text-lg">{displayPhone}</p>
                    )}
                  </div>
                </div>
              ) : null}

              {showEmail ? (
                <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 bg-muted/40 flex items-center justify-center border border-border group-hover:border-primary-foreground/50 transition-all">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-heading font-bold uppercase tracking-[0.2em] text-sm mb-1">Email</h4>
                    {cms.enabled ? (
                      <EditableTextInline blockType="contact" field="email" value={displayEmail} className="text-neutral-300 text-lg" placeholder="E-mail" />
                    ) : (
                      <p className="text-neutral-300 text-lg">{displayEmail}</p>
                    )}
                  </div>
                </div>
              ) : null}

              {showAddress ? (
                <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 bg-muted/40 flex items-center justify-center border border-border group-hover:border-primary-foreground/50 transition-all">
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-heading font-bold uppercase tracking-[0.2em] text-sm mb-1">Address</h4>
                    {cms.enabled ? (
                      <EditableTextInline blockType="contact" field="address" value={displayAddress} className="text-neutral-300 text-lg" placeholder="Cím" />
                    ) : (
                      <p className="text-neutral-300 text-lg">{displayAddress}</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card p-10 md:p-14 relative border-border/40">
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-foreground/35" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-foreground/35" />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        {cms.enabled ? (
                          <EditableTextInline blockType="contact" field="nameLabel" value={nameLabel ?? "Full Name"} className="text-foreground uppercase tracking-[0.2em] text-xs font-black" />
                        ) : (
                          <FormLabel className="text-foreground uppercase tracking-[0.2em] text-xs font-black">{nameLabel ?? "Full Name"}</FormLabel>
                        )}
                        <FormControl>
                          <Input 
                            placeholder="Lorem Ipsum" 
                            {...field} 
                            className="h-14 bg-surface border-border rounded-none focus-visible:ring-primary-foreground/40 text-foreground placeholder:text-muted-foreground" 
                          />
                        </FormControl>
                        <FormMessage className="text-primary-foreground text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        {cms.enabled ? (
                          <EditableTextInline blockType="contact" field="emailLabel" value={emailLabel ?? "Email Address"} className="text-foreground uppercase tracking-[0.2em] text-xs font-black" />
                        ) : (
                          <FormLabel className="text-foreground uppercase tracking-[0.2em] text-xs font-black">{emailLabel ?? "Email Address"}</FormLabel>
                        )}
                        <FormControl>
                          <Input 
                            placeholder="name@example.com" 
                            {...field} 
                            className="h-14 bg-surface border-border rounded-none focus-visible:ring-primary-foreground/40 text-foreground placeholder:text-muted-foreground" 
                          />
                        </FormControl>
                        <FormMessage className="text-primary-foreground text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        {cms.enabled ? (
                          <EditableTextInline blockType="contact" field="messageLabel" value={messageLabel ?? "Message"} className="text-foreground uppercase tracking-[0.2em] text-xs font-black" />
                        ) : (
                          <FormLabel className="text-foreground uppercase tracking-[0.2em] text-xs font-black">{messageLabel ?? "Message"}</FormLabel>
                        )}
                        <FormControl>
                          <Textarea 
                            placeholder="Lorem ipsum dolor sit amet..." 
                            {...field} 
                            className="min-h-[160px] bg-surface border-border rounded-none focus-visible:ring-primary-foreground/40" 
                          />
                        </FormControl>
                        <FormMessage className="text-primary-foreground text-xs" />
                      </FormItem>
                    )}
                  />
                  {cms.enabled ? (
                    <Button type="button" className="w-full bg-primary hover:bg-primary text-white h-16 px-12 text-xl btn-krausz border-none">
                      <Send className="w-5 h-5 mr-3" />
                      <EditableTextInline blockType="contact" field="sendButtonLabel" value={sendButtonLabel ?? "SEND MESSAGE"} className="text-white text-center" />
                    </Button>
                  ) : (
                    <Button type="submit" className="w-full bg-primary hover:bg-primary text-white h-16 px-12 text-xl btn-krausz border-none">
                      <Send className="w-5 h-5 mr-3" />
                      {sendButtonLabel ?? "SEND MESSAGE"}
                    </Button>
                  )}
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
