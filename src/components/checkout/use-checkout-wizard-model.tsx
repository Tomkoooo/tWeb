"use client"
/* eslint-disable @typescript-eslint/no-explicit-any -- mirrors legacy CheckoutPageView */

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { BillingStep } from "@/components/checkout/BillingStep"
import { ShippingStep } from "@/components/checkout/ShippingStep"
import { MethodsStep } from "@/components/checkout/MethodsStep"
import { SummaryStep } from "@/components/checkout/SummaryStep"
import type { CheckoutStepAppearance } from "@/components/checkout/checkout-appearance"
import { GLS_FIXED_SHIPPING_METHOD_ID } from "@/lib/gls"
import { formatHuf, priceBreakdownFromGross, totalsBreakdownFromGross } from "@/lib/pricing"
import { useCartStore } from "@/store/useCartStore"

export const CHECKOUT_WIZARD_STEPS = [
  { id: "billing", title: "Számlázás" },
  { id: "shipping", title: "Szállítás" },
  { id: "methods", title: "Fizetés" },
  { id: "summary", title: "Összegzés" },
] as const

export type CheckoutWizardStepId = (typeof CHECKOUT_WIZARD_STEPS)[number]["id"]

const initialForm = () => ({
  billing: {
    type: "personal" as "personal" | "company",
    name: "",
    taxNumber: "",
    country: "Magyarország",
    city: "",
    zip: "",
    street: "",
    email: "",
    phone: "",
  },
  shipping: {
    isSameAsBilling: true,
    name: "",
    country: "Magyarország",
    city: "",
    zip: "",
    street: "",
    comment: "",
    email: "",
    phone: "",
  },
  methods: {
    shippingMethod: "",
    paymentMethod: "",
    glsParcelPoint: null as any,
  },
  coupon: null as any,
})

export type CheckoutWizardFormState = ReturnType<typeof initialForm>

export type StripeRedirectHold = {
  checkoutUrl: string
  reservationExpiresAt: string
  serverTime: string | null
}

/**
 * Shared checkout wizard state + validation + submit (Stripe vs COD).
 * Use from the engine `CheckoutPageView` or from a template `RouteMain` for full UI freedom.
 */
export function useCheckoutWizardModel(
  options: { variant?: "page" | "embedded"; stepAppearance?: CheckoutStepAppearance } = {}
) {
  void options.variant
  const stepAppearance: CheckoutStepAppearance = options.stepAppearance ?? "dark"
  const [currentStep, setCurrentStep] = React.useState(0)
  const [formData, setFormData] = React.useState(initialForm)
  const [availableMethods, setAvailableMethods] = React.useState<any>(null)
  const items = useCartStore((s) => s.items)
  const cartTotalPrice = useCartStore((s) => s.totalPrice)
  const clearCart = useCartStore((s) => s.clearCart)
  const { data: session } = useSession()
  const [shopEnabled, setShopEnabled] = React.useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [stripeRedirectHold, setStripeRedirectHold] = React.useState<StripeRedirectHold | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    if (!stripeRedirectHold?.checkoutUrl) return
    const delayMs = 6000
    const id = window.setTimeout(() => {
      window.location.href = stripeRedirectHold.checkoutUrl
    }, delayMs)
    return () => window.clearTimeout(id)
  }, [stripeRedirectHold])

  React.useEffect(() => {
    const fetchMethods = async () => {
      const res = await fetch("/api/checkout/methods")
      if (res.ok) {
        setAvailableMethods(await res.json())
      } else {
        const err = await res.json().catch(() => ({}))
        if (err?.error) toast.error(err.error)
      }
    }
    void fetchMethods()
  }, [])

  React.useEffect(() => {
    const loadAvailability = async () => {
      try {
        const res = await fetch("/api/shop/availability")
        if (!res.ok) {
          setShopEnabled(false)
          return
        }
        const data = await res.json()
        setShopEnabled(Boolean(data.enabled))
      } catch {
        setShopEnabled(false)
      }
    }
    void loadAvailability()
  }, [])

  React.useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        billing: {
          ...prev.billing,
          name: session.user.name || "",
          email: session.user.email || prev.billing.email,
        },
        shipping: {
          ...prev.shipping,
          name: session.user.name || "",
          email: session.user.email || prev.shipping.email,
        },
      }))
    }
  }, [session])

  const selectedShipping = availableMethods?.shippingMethods?.find(
    (m: any) => m._id === formData.methods.shippingMethod
  )
  const selectedPayment = availableMethods?.paymentMethods?.find(
    (m: any) => m._id === formData.methods.paymentMethod
  )

  const calculateTotal = React.useCallback(() => {
    const subtotal = cartTotalPrice
    const paymentFee = selectedPayment?.grossPrice || 0
    let shippingFee = selectedShipping?.grossPrice || 0
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
      total: subtotal + shippingFee + paymentFee - discount,
    }
  }, [cartTotalPrice, formData.coupon, selectedPayment?.grossPrice, selectedShipping?.grossPrice])

  const totals = calculateTotal()
  const totalBreakdown = totalsBreakdownFromGross(totals.total)

  const nextStep = React.useCallback(() => {
    if (currentStep === 0) {
      const b = formData.billing
      if (
        !b.name ||
        !b.zip ||
        !b.city ||
        !b.street ||
        !b.email ||
        !b.phone ||
        (b.type === "company" && !b.taxNumber)
      ) {
        toast.error("Kérjük, töltsön ki minden kötelező adatot a számlázásnál!")
        return
      }
    } else if (currentStep === 1) {
      if (!formData.shipping.isSameAsBilling) {
        const s = formData.shipping
        if (!s.name || !s.zip || !s.city || !s.street || !s.email || !s.phone) {
          toast.error("Kérjük, töltse ki a szállítási adatokat is!")
          return
        }
      }
    } else if (currentStep === 2) {
      if (!formData.methods.shippingMethod || !formData.methods.paymentMethod) {
        toast.error("Kérjük, válasszon szállítási és fizetési módot!")
        return
      }
      if (
        formData.methods.shippingMethod === GLS_FIXED_SHIPPING_METHOD_ID &&
        !formData.methods.glsParcelPoint?.id
      ) {
        toast.error("Kérjük, válasszon GLS csomagpontot!")
        return
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, CHECKOUT_WIZARD_STEPS.length - 1))
  }, [currentStep, formData])

  const prevStep = React.useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const buildOrderPayload = React.useCallback(() => {
    const t = calculateTotal()
    return {
      items: items.map((i: any) => ({
        product: i.productId || i.id,
        variantId: i.variantId || undefined,
        variantLabel: i.variantLabel || undefined,
        selectedAttributes: i.selectedAttributes || undefined,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      billingInfo: formData.billing,
      shippingAddress: formData.shipping.isSameAsBilling
        ? {
            name: formData.billing.name,
            zip: formData.billing.zip,
            city: formData.billing.city,
            street: formData.billing.street,
            comment: formData.shipping.comment,
            email: formData.billing.email,
            phone: formData.billing.phone,
          }
        : {
            name: formData.shipping.name,
            zip: formData.shipping.zip,
            city: formData.shipping.city,
            street: formData.shipping.street,
            comment: formData.shipping.comment,
            email: formData.shipping.email,
            phone: formData.shipping.phone,
          },
      shippingMethod: formData.methods.shippingMethod,
      paymentMethod: formData.methods.paymentMethod,
      glsParcelPoint: formData.methods.glsParcelPoint || undefined,
      couponCodes: formData.coupon ? [formData.coupon.code] : [],
      subtotal: t.subtotal,
      shippingFee: t.shippingFee,
      paymentFee: t.paymentFee,
      discount: t.discount,
      total: t.total,
    }
  }, [calculateTotal, formData, items])

  const handleSubmitOrder = React.useCallback(async () => {
    if (!shopEnabled) {
      toast.error("Jelenleg a rendelés leadás szünetel")
      return
    }
    setIsSubmitting(true)
    try {
      const orderData = buildOrderPayload()
      const isStripe = formData.methods.paymentMethod === "stripe_fixed"
      const endpoint = isStripe ? "/api/checkout/stripe/session" : "/api/checkout/order"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
      if (res.ok) {
        const payload = await res.json()
        if (isStripe) {
          if (payload?.checkoutUrl) {
            if (payload.tempOrderId) {
              try {
                sessionStorage.setItem("stripeTempOrderId", String(payload.tempOrderId))
              } catch {
                /* ignore */
              }
            }
            if (payload.reservationExpiresAt) {
              setStripeRedirectHold({
                checkoutUrl: payload.checkoutUrl,
                reservationExpiresAt: String(payload.reservationExpiresAt),
                serverTime: payload.serverTime != null ? String(payload.serverTime) : null,
              })
              return
            }
            window.location.href = payload.checkoutUrl
            return
          }
          toast.error("Nem sikerült átirányítani a Stripe fizetéshez.")
        } else {
          clearCart()
          router.push("/checkout/success")
        }
      } else {
        const err = await res.json()
        toast.error(err.error || "Hiba történt a rendelés leadása során")
      }
    } catch {
      toast.error("Hálózati hiba történt")
    } finally {
      setIsSubmitting(false)
    }
  }, [buildOrderPayload, clearCart, formData.methods.paymentMethod, router, shopEnabled])

  const goToStripeNow = React.useCallback(() => {
    if (stripeRedirectHold?.checkoutUrl) {
      window.location.href = stripeRedirectHold.checkoutUrl
    }
  }, [stripeRedirectHold])

  const renderStep = React.useCallback(() => {
    const stepId = CHECKOUT_WIZARD_STEPS[currentStep]?.id
    switch (stepId) {
      case "billing":
        return (
          <BillingStep
            appearance={stepAppearance}
            data={formData.billing}
            onChange={(val: any) => setFormData((prev) => ({ ...prev, billing: val }))}
          />
        )
      case "shipping":
        return (
          <ShippingStep
            appearance={stepAppearance}
            data={formData.shipping}
            billingData={formData.billing}
            onChange={(val: any) => setFormData((prev) => ({ ...prev, shipping: val }))}
          />
        )
      case "methods":
        return (
          <MethodsStep
            appearance={stepAppearance}
            data={formData.methods}
            methods={availableMethods}
            onChange={(val: any) => setFormData((prev) => ({ ...prev, methods: val }))}
          />
        )
      case "summary":
        return (
          <SummaryStep
            appearance={stepAppearance}
            data={formData}
            onChange={(val: any) => setFormData(val)}
            cartItems={items}
            totalPrice={totals.subtotal}
          />
        )
      default:
        return null
    }
  }, [availableMethods, currentStep, formData, items, stepAppearance, totals.subtotal])

  return {
    currentStep,
    setCurrentStep,
    steps: CHECKOUT_WIZARD_STEPS,
    formData,
    setFormData,
    availableMethods,
    shopEnabled,
    items,
    cartTotalPrice,
    nextStep,
    prevStep,
    totals,
    totalBreakdown,
    selectedShipping,
    selectedPayment,
    priceBreakdownFromGross,
    formatHuf,
    renderStep,
    handleSubmitOrder,
    isSubmitting,
    stripeRedirectHold,
    goToStripeNow,
  }
}
