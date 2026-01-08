import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-sender";
import { uploadFileToFirebase, base64ToBuffer } from "@/lib/firebase-upload";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Career API: Received application request");
    const body = await request.json();
    const {
      ticketName,
      email,
      phone,
      cv,
      portfolio,
      message,
      jobTitle,
      availability,
    } = body;

    if (!ticketName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ===== Upload CV to Firebase Storage =====
    let cvUrl = "";
    let cvFilename = "";
    let cvSize = 0;

    if (cv && cv.data && cv.filename) {
      try {
        const cvBuffer = base64ToBuffer(cv.data);
        const uploadedFile = await uploadFileToFirebase(
          cvBuffer,
          cv.filename,
          "cvs"
        );
        cvUrl = uploadedFile.url;
        cvFilename = uploadedFile.filename;
        cvSize = uploadedFile.size;
      } catch (uploadError) {
        console.error("❌ CV upload error:", uploadError);
        const errorMessage =
          uploadError instanceof Error ? uploadError.message : "Unknown error";
        return NextResponse.json(
          { error: `Failed to upload CV: ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    // ===== Send confirmation email to user =====
    // const htmlTemplate = `
    //   <p>Hi ${ticketName},</p>
    //   <p>Thank you for applying for the position of <b>${jobTitle || "our team"}</b>.</p>
    //   <p>We have received your application and will get back to you soon.</p>
    //   <p>— Bombay Blokes</p>
    // `;



        const htmlTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Bombay Blokes — Thanks for reaching out</title>

    
  </head>
  <body style="margin:0; padding:0; background-color:#ffffff; -webkit-font-smoothing:antialiased;">
    <!-- outer wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#ffffff;">
      <tr>
        <td align="center">

          <!-- container (max width for email clients) -->
          <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="
            width:600px;
            max-width:600px;
            font-family: 'Arial', Helvetica, sans-serif;
            color:#222222;
            border: #fab31e 2px solid;
  border-top-left-radius:20px;
  border-top-right-radius:20px;
  border-bottom-left-radius:0;
  border-bottom-right-radius:0;
          ">

            <!-- background area with subtle sketch (use a light artwork/bg image) -->
            <tr>
            <td background="https://blokesarea.com/wp-content/uploads/2025/12/Email-Background.png"
    style="
      background-position: top center;
      background-repeat: no-repeat;
      background-size: cover;
      -webkit-background-size: cover;
      -moz-background-size: cover;
      -o-background-size: cover;
      padding:30px 16px 20px 16px;
    "
  >

                <!-- Top heading -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <style type="text/css">
  @font-face {
    font-family: 'Miso';
    font-style: normal;
    font-weight: 400;
    src: url('https://fonts.cdnfonts.com/s/14095/Miso.woff') format('woff');
  }
  @font-face {
    font-family: 'Miso';
    font-style: normal;
    font-weight: 700;
    src: url('https://fonts.cdnfonts.com/s/14095/Miso-Bold.woff') format('woff');
  }
</style>

                 <tr>
  <td style="padding-bottom:10px;">
    <span style="display:block; font-size:34px; line-height:36px; color:#F7B21A; font-weight:700; font-family: 'Miso', Arial, sans-serif;">
      Hey!!
    </span>

    <span style="display:block; font-size:40px; line-height:44px; color:#000000; font-weight:700; letter-spacing:1px; font-family: 'Miso', Arial, sans-serif;">
      Bombay Blokes Here...
    </span>
  </td>
</tr>


                   <!-- dotted separator -->
                  <tr>
                    <td style="padding:14px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- small thank you -->
                  <tr>
                    <td style="padding-top:10px; padding-bottom:18px;">
                      <p style="margin:0; font-size:14px; line-height:20px; color:#333333;">
                        Thanks for applying to be a part of our team! <br />We’ve successfully received your application, and our hiring team is currently reviewing your profile.


                      </p>
                    </td>
                  </tr>

                  <!-- dotted separator -->
                  <tr>
                    <td style="padding:14px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- "Here's What You Submitted:" -->
                  <tr>
                    <td style="padding:8px 0 6px 0;">
                      <h3 style="margin:0; font-size:18px; color:#222222; font-weight:700;">Here’s a quick snapshot of what we got from you:</h3>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top:10px; padding-bottom:10px;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px; color:#444444;">
                        <tr>
                          <td style="padding:6px 0; vertical-align:top;">
                               <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
                            <strong>Name:</strong>
                            <span style="color:#555555; margin-left:6px; text-transform: capitalize;">${ticketName}</span>
                          </td>
                        </tr>
                      <tr>
                          <td style="padding:6px 0; vertical-align:top;">
  <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
  <strong>Email:</strong>
  <a style="color:#555555 !important; text-decoration:none !important; margin-left:6px;">
    ${email}
  </a>
</td>

                        </tr>
                        <tr>
                          <td style="padding:6px 0; vertical-align:top;">
                             <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
                            <strong>Phone:</strong>
                            <span style="color:#555555; margin-left:6px;">${phone}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0; vertical-align:top;">
                             <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
                            <strong>Role Applied For:</strong>
                       <span style="color:#555555; margin-left:6px;">${jobTitle || "our team"}</span>
                          </td>
                        </tr>
                        
                      </table>
                    </td>
                  </tr> 

                  <!-- dotted separator -->
                  <tr>
                    <td style="padding:14px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- Portfolio CTA -->
                  <tr>
                    <td style="padding:8px 0 18px 0;">
                      <p style="margin:0 0 8px 0; font-size:15px; color:#222222;">
                       While we review your profile, take a look at our work and culture:
                      </p>

                      <!-- button (pill) -->
                      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:6px; font-size:14px;">
  <tr>
    <td style="padding:4px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
                      <a href="https://www.bombayblokes.com/aboutus" 
   style="color:#F7B21A !important; text-decoration:underline; display:inline-block; font-weight:bold;">
  About Us
</a>

    </td>
  </tr>
  <tr>
    <td style="padding:4px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <a href="https://www.bombayblokes.com/teams" 
         style="color:#F7B21A !important; text-decoration:underline; display:inline-block; font-weight:bold;">
        Our Team 
      </a>
    </td>
  </tr> 
</table>

                    </td>
                  </tr>

                  <!-- dotted separator -->
                  <tr>
                    <td style="padding:18px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- What happens next -->
                   <tr>
                    <td style="padding:6px 0;">
                      <h4 style="margin:0 0 8px 0; font-size:16px; color:#222222;">What Happens Next?</h4>
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px; color:#333333;">
                        <tr>
                          <td style="padding:6px 0;">• &nbsp; Our Team Will Review Your Profile Carefully.</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;">• &nbsp; Shortlisted Candidates Will Be Contacted Within 3–5 Working Days.</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;">• &nbsp; You May Be Asked For An Interview Task Or A Quick Video Call.</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- contact quick -->
                  <tr>
                    <td style="padding-top:14px; padding-bottom:14px;">
                      <div style="border-top:1px dashed #F2CFA0; padding-top:12px;"></div>

                      <p style="margin:12px 0 6px 0; font-size:14px; color:#222222;"><strong>If you have any urgent updates regarding your application, feel free to <br/> Reach us at:</strong></p>

                      <table cellpadding="0" cellspacing="0" border="0" style="font-size:14px; color:#444444;">
                        <tr>
                          <td style="vertical-align:top; padding-bottom:6px;">
                            <span style="font-size:16px;">📞</span>
                          </td>
                          <td style="padding-left:8px; vertical-align:middle;">
                            <a href="tel:\${phone || '+919819167856'}" style="color:#222222; text-decoration:none;">+91 981-916-7856</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="vertical-align:top; padding-bottom:6px;">
                            <span style="font-size:16px;">✉️</span>
                          </td>
                          <td style="padding-left:8px; vertical-align:middle;">
                            <a href="mailto:\${email || 'hello@bombayblokes.com'}" style="color:#222222; text-decoration:none;">hello@bombayblokes.com</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- dotted separator -->
                  <tr>
                    <td style="padding:6px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- Thank you + signature -->
                  <tr>
                    <td style="padding-top:14px;">
                      <p style="margin:0; font-size:14px; color:#222222;">
                      We appreciate your interest in Bombay Blokes. <br/> If it’s the right fit, we’ll build something legendary together.
                      </p>

                      <p style="margin:10px 0 0 0; font-size:14px; color:#222222;">
                        Cheers,<br />
                        Team Bombay Blokes<br />
                        <span style="font-size:14px;">
  🌐 <a href="https://bombayblokes.com" style="color:#222222 !important; ">Bombayblokes.Com</a>
</span>

                      </p>
                      <div style="padding-top:8px;">
                      </div>
                      <span style="font-size:12px;">
                        <a href="https://www.instagram.com/bombay_blokes/?hl=en" style=" color:#222222 !important;">Instagram</a> &nbsp; | &nbsp;
                        <a href="https://www.facebook.com/bombayblokes/" style=" color:#222222 !important; ">Facebook</a> &nbsp; | &nbsp;
                        <a href="https://www.linkedin.com/company/bombay-blokes-digital-solutions-llp/?originalSubdomain=in" style=" color:#222222 !important;">LinkedIn</a>
                      </span>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>

            <!-- footer banner image (big gold 10 years banner from site) -->
            <tr>
              <td style="padding:0; margin:0;">
                <img src="https://blokesarea.com/wp-content/uploads/2025/12/email-signature-2.png"
                  alt="Bombay Blokes - 10 years" width="600" style="display:block; width:100%; max-width:600px; height:auto; border:0;"/>
              </td>
            </tr>

            <!-- small company info row under banner 
            <tr>
              <td style="padding:14px 20px 24px 20px; font-size:12px; color:#777777; line-height:18px;">
                <div style="padding-top:8px;">
                  <span style="font-size:12px;">
                    <a href="https://www.instagram.com/bombay_blokes/?hl=en" style="text-decoration:none;">Instagram</a> &nbsp; | &nbsp;
                    <a href="https://www.facebook.com/bombayblokes/" style="text-decoration:none;">Facebook</a> &nbsp; | &nbsp;
                    <a href="https://www.linkedin.com/company/bombay-blokes-digital-solutions-llp/?originalSubdomain=in" style="text-decoration:none;">LinkedIn</a>
                  </span>
                </div>
                <div style="margin-top:10px; color:#AAAAAA; font-size:11px;">
                  <em>Confidentiality Note:</em> This email may contain confidential and/or private information. If you received this email in error please delete and notify sender.
                </div>
              </td>
            </tr>  -->

          </table>
          <!-- /container -->

        </td>
      </tr>
    </table>
  </body>
</html>
`;

    await sendEmail({
      to: email,
      subject: "You’re On Our Radar 👀 | Bombay Blokes",
      html: htmlTemplate,
      fromName: "Bombay Blokes",
      fromAddress: "careers@bombayblokes.com",
    });

    // ===== Send notification email to team =====
    const teamNotification = `
      <h3>New Career Application</h3>
      <p><b>Position:</b> ${jobTitle || "Not specified"}</p>
      <p><b>Name:</b> ${ticketName}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Portfolio:</b> ${portfolio || "Not provided"}</p>
      <p><b>Availability:</b> ${availability || "Not specified"}</p>
      <p><b>Message:</b> ${message || "No message"}</p>
      ${
        cvUrl
          ? `<p><b>CV:</b> <a href="${cvUrl}" target="_blank">${cvFilename}</a></p>`
          : "<p><b>CV:</b> Not provided</p>"
      }
    `;

    await sendEmail({
      to: "careers@bombayblokes.com",
      subject: `New Application - ${ticketName} for ${jobTitle}`,
      html: teamNotification,
      fromName: "Careers Form",
      fromAddress: "careers@bombayblokes.com",
    });

    // ===== Save to Firestore =====
    await addDoc(collection(db, "careerApplications"), {
      name: ticketName,
      email,
      phone,
      jobTitle,
      message,
      portfolio,
      availability,
      cvUrl,
      cvFilename,
      cvSize,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Application saved in Firestore and emails sent");
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("❌ Career form error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit application";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
