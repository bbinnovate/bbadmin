// OneSignal API configuration
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const NEXT_PUBLIC_ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
  fromAddress?: string;
}) {
  try {
    const {
      to,
      subject,
      html,
      fromName = "Bombay Blokes",
      fromAddress = "hello@bombayblokes.com",
    } = options;

    // Handle multiple recipients case
    const recipients = Array.isArray(to) ? to : [to];

    // Send to each recipient via OneSignal
    const results = await Promise.all(
      recipients.map((recipient) =>
        sendOneSignalEmail(recipient, subject, html, fromName, fromAddress)
      )
    );

    // Check if any emails failed
    const anyFailed = results.some((result) => result.error !== null);

    if (anyFailed) {
      const errors = results
        .filter((result) => result.error !== null)
        .map((result) => result.error?.message);

      return {
        data: null,
        error: { message: `Failed to send email: ${errors.join(", ")}` },
      };
    }

    return { data: { id: "email_sent" }, error: null };
  } catch (error) {
    console.error("Error sending email:", error);
    return { data: null, error: { message: (error as Error).message } };
  }
}

async function sendOneSignalEmail(
  to: string,
  subject: string,
  htmlBody: string,
  fromName: string = "Bombay Blokes",
  fromAddress: string = "hello@bombayblokes.com"
) {
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: NEXT_PUBLIC_ONESIGNAL_APP_ID,
        include_email_tokens: [to],
        email_subject: subject,
        email_body: htmlBody,
        email_from_name: fromName,
        email_from_address: fromAddress,
        name: subject,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { data, error: null };
    } else {
      return {
        data: null,
        error: { message: data.errors?.[0] || "Email sending failed" },
      };
    }
  } catch (error) {
    console.error("OneSignal API error:", error);
    return { data: null, error: { message: (error as Error).message } };
  }
}
