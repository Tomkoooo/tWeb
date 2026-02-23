"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Check, 
  ChevronRight, 
  ArrowLeft,
  CreditCard,
  Truck,
  FileText,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/useCartStore"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/layout/Navbar"
import { toast } from "sonner"

import { BillingStep } from "@/components/checkout/BillingStep"
import { ShippingStep } from "@/components/checkout/ShippingStep"
import { MethodsStep } from "@/components/checkout/MethodsStep"
import { SummaryStep } from "@/components/checkout/SummaryStep"

const STEPS = [
  { id: "billing", title: "Számlázás", icon: FileText },
  { id: "shipping", title: "Szállítás", icon: Truck },
  { id: "methods", title: "Fizetés", icon: CreditCard },
  { id: "summary", title: "Összegzés", icon: Check },
]

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState({
    billing: {
      type: "personal",
      name: "",
      taxNumber: "",
      country: "Magyarország",
      city: "",
      zip: "",
      street: ""
    },
    shipping: {
      isSameAsBilling: true,
      name: "",
      country: "Magyarország",
      city: "",
      zip: "",
      street: "",
      comment: ""
    },
    methods: {
      shippingMethod: "",
      paymentMethod: ""
    },
    coupon: null as any
  })

  const [availableMethods, setAvailableMethods] = React.useState<any>(null)
  const items = useCartStore((state: any) => state.items)
  const cartTotalPrice = useCartStore((state: any) => state.totalPrice)
  const totalItems = useCartStore((state: any) => state.totalItems)
  const { data: session } = useSession()

  React.useEffect(() => {
    const fetchMethods = async () => {
      const res = await fetch("/api/checkout/methods")
      if (res.ok) setAvailableMethods(await res.json())
    }
    fetchMethods()
  }, [])

  // Pre-fill user data if available...
  React.useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        billing: { ...prev.billing, name: session.user.name || "" },
        shipping: { ...prev.shipping, name: session.user.name || "" }
      }))
    }
  }, [session])

  const nextStep = () => {
    if (currentStep === 0) {
      const b = formData.billing
      if (!b.name || !b.zip || !b.city || !b.street || (b.type === "company" && !b.taxNumber)) {
        toast.error("Kérjük, töltsön ki minden kötelező adatot a számlázásnál!")
        return
      }
    } else if (currentStep === 1) {
      if (!formData.shipping.isSameAsBilling) {
        const s = formData.shipping
        if (!s.name || !s.zip || !s.city || !s.street) {
          toast.error("Kérjük, töltse ki a szállítási adatokat is!")
          return
        }
      }
    } else if (currentStep === 2) {
      if (!formData.methods.shippingMethod || !formData.methods.paymentMethod) {
        toast.error("Kérjük, válasszon szállítási és fizetési módot!")
        return
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
  }
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))


  const selectedShipping = availableMethods?.shippingMethods?.find((m: any) => m._id === formData.methods.shippingMethod)
  const selectedPayment = availableMethods?.paymentMethods?.find((m: any) => m._id === formData.methods.paymentMethod)

  const calculateTotal = () => {
    let subtotal = cartTotalPrice
    let shippingFee = selectedShipping?.grossPrice || 0
    let paymentFee = selectedPayment?.grossPrice || 0
    let discount = 0

    if (formData.coupon) {
      if (formData.coupon.type === "percentage") {
        discount = subtotal * (formData.coupon.value / 100)
      } else if (formData.coupon.type === "fixed") {
        discount = formData.coupon.value
      } else if (formData.coupon.type === "free_shipping") {
        shippingFee = 0
      }
    }

    return {
      subtotal,
      shippingFee,
      paymentFee,
      discount,
      total: subtotal + shippingFee + paymentFee - discount
    }
  }

  const totals = calculateTotal()

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "billing":
        return <BillingStep data={formData.billing} onChange={(val: any) => setFormData({ ...formData, billing: val })} />
      case "shipping":
        return <ShippingStep data={formData.shipping} billingData={formData.billing} onChange={(val: any) => setFormData({ ...formData, shipping: val })} />
      case "methods":
        return <MethodsStep data={formData.methods} onChange={(val: any) => setFormData({ ...formData, methods: val })} />
      case "summary":
        return (
          <SummaryStep 
            data={formData} 
            onChange={(val: any) => setFormData(val)} 
            cartItems={items} 
            totalPrice={totals.subtotal} 
          />
        )
      default:
        return null
    }
  }

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()
  const clearCart = useCartStore((state: any) => state.clearCart)

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    try {
      const orderData = {
        items: items.map((i: any) => ({
          product: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        billingInfo: formData.billing,
        shippingAddress: formData.shipping.isSameAsBilling ? formData.billing : formData.shipping,
        shippingMethod: formData.methods.shippingMethod,
        paymentMethod: formData.methods.paymentMethod,
        couponCodes: formData.coupon ? [formData.coupon.code] : [],
        subtotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        paymentFee: totals.paymentFee,
        discount: totals.discount,
        total: totals.total
      }

      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      })

      if (res.ok) {
        clearCart()
        router.push("/checkout/success")
      } else {
        const err = await res.json()
        toast.error(err.error || "Hiba történt a rendelés leadása során")
      }
    } catch (error) {
      toast.error("Hálózati hiba történt")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-black pt-48 pb-20 px-6">
      <Navbar />
      <div className="container mx-auto max-w-6xl">
        {/* Step Progress */}
        <div className="sticky top-[80px] lg:top-[90px] z-40 bg-black pt-6 pb-6 mb-10 flex justify-between items-center border-b border-white/10">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 z-0" />
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                <div 
                  className={cn(
                    "w-12 h-12 rounded-none flex items-center justify-center border-2 transition-all duration-500 font-black",
                    isActive ? "bg-[#FF5500] border-[#FF5500] text-white scale-110 shadow-[0_0_20px_rgba(255,85,0,0.3)]" : 
                    isCompleted ? "bg-white text-black border-white" : "bg-black border-white/10 text-neutral-500"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                  isActive ? "text-white" : isCompleted ? "text-neutral-300" : "text-neutral-600"
                )}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-10 border-white/5"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-8 bg-[#FF5500]" />
                  <h2 className="text-3xl font-heading font-black text-white uppercase italic">
                    {STEPS[currentStep].title}
                  </h2>
                </div>
                
                <div className="min-h-[400px]">
                  {renderStep()}
                </div>

                <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
                  <Button 
                    variant="ghost" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="text-white hover:bg-white/5 rounded-none font-black uppercase tracking-widest text-xs"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Vissza
                  </Button>
                  
                  {currentStep === STEPS.length - 1 ? (
                    <Button 
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="bg-[#FF5500] text-white hover:bg-[#FF7722] rounded-none h-16 px-12 font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(255,85,0,0.2)]"
                    >
                      {isSubmitting ? "FELDOLGOZÁS..." : "MEGRENDELÉS LEADÁSA"} <Check className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={nextStep}
                      className="bg-white !text-black hover:bg-neutral-200 rounded-none h-14 px-10 font-black uppercase tracking-widest text-xs flex items-center"
                    >
                      Folytatás <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Cart Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="glass-card p-8 border-white/5 sticky top-40">
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <Package className="w-5 h-5 text-[#FF5500]" />
                <h3 className="font-heading font-black text-white uppercase tracking-tighter">MEGRENDELÉS</h3>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-neutral-900 border border-white/5 flex-none overflow-hidden">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] font-black text-white uppercase truncate">{item.name}</p>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">{item.quantity} x {item.price.toLocaleString("hu-HU")} FT</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  <span>Részösszeg</span>
                  <span>{totals.subtotal.toLocaleString("hu-HU")} FT</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  <span>Szállítás</span>
                  <span className={cn(selectedShipping ? "text-white" : "text-[#FF5500]")}>
                    {selectedShipping ? `${totals.shippingFee.toLocaleString("hu-HU")} FT` : "VÁLASZTÁS ALATT"}
                  </span>
                </div>
                {selectedPayment && totals.paymentFee > 0 && (
                  <div className="flex justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    <span>Fizetési kezelési díj</span>
                    <span>{totals.paymentFee.toLocaleString("hu-HU")} FT</span>
                  </div>
                )}
                {totals.discount > 0 && (
                  <div className="flex justify-between text-[10px] font-black text-[#FF5500] uppercase tracking-widest">
                    <span>Kedvezmény</span>
                    <span>-{totals.discount.toLocaleString("hu-HU")} FT</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-1">Összesen</p>
                    <p className="text-3xl font-black text-[#FF5500] tracking-tighter leading-none">{totals.total.toLocaleString("hu-HU")} FT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
