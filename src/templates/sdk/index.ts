export { useTemplateCartActions } from "./use-template-cart-actions"

/** Default engine bodies — optional reuse inside a custom `RouteMain`. */
export {
  DefaultCartPageView,
  DefaultCheckoutPageView,
  DefaultProfilePageView,
} from "@/components/flow-routes/default-flow-views"

/** `/shop` preview + storefront: `ProductCard` + optional `CategoryPill` from `commerceSlots`. */
export { resolveCommerceShopRendering } from "@/templates/resolve-commerce-slots"

/** Checkout wizard: same validation + Stripe/COD submit as engine `CheckoutPageView`. */
export {
  useCheckoutWizardModel,
  CHECKOUT_WIZARD_STEPS,
  type CheckoutWizardFormState,
  type CheckoutWizardStepId,
} from "@/components/checkout/use-checkout-wizard-model"

/** Profile account tab: load/save `/api/user/profile`, newsletter, sign-out / delete. */
export {
  useProfileAccountModel,
  type ProfileAccountFormState,
} from "@/components/profile/use-profile-account-model"
