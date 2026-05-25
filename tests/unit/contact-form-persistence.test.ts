import { beforeEach, describe, expect, it, vi } from "vitest"

const listContactEmailsMock = vi.fn()
const createContactMessageMock = vi.fn()
const updateNotificationStatusMock = vi.fn()
const sendSystemHtmlEmailMock = vi.fn()

vi.mock("@/services/contact-emails", () => ({
  ContactEmailsService: { list: listContactEmailsMock },
}))

vi.mock("@/services/contact-messages", () => ({
  ContactMessageService: {
    create: createContactMessageMock,
    updateNotificationStatus: updateNotificationStatusMock,
  },
}))

vi.mock("@/services/mailer", () => ({
  MailerService: { sendSystemHtmlEmail: sendSystemHtmlEmailMock },
}))

function contactFormData() {
  const formData = new FormData()
  formData.set("name", "Teszt Elek")
  formData.set("email", "teszt@example.com")
  formData.set("message", "Szeretnék érdeklődni a termékről.")
  formData.set("recipientId", "sales")
  return formData
}

describe("submitContactForm persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
    listContactEmailsMock.mockResolvedValue([
      { id: "sales", label: "Értékesítés", email: "sales@example.com" },
    ])
    createContactMessageMock.mockResolvedValue({ _id: "contact-message-1" })
    updateNotificationStatusMock.mockResolvedValue({})
    sendSystemHtmlEmailMock.mockResolvedValue({ messageId: "mail-1" })
  })

  it("saves the contact message before sending notification mail", async () => {
    const { submitContactForm } = await import("@/actions/contact-form")
    const result = await submitContactForm(undefined, contactFormData())

    expect(result.ok).toBe(true)
    expect(createContactMessageMock).toHaveBeenCalledWith({
      name: "Teszt Elek",
      email: "teszt@example.com",
      message: "Szeretnék érdeklődni a termékről.",
      recipientId: "sales",
      recipientLabel: "Értékesítés",
      recipientEmail: "sales@example.com",
    })
    expect(createContactMessageMock.mock.invocationCallOrder[0]).toBeLessThan(
      sendSystemHtmlEmailMock.mock.invocationCallOrder[0]
    )
    expect(updateNotificationStatusMock).toHaveBeenCalledWith("contact-message-1", "sent", undefined)
  })

  it("keeps the visitor success path and records notification failure when SMTP fails", async () => {
    sendSystemHtmlEmailMock.mockRejectedValue(
      Object.assign(new Error("domain not registered here"), { responseCode: 550 })
    )

    const { submitContactForm } = await import("@/actions/contact-form")
    const result = await submitContactForm(undefined, contactFormData())

    expect(result).toEqual({
      ok: true,
      message: "Üzenetét rögzítettük. Hamarosan válaszolunk.",
    })
    expect(updateNotificationStatusMock).toHaveBeenCalledWith(
      "contact-message-1",
      "failed",
      expect.stringContaining("550")
    )
  })

  it("does not attempt email delivery when database persistence fails", async () => {
    createContactMessageMock.mockRejectedValue(new Error("database unavailable"))

    const { submitContactForm } = await import("@/actions/contact-form")
    const result = await submitContactForm(undefined, contactFormData())

    expect(result.ok).toBe(false)
    expect(sendSystemHtmlEmailMock).not.toHaveBeenCalled()
    expect(updateNotificationStatusMock).not.toHaveBeenCalled()
  })
})
