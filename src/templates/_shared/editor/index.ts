// Re-export façade for editor primitives shared across templates.
// Templates should compose these instead of building their own admin UI.

export { VisualHomepageEditor } from "@/features/homepage-cms/components/editor/VisualHomepageEditor"
export { HomepageRenderer } from "@/features/homepage-cms/render/HomepageRenderer"
export { RealHomepageSections } from "@/features/homepage-cms/render/RealHomepageSections"
