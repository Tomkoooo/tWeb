import nodemailer from "nodemailer";
import handlebars from "handlebars";
import dbConnect from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";

export interface MailOptions {
  to: string;
  templateType: string;
  data: Record<string, any>;
}

export const MailerService = {
  async getTransporter() {
    // In a real app, these would come from env vars
    // For now, we'll use a placeholder/mock if not provided
    const user = process.env.EMAIL_USER || "test@example.com";
    const pass = process.env.EMAIL_PASS || "password";
    const host = process.env.EMAIL_HOST || "smtp.example.com";
    const port = parseInt(process.env.EMAIL_PORT || "587");

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  },

  async sendEmail({ to, templateType, data }: MailOptions) {
    await dbConnect();
    
    const template = await EmailTemplate.findOne({ type: templateType }).lean();
    if (!template) {
      throw new Error(`Email template not found: ${templateType}`);
    }

    // Compile subject and body using Handlebars
    const compiledSubject = handlebars.compile(template.subject)(data);
    const compiledBody = handlebars.compile(template.body)(data);

    const transporter = await this.getTransporter();

    const info = await transporter.sendMail({
      from: `"Krausz Barkács Mester" <${process.env.EMAIL_FROM || "no-reply@krausz.hu"}>`,
      to,
      subject: compiledSubject,
      html: compiledBody,
    });

    return info;
  }
};
