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

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-none border border-neutral-800 bg-neutral-900/50 px-3 py-4 text-sm text-white outline-none focus:border-[#FF5500] placeholder:text-neutral-600 transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

const formSchema = z.object({
  name: z.string().min(2, { message: "A név legalább 2 karakter hosszú legyen." }),
  email: z.string().email({ message: "Érvénytelen e-mail cím." }),
  message: z.string().min(10, { message: "Az üzenet legalább 10 karakter hosszú legyen." }),
})

interface ContactProps {
  email?: string
  phone?: string
  address?: string
}

export function Contact({ email, phone, address }: ContactProps) {
  const displayEmail = email || "iroda@krausz-mester.hu"
  const displayPhone = phone || "+36 1 234 5678"
  const displayAddress = address || "123 Ipari Út, Mesterváros, Magyarország"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    alert("Üzenet elküldve! Munkatársunk hamarosan keresni fog.")
    form.reset()
  }

  return (
    <section id="contact" className="py-32 bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-heading font-black mb-10 text-white">
              LÉPJ VELÜNK <br />
              <span className="text-[#FF5500]">KAPCSOLATBA</span>
            </h2>
            <p className="text-neutral-400 text-xl mb-16 max-w-xl leading-relaxed">
              Kérdésed van a szerszámokkal kapcsolatban? Egyedi projekthez keresel megoldást? Szakértő csapatunk készen áll a segítségre.
            </p>

            <div className="space-y-10">
              <div className="flex items-center gap-8 group">
                <div className="w-16 h-16 bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#FF5500]/50 transition-all">
                  <Phone className="w-6 h-6 text-[#FF5500]" />
                </div>
                <div>
                  <h4 className="text-white font-heading font-bold uppercase tracking-[0.2em] text-sm mb-1">Telefonszám</h4>
                  <p className="text-neutral-300 text-lg">{displayPhone}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 group">
                <div className="w-16 h-16 bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#FF5500]/50 transition-all">
                  <Mail className="w-6 h-6 text-[#FF5500]" />
                </div>
                <div>
                  <h4 className="text-white font-heading font-bold uppercase tracking-[0.2em] text-sm mb-1">E-mail</h4>
                  <p className="text-neutral-300 text-lg">{displayEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 group">
                <div className="w-16 h-16 bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#FF5500]/50 transition-all">
                  <MapPin className="w-6 h-6 text-[#FF5500]" />
                </div>
                <div>
                  <h4 className="text-white font-heading font-bold uppercase tracking-[0.2em] text-sm mb-1">Helyszín</h4>
                  <p className="text-neutral-300 text-lg">{displayAddress}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card p-10 md:p-14 relative border-white/5">
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FF5500]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FF5500]" />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white uppercase tracking-[0.2em] text-xs font-black">Teljes Név</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Mester Gábor" 
                            {...field} 
                            className="h-14 bg-white/5 border-neutral-800 rounded-none focus-visible:ring-[#FF5500] text-white placeholder:text-neutral-600" 
                          />
                        </FormControl>
                        <FormMessage className="text-[#FF5500] text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white uppercase tracking-[0.2em] text-xs font-black">E-mail Cím</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="gabor@mester.hu" 
                            {...field} 
                            className="h-14 bg-white/5 border-neutral-800 rounded-none focus-visible:ring-[#FF5500] text-white placeholder:text-neutral-600" 
                          />
                        </FormControl>
                        <FormMessage className="text-[#FF5500] text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white uppercase tracking-[0.2em] text-xs font-black">Üzenet</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Írd meg, miben segíthetünk..." 
                            {...field} 
                            className="min-h-[160px] bg-white/5 border-neutral-800 rounded-none focus-visible:ring-[#FF5500]" 
                          />
                        </FormControl>
                        <FormMessage className="text-[#FF5500] text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-[#FF5500] hover:bg-[#FF7722] text-white h-16 px-12 text-xl btn-krausz border-none"
                  >
                    <Send className="w-5 h-5 mr-3" />
                    ÜZENET KÜLDÉSE
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
