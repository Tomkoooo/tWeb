import { readFile } from "fs/promises"
import path from "path"

type MetricRecord = {
  timestamp?: string
  source?: string
  category?: string
  name?: string
  value?: number
  unit?: string
  status?: "ok" | "error"
  route?: string
  method?: string
  url?: string
  metadata?: Record<string, unknown>
}

type MetricGroup = {
  key: string
  category: string
  name: string
  target: string
  unit: string
  count: number
  errorCount: number
  values: number[]
}

const DEFAULT_METRICS_FILE = path.join(process.cwd(), ".next", "dev-metrics", "metrics.jsonl")

async function main() {
  const filePath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_METRICS_FILE
  const records = await readMetricRecords(filePath)

  if (records.length === 0) {
    console.log(`No dev metrics found at ${filePath}`)
    console.log("Run with DEV_METRICS=1, browse the app, then run npm run metrics:analyze.")
    return
  }

  const firstBrowserTimestamp = records.find((record) => record.source === "browser")?.timestamp
  const runtimeRecords = firstBrowserTimestamp
    ? records.filter((record) => !record.timestamp || record.timestamp >= firstBrowserTimestamp)
    : records
  const buildRecords = firstBrowserTimestamp
    ? records.filter((record) => record.timestamp && record.timestamp < firstBrowserTimestamp)
    : []
  const groups = groupMetrics(runtimeRecords)
  const timedGroups = groups.filter((group) => group.values.length > 0)

  console.log(`Dev metrics report (${records.length} events)`)
  console.log(`Source: ${filePath}`)
  if (firstBrowserTimestamp) {
    console.log(`Runtime window: ${runtimeRecords.length} events after first browser metric (${firstBrowserTimestamp})`)
    console.log(`Build/static-generation window: ${buildRecords.length} earlier events`)
  }
  console.log("")

  printSlowestGroups(timedGroups)
  printErrorGroups(groups)
  printWebVitalIssues(runtimeRecords)
  printRepeatedFetches(groups)
  printBottleneckHints(groups)
  printBuildSignals(buildRecords)
}

async function readMetricRecords(filePath: string): Promise<MetricRecord[]> {
  try {
    const text = await readFile(filePath, "utf8")
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as MetricRecord
        } catch {
          return null
        }
      })
      .filter((record): record is MetricRecord => Boolean(record?.category && record?.name))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}

function groupMetrics(records: MetricRecord[]): MetricGroup[] {
  const groups = new Map<string, MetricGroup>()

  for (const record of records) {
    const category = record.category || "unknown"
    const name = record.name || "unknown"
    const target = normalizeMetricTarget(record)
    const unit = record.unit || ""
    const key = `${category}|${name}|${record.method || ""}|${target}|${unit}`
    const group =
      groups.get(key) ||
      {
        key,
        category,
        name: record.method ? `${record.method} ${name}` : name,
        target,
        unit,
        count: 0,
        errorCount: 0,
        values: [],
      }

    group.count += 1
    if (record.status === "error") group.errorCount += 1
    if (typeof record.value === "number" && Number.isFinite(record.value)) {
      group.values.push(record.value)
    }
    groups.set(key, group)
  }

  return [...groups.values()]
}

function printSlowestGroups(groups: MetricGroup[]) {
  const slowestMs = groups
    .filter((group) => group.unit === "ms")
    .sort((a, b) => percentile(b.values, 95) - percentile(a.values, 95))
    .slice(0, 15)
  const largestBytes = groups
    .filter((group) => group.unit === "bytes")
    .sort((a, b) => percentile(b.values, 95) - percentile(a.values, 95))
    .slice(0, 8)

  console.log("Slowest groups by p95")
  for (const group of slowestMs) {
    console.log(formatGroup(group))
  }
  if (largestBytes.length > 0) {
    console.log("")
    console.log("Largest transfer groups by p95")
    for (const group of largestBytes) {
      console.log(formatGroup(group))
    }
  }
  console.log("")
}

function printErrorGroups(groups: MetricGroup[]) {
  const withErrors = groups
    .filter((group) => group.errorCount > 0)
    .sort((a, b) => b.errorCount / b.count - a.errorCount / a.count)
    .slice(0, 15)

  console.log("Errors")
  if (withErrors.length === 0) {
    console.log("- No error metrics recorded.")
  } else {
    for (const group of withErrors) {
      console.log(`- ${group.category}.${group.name} ${group.target}: ${group.errorCount}/${group.count} errors`)
    }
  }
  console.log("")
}

function printWebVitalIssues(records: MetricRecord[]) {
  const issues = records
    .filter((record) => record.category === "web-vital" && typeof record.value === "number")
    .map((record) => ({ record, rating: rateWebVital(record.name || "", record.value || 0) }))
    .filter((item) => item.rating !== "good")
    .sort((a, b) => (b.record.value || 0) - (a.record.value || 0))
    .slice(0, 15)

  console.log("Web Vital issues")
  if (issues.length === 0) {
    console.log("- No poor Web Vital metrics recorded.")
  } else {
    for (const { record, rating } of issues) {
      console.log(`- ${record.name} ${formatNumber(record.value || 0)}${record.unit || ""} on ${record.route || "unknown"} (${rating})`)
    }
  }
  console.log("")
}

function printRepeatedFetches(groups: MetricGroup[]) {
  const repeated = groups
    .filter((group) => group.category === "client-fetch" && group.count >= 5)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  console.log("Repeated client fetches")
  if (repeated.length === 0) {
    console.log("- No repeated client fetch groups above threshold.")
  } else {
    for (const group of repeated) {
      console.log(`- ${group.target}: ${group.count} calls, p95 ${formatNumber(percentile(group.values, 95))}${group.unit}`)
    }
  }
  console.log("")
}

function printBottleneckHints(groups: MetricGroup[]) {
  const hints: string[] = []

  for (const group of groups) {
    const p95 = percentile(group.values, 95)
    if ((group.category === "page-data" || group.category === "api") && p95 >= 1000) {
      hints.push(`${group.category}.${group.name} on ${group.target} has p95 ${formatNumber(p95)}${group.unit}. Check DB queries, cache misses, or external calls in that path.`)
    }
    if (group.category === "db" && group.name.includes("cold-connect") && p95 >= 500) {
      hints.push(`Mongo cold connect is ${formatNumber(p95)}ms p95. First request latency may be dominated by connection setup.`)
    }
    if (group.category === "main-thread" && p95 >= 100) {
      hints.push(`Long main-thread tasks hit ${formatNumber(p95)}ms p95 on ${group.target}. Inspect heavy client rendering, hydration, or large synchronous work.`)
    }
    if (group.category === "client-fetch" && p95 >= 800) {
      hints.push(`Client fetch ${group.target} has p95 ${formatNumber(p95)}ms. Compare with matching API metrics to separate network/client overhead from server work.`)
    }
  }

  console.log("Possible bottlenecks")
  if (hints.length === 0) {
    console.log("- No obvious bottleneck hints crossed the built-in thresholds.")
  } else {
    for (const hint of [...new Set(hints)].slice(0, 15)) {
      console.log(`- ${hint}`)
    }
  }
}

function printBuildSignals(records: MetricRecord[]) {
  if (records.length === 0) return

  const groups = groupMetrics(records).filter((group) => group.values.length > 0)
  const slowBuild = groups
    .filter((group) => group.unit === "ms" && percentile(group.values, 95) >= 1000)
    .sort((a, b) => percentile(b.values, 95) - percentile(a.values, 95))
    .slice(0, 10)

  if (slowBuild.length === 0) return

  console.log("")
  console.log("Build/static-generation signals")
  for (const group of slowBuild) {
    console.log(formatGroup(group))
  }
}

function formatGroup(group: MetricGroup): string {
  return `- ${group.category}.${group.name} ${group.target}: count ${group.count}, avg ${formatNumber(average(group.values))}${group.unit}, p95 ${formatNumber(percentile(group.values, 95))}${group.unit}, max ${formatNumber(Math.max(...group.values))}${group.unit}`
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[index]
}

function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100)
}

function normalizeMetricTarget(record: MetricRecord): string {
  const raw = record.url || record.route || "global"
  if (!raw) return "global"

  try {
    const url = new URL(raw, "http://local.dev")
    url.searchParams.delete("_rsc")
    const query = url.searchParams.toString()
    return `${url.pathname}${query ? `?${query}` : ""}`
  } catch {
    return raw.replace(/([?&])_rsc=[^&]+&?/g, "$1").replace(/[?&]$/, "")
  }
}

function rateWebVital(name: string, value: number): "good" | "needs-improvement" | "poor" {
  switch (name) {
    case "CLS":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor"
    case "INP":
      return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor"
    case "LCP":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor"
    case "FCP":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor"
    case "TTFB":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor"
    default:
      return "good"
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
