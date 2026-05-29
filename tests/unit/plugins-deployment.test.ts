import { describe, expect, it, beforeEach, afterEach } from "vitest"
import {
  getDeploymentDefinition,
  getDeploymentKey,
  getPluginConfigForDeployment,
  isPluginAllowlistedForDeployment,
  listAllowedTemplateIdsForDeployment,
} from "@/config/deployments-registry"

describe("deployment config", () => {
  const originalKey = process.env.DEPLOYMENT_KEY

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.DEPLOYMENT_KEY
    } else {
      process.env.DEPLOYMENT_KEY = originalKey
    }
  })

  it("defaults to default deployment key", () => {
    delete process.env.DEPLOYMENT_KEY
    expect(getDeploymentKey()).toBe("default")
    expect(getDeploymentDefinition().enabledPlugins).toEqual([])
    expect(listAllowedTemplateIdsForDeployment()).toContain("default-modern")
  })

  it("selects course-seller deployment via DEPLOYMENT_KEY", () => {
    process.env.DEPLOYMENT_KEY = "course-seller"
    const config = getDeploymentDefinition()
    expect(config.key).toBe("course-seller")
    expect(config.enabledPlugins).toContain("ticketing")
    expect(getPluginConfigForDeployment("ticketing").checkoutMode).toBe("direct")
  })

  it("allowlists plugins per deployment", () => {
    process.env.DEPLOYMENT_KEY = "default"
    expect(isPluginAllowlistedForDeployment("ticketing")).toBe(false)
    process.env.DEPLOYMENT_KEY = "course-seller"
    expect(isPluginAllowlistedForDeployment("ticketing")).toBe(true)
  })
})
