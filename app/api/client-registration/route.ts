import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-sender";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      brandName,
      industry,
      gstin,
      services,
      contactPerson,
      email,
      phone,
      address,
      website,
    } = body;

    if (
      !companyName ||
      !industry ||
      !email ||
      !phone ||
      !services ||
      services.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }


        const formattedServices = services && services.length
  ? services.length === 1
    ? services[0]
    : services.slice(0, -1).join(", ") + " & " + services[services.length - 1]
  : "None";

const htmlTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Bombay Blokes — Onboarding Started</title>
  </head>

  <body style="margin:0; padding:0; background-color:#ffffff; -webkit-font-smoothing:antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#ffffff;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="
            width:600px;
            max-width:600px;
            font-family: 'Miso', 'Poppins', sans-serif;
            color:#222222;
            border: #fab31e 2px solid;
            border-top-left-radius:20px;
            border-top-right-radius:20px;
          ">

            <tr>
              <td background="https://blokesarea.com/wp-content/uploads/2025/12/Email-Background.png"
                style="background-position: top center; background-repeat: no-repeat; background-size: cover; padding:30px 16px 20px 16px;">

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

  @font-face {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 400;
    src: url('https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfedA.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 600;
    src: url('https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6.woff2') format('woff2');
  }
</style>


                  <!-- Heading -->
                   <tr>
  <td style="padding-bottom:10px;">
    <span style="display:block; font-size:34px; line-height:36px; color:#F7B21A; font-weight:700; font-family: 'Miso', Arial, sans-serif;">
      Hey!!
    </span>

    <span style="display:block; font-size:40px; line-height:44px; color:#000000; font-weight:700; letter-spacing:1px; font-family: 'Miso', 'Poppins', sans-serif;">
      Bombay Blokes Here...
    </span>
  </td>
</tr>

                   <!-- dotted separator -->
                  <tr>
                    <td style="padding:6px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- Intro -->
                  <tr>
                    <td style="padding-top:14px; padding-bottom:14px;">
                      <p style="margin:0; font-size:14px; color:#333;">
                        <strong>We’re excited to officially get started on your project.</strong><br/>
                        Thanks for confirming. Your journey with us now begins for real.
                      </p>
                    </td>
                  </tr>

                  <!-- dotted separator -->
                  <tr>
                    <td style="padding:6px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- Onboarding Summary -->
                  <tr>
                    <td style="padding:8px 0 6px 0;">
                      <h3 style="margin:0; font-size:18px; font-weight:700;">Onboarding Summary</h3>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top:10px; padding-bottom:10px;">
                      <table width="100%" style="font-size:14px;">
  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Registered Company Name:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${companyName}</span>
    </td>
  </tr>

  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Brand Name:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${brandName || "N/A"}</span>
    </td>
  </tr>

  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Industry:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${industry}</span>
    </td>
  </tr>

  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>GSTIN:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${gstin}</span>
    </td>
  </tr>

  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Service Chosen:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >   ${formattedServices}</span>
    </td>
  </tr>

  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Contact Person:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${contactPerson || "N/A"}</span>
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
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Phone:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${phone}</span>
    </td>
  </tr>

  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Registered Address:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${address || "N/A"}</span>
    </td>
  </tr>

<tr>
  <td style="padding:6px 0;">
    <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
    <strong>Website:</strong>

    <a 
      href="${website || '#'}"
      style="
        color:#555555 !important;
        text-decoration:underline !important;
        font-weight:normal;
      "
      target="_blank"
    >
      ${website || "N/A"}
    </a>
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


                  <!-- What Happens Next -->
                  <tr>
                     <td style="padding-top:14px; padding-bottom:10px;">
                      <h4 style="font-size:16px; margin:0 0 6px;">What Happens Next?</h4>
                      <table style="font-size:14px;">
                        <tr><td style="padding:6px 0;"> <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span> A dedicated project manager will be assigned</td></tr>
                        <tr><td style="padding:6px 0;"> <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span> You’ll receive a project timeline & milestones</td></tr>
                        <tr><td style="padding:6px 0;"> <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span> Our team will schedule a kickoff call</td></tr>
                      </table>
                    </td>
                  </tr>

                    <!-- dotted separator -->
                  <tr>
                    <td style="padding:6px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- Work CTA -->
                  <tr>
                     <td style="padding-top:10px; padding-bottom:10px;">
                      <p style="font-size:14px;">Relevant Work In   ${formattedServices} <br/> Until our kickoff call, you can explore similar projects we’ve executed</p>
                      

                      <table cellpadding="0" cellspacing="0" style="margin-top:6px;">
                        <tr>
                          <td style="background:#F9B31B; padding:0 3px 3px 0; border-radius:5px;">
                            <a href="https://www.bombayblokes.com/work"
                              style="display:block; width:130px; padding:10px 0; text-align:center; background:#000; color:#fff; text-decoration:none; border-radius:5px;">
                              Explore Projects
                            </a>
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

                  

                 <!-- contact quick -->
                  <tr>
                    <td style="padding-top:10px; padding-bottom:14px;">
                      <p style="margin:12px 0 6px 0; font-size:14px; color:#222222;"><strong>Need Anything Before the Kickoff? <br/> Reach us anytime:</strong></p>

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

                  <!-- Footer Text -->
                 <tr>
                    <td style="padding-top:10px;">
                      <p style="font-size:14px;">
                        Welcome to the Bombay Blokes family. Let’s build something unforgettable.
                      </p>
                      <p style="font-size:14px;">
                        Cheers,<br/>Team Bombay Blokes<br/>
                        🌐 <a href="https://bombayblokes.com" style="color:#222222 !important; " >bombayblokes.com</a>
                      </p>
                       
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

            <!-- Footer Banner -->
            <tr>
              <td>
                <img src="https://blokesarea.com/wp-content/uploads/2025/12/email-signature-2.png"
                     width="600" style="display:block; width:100%;">
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;


    // Send email to client
    const result = await sendEmail({
      to: email,
      subject: "Welcome To The Bombay Blokes Family!",
      html: htmlTemplate,
      fromName: "Bombay Blokes",
      fromAddress: "hello@bombayblokes.com",
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    // Send notification to team
    const teamNotification = `
      <h3>New Client Registration</h3>
      <p><strong>Company Name:</strong> ${companyName}</p>
      <p><strong>Brand Name:</strong> ${brandName || "N/A"}</p>
      <p><strong>Industry:</strong> ${industry}</p>
      <p><strong>GSTIN:</strong> ${gstin || "N/A"}</p>
      <p><strong>Services:</strong> ${services.join(", ")}</p>
      <p><strong>Contact Person:</strong> ${contactPerson || "N/A"}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address || "N/A"}</p>
      <p><strong>Website:</strong> ${website || "N/A"}</p>
    `;

    await sendEmail({
      to: "aryankuril09@gmail.com",
      subject: `New Client Registration - ${companyName}`,
      html: teamNotification,
      fromName: "Website Client Registration",
      fromAddress: "hello@bombayblokes.com",
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Client registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
