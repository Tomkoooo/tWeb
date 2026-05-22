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
import {
  formatHuf,
  priceBreakdownFromGross,
  totalsFromMixedVatLines,
  clampVatPercent,
  DEFAULT_VAT_PERCENT,
} from "@/lib/pricing"
import { getCountryDisplayName, formatAllowedCountriesList, normalizeIso2 } from "@/lib/country-codes"
import { checkoutPrefillFromUserProfile } from "@/lib/checkout-profile-prefill"
import type { TradingLimits } from "@/components/checkout/CheckoutCountryPicker"
import {
  isFoxpostParcelShippingMethod,
  isGlsParcelShippingMethod,
  offersOnlyParcelLockerShipping,
} from "@/lib/shipping-providers"
import { useCartStore, type CartItem } from "@/store/useCartStore"

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
    countryCode: "HU",
    country: getCountryDisplayName("HU", "hu-HU"),
    city: "",
    zip: "",
    street: "",
    email: "",
    phone: "",
  },
  shipping: {
    isSameAsBilling: true,
    name: "",
    countryCode: "HU",
    country: getCountryDisplayName("HU", "hu-HU"),
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
    foxpostParcelPoint: null as any,
  },
  coupon: null as any,
  /** Logged-in users only; sent to API, default on */
  saveAddressToProfile: true,
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
  const { data: session, status: sessionStatus } = useSession()
  const [shopEnabled, setShopEnabled] = React.useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [stripeRedirectHold, setStripeRedirectHold] = React.useState<StripeRedirectHold | null>(null)
  const [tradingLimits, setTradingLimits] = React.useState<TradingLimits | null>(null)
  const router = useRouter()

  const parcelOnlyShipping = React.useMemo(
    () => offersOnlyParcelLockerShipping(availableMethods?.shippingMethods),
    [availableMethods?.shippingMethods]
  )

  const activeSteps = React.useMemo(
    () =>
      parcelOnlyShipping
        ? CHECKOUT_WIZARD_STEPS.filter((s) => s.id !== "shipping")
        : [...CHECKOUT_WIZARD_STEPS],
    [parcelOnlyShipping]
  )

  React.useEffect(() => {
    if (!parcelOnlyShipping) return
    setFormData((prev) =>
      prev.shipping.isSameAsBilling
        ? prev
        : {
            ...prev,
            shipping: {
              ...prev.shipping,
              isSameAsBilling: true,
            },
          }
    )
  }, [parcelOnlyShipping])

  React.useEffect(() => {
    if (currentStep < activeSteps.length) return
    setCurrentStep(Math.max(0, activeSteps.length - 1))
  }, [activeSteps.length, currentStep])

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/shop/trading-limits")
        if (!res.ok) return
        setTradingLimits(await res.json())
      } catch {
        setTradingLimits(null)
      }
    }
    void load()
  }, [])

  React.useEffect(() => {
    if (!stripeRedirectHold?.checkoutUrl) return
    const delayMs = 6000
    const id = window.setTimeout(() => {
      window.location.href = stripeRedirectHold.checkoutUrl
    }, delayMs)
    return () => window.clearTimeout(id)
  }, [stripeRedirectHold])

  React.useEffect(() => {
    setFormData((prev) => {
      if (!prev.shipping.isSameAsBilling) return prev
      if (
        prev.shipping.countryCode === prev.billing.countryCode &&
        prev.shipping.country === prev.billing.country
      ) {
        return prev
      }
      return {
        ...prev,
        shipping: {
          ...prev.shipping,
          countryCode: prev.billing.countryCode,
          country: prev.billing.country,
        },
      }
    })
  }, [formData.billing.countryCode, formData.billing.country, formData.shipping.isSameAsBilling])

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
    if (sessionStatus !== "authenticated" || !session?.user) return

    let cancelled = false
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled || data?.error) return

        const prefill = checkoutPrefillFromUserProfile(data, {
          email: session.user.email,
          name: session.user.name,
        })

        setFormData((prev) => {
          let billing = { ...prev.billing }
          let shipping = { ...prev.shipping }
          if (prefill) {
            billing = { ...billing, ...prefill.billing }
            shipping = { ...shipping, ...prefill.shipping }
          } else {
            if (session.user.name) {
              billing.name = billing.name || session.user.name
              shipping.name = shipping.name || session.user.name
            }
            if (session.user.email) {
              billing.email = billing.email || session.user.email
              shipping.email = shipping.email || session.user.email
            }
          }

          const savedBilling = data.billingInfo as { phone?: string; email?: string } | undefined
          const savedShipping = data.shippingAddress as { phone?: string; email?: string } | undefined
          if (savedBilling?.phone?.trim()) {
            billing.phone = billing.phone || savedBilling.phone.trim()
          }
          if (savedBilling?.email?.trim()) {
            billing.email = billing.email || savedBilling.email.trim()
          }
          if (savedShipping?.phone?.trim()) {
            shipping.phone = shipping.phone || savedShipping.phone.trim()
          }
          if (savedShipping?.email?.trim()) {
            shipping.email = shipping.email || savedShipping.email.trim()
          }
          return { ...prev, billing, shipping }
        })
      } catch {
        /* profile prefill is best-effort */
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [sessionStatus, session?.user?.email, session?.user?.name])

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
  const totalBreakdown = React.useMemo(() => {
    const { subtotal: st, shippingFee, paymentFee, total } = totals
    const goodsAfterDiscount = Math.max(0, total - shippingFee - paymentFee)
    const scale = st > 0 ? goodsAfterDiscount / st : 1
    const mixed = totalsFromMixedVatLines(
      items.map((i: CartItem) => ({
        grossUnit: Number(i.price) * scale,
        quantity: Number(i.quantity),
        vatPercent: clampVatPercent(i.vatPercent ?? DEFAULT_VAT_PERCENT),
      }))
    )
    let net = mixed.net
    let vat = mixed.vat
    if (shippingFee > 0) {
      const s = priceBreakdownFromGross(shippingFee, 1, DEFAULT_VAT_PERCENT)
      net += s.lineNet
      vat += s.lineVat
    }
    if (paymentFee > 0) {
      const p = priceBreakdownFromGross(paymentFee, 1, DEFAULT_VAT_PERCENT)
      net += p.lineNet
      vat += p.lineVat
    }
    return { net, vat, gross: total }
  }, [totals, items])

  const nextStep = React.useCallback(() => {
    const stepId = activeSteps[currentStep]?.id
    if (stepId === "billing") {
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
      const bc = normalizeIso2(b.countryCode)
      if (!bc) {
        toast.error("Kérjük, válasszon érvényes számlázási országot.")
        return
      }
      if (
        tradingLimits?.invoicingRestricted &&
        tradingLimits.invoicingAllowedCountryCodes.length > 0 &&
        !tradingLimits.invoicingAllowedCountryCodes.includes(bc)
      ) {
        toast.error(
          `A számlázási ország nem engedélyezett. Csak számlázunk: ${formatAllowedCountriesList(
            tradingLimits.invoicingAllowedCountryCodes
          )} (${tradingLimits.invoicingAllowedCountryCodes.join(", ")}).`
        )
        return
      }
    } else if (stepId === "shipping") {
      const shipCode = formData.shipping.isSameAsBilling
        ? normalizeIso2(formData.billing.countryCode)
        : normalizeIso2(formData.shipping.countryCode)
      if (!shipCode) {
        toast.error("Kérjük, állítson be érvényes szállítási országot.")
        return
      }
      if (
        tradingLimits?.shippingRestricted &&
        tradingLimits.shippingAllowedCountryCodes.length > 0 &&
        !tradingLimits.shippingAllowedCountryCodes.includes(shipCode)
      ) {
        toast.error(
          `Ez a bolt csak a következő országokba szállít: ${formatAllowedCountriesList(
            tradingLimits.shippingAllowedCountryCodes
          )} (${tradingLimits.shippingAllowedCountryCodes.join(", ")}).`
        )
        return
      }
      if (!formData.shipping.isSameAsBilling) {
        const s = formData.shipping
        if (!s.name || !s.zip || !s.city || !s.street || !s.email || !s.phone) {
          toast.error("Kérjük, töltse ki a szállítási adatokat is!")
          return
        }
      }
    } else if (stepId === "methods") {
      if (!formData.methods.shippingMethod || !formData.methods.paymentMethod) {
        toast.error("Kérjük, válasszon szállítási és fizetési módot!")
        return
      }
      if (
        isGlsParcelShippingMethod(formData.methods.shippingMethod, selectedShipping) &&
        !formData.methods.glsParcelPoint?.id
      ) {
        toast.error("Kérjük, válasszon GLS csomagpontot!")
        return
      }
      if (
        isFoxpostParcelShippingMethod(formData.methods.shippingMethod, selectedShipping) &&
        !formData.methods.foxpostParcelPoint?.id
      ) {
        toast.error("Kérjük, válasszon Foxpost csomagautomatát!")
        return
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, activeSteps.length - 1))
  }, [activeSteps, currentStep, formData, selectedShipping, tradingLimits])

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
      billingInfo: {
        ...formData.billing,
        country: formData.billing.country,
        countryCode: formData.billing.countryCode,
      },
      shippingAddress: formData.shipping.isSameAsBilling
        ? {
            name: formData.billing.name,
            zip: formData.billing.zip,
            city: formData.billing.city,
            street: formData.billing.street,
            country: formData.billing.country,
            countryCode: formData.billing.countryCode,
            comment: formData.shipping.comment,
            email: formData.billing.email,
            phone: formData.billing.phone,
          }
        : {
            name: formData.shipping.name,
            zip: formData.shipping.zip,
            city: formData.shipping.city,
            street: formData.shipping.street,
            country: formData.shipping.country,
            countryCode: formData.shipping.countryCode,
            comment: formData.shipping.comment,
            email: formData.shipping.email,
            phone: formData.shipping.phone,
          },
      shippingMethod: formData.methods.shippingMethod,
      paymentMethod: formData.methods.paymentMethod,
      glsParcelPoint: formData.methods.glsParcelPoint || undefined,
      foxpostParcelPoint: formData.methods.foxpostParcelPoint || undefined,
      couponCodes: formData.coupon ? [formData.coupon.code] : [],
      subtotal: t.subtotal,
      shippingFee: t.shippingFee,
      paymentFee: t.paymentFee,
      discount: t.discount,
      total: t.total,
      saveAddressToProfile: formData.saveAddressToProfile,
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
    const stepId = activeSteps[currentStep]?.id
    switch (stepId) {
      case "billing":
        return (
          <BillingStep
            appearance={stepAppearance}
            data={formData.billing}
            tradingLimits={tradingLimits}
            onChange={(val: any) => setFormData((prev) => ({ ...prev, billing: val }))}
          />
        )
      case "shipping":
        return (
          <ShippingStep
            appearance={stepAppearance}
            data={formData.shipping}
            billingData={formData.billing}
            tradingLimits={tradingLimits}
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
            isAuthenticated={Boolean(session?.user)}
          />
        )
      default:
        return null
    }
  }, [
    activeSteps,
    availableMethods,
    currentStep,
    formData,
    items,
    session?.user,
    stepAppearance,
    totals.subtotal,
    tradingLimits,
  ])

  return {
    currentStep,
    setCurrentStep,
    steps: activeSteps,
    parcelOnlyShipping,
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
