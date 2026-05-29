import { describe, expect, it, afterEach } from "vitest"
import {
  getDeploymentAccessMatrix,
  getDeploymentDefinition,
  getDeploymentKey,
  isPluginAllowlistedForDeployment,
  isTemplateAllowedForDeployment,
  listAllowedTemplateIdsForDeployment,
} from "@/config/deployments-registry"

describe("deployments-registry", () => {
  const originalKey = process.env.DEPLOYMENT_KEY

  afterEach(() => {
    if (originalKey === undefined) delete process.env.DEPLOYMENT_KEY
    else process.env.DEPLOYMENT_KEY = originalKey
  })

  it("exposes a non-empty access matrix", () => {
    const matrix = getDeploymentAccessMatrix()
    expect(matrix.length).toBeGreaterThan(0)
    expect(matrix.some((d) => d.key === "default")).toBe(true)
    expect(matrix.some((d) => d.key === "course-seller")).toBe(true)
  })

  it("default deployment allows both registered templates", () => {
    delete process.env.DEPLOYMENT_KEY
    const ids = listAllowedTemplateIdsForDeployment()
    expect(ids).toContain("default-modern")
    expect(ids).toContain("atelier-showcase")
    expect(getDeploymentDefinition().enabledPlugins).toEqual([])
  })

  it("course-seller allowlists ticketing plugin and templates", () => {
    process.env.DEPLOYMENT_KEY = "course-seller"
    expect(isPluginAllowlistedForDeployment("ticketing")).toBe(true)
    expect(isPluginAllowlistedForDeployment("unknown")).toBe(false)
    expect(isTemplateAllowedForDeployment("default-modern")).toBe(true)
    expect(getDeploymentKey()).toBe("course-seller")
  })
})
