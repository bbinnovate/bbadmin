import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-sender";
import { adminDB } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, services, company } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ============================
    // 🔥 SAVE TO FIRESTORE
    // ============================
    await adminDB.collection("contactSubmissions").add({
      name,
      email,
      phone,
      company: company || "",
      message: message || "",
      services: services || [],
      createdAt: FieldValue.serverTimestamp(),
    });

    // ============================
    // FORMAT SERVICES
    // ============================
    const formattedServices =
      services && services.length
        ? services.length === 1
          ? services[0]
          : services.slice(0, -1).join(", ") +
            " & " +
            services[services.length - 1]
        : "None";

    // ============================
    // EMAIL TEMPLATE (USER)
    // ============================
    const htmlTemplate = `
      <h2>Thanks for contacting Bombay Blokes</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Company:</strong> ${company || "-"}</p>
      <p><strong>Services:</strong> ${formattedServices}</p>
      <p><strong>Message:</strong> ${message || "No message"}</p>
    `;

    // ============================
    // SEND EMAIL TO USER
    // ============================
    await sendEmail({
      to: email,
      subject: "The Blokes Are Excited To Work With You",
      html: htmlTemplate,
      fromName: "Bombay Blokes",
      fromAddress: "hello@bombayblokes.com",
    });

    // ============================
    // SEND EMAIL TO ADMIN TEAM
    // ============================
    const teamNotification = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Company:</strong> ${company || "-"}</p>
      <p><strong>Services:</strong> ${services?.join(", ") || "None"}</p>
      <p><strong>Message:</strong> ${message || "No message"}</p>
    `;

    await sendEmail({
      to: ["hello@bombayblokes.com", "bdm@bombayblokes.com"],
      subject: `New Contact Form - ${name}`,
      html: teamNotification,
      fromName: "Website Contact Form",
      fromAddress: "hello@bombayblokes.com",
    });

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
