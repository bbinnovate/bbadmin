import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email-sender";
import quotationTableHTML from "@/lib/quotationTableHTML";

/* =====================================================
   POST: Calculator Form Submit (Draft + Final)
===================================================== */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      email,
      quote,
      total,
      estimateId,
      serviceCalculator,
      finalPrice,
    } = body;

    /* =====================================================
       DETECT FINAL SUBMIT
    ===================================================== */
    const isFinalSubmit =
      typeof name === "string" &&
      name.trim().length > 0 &&
      typeof phone === "string" &&
      phone.trim().length > 0 &&
      typeof email === "string" &&
      email.trim().length > 0;

    /* =====================================================
       BASIC VALIDATION (ALLOW DRAFT)
    ===================================================== */
    if (
      !Array.isArray(quote) ||
      quote.length === 0 ||
      typeof total !== "number" ||
      !serviceCalculator
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    if (isFinalSubmit && !email) {
      return NextResponse.json(
        { success: false, message: "Email required for final submit" },
        { status: 400 }
      );
    }

    const collectionRef = adminDB.collection("calculatorApplications");

    /* =====================================================
       CREATE / UPDATE FIRESTORE
    ===================================================== */
    let docId = estimateId;

    if (!estimateId) {
      const docRef = await collectionRef.add({
        name: name || "N/A",
        phone: phone || "N/A",
        email: email || "N/A",
        quote,
        total,
        finalPrice,
        serviceCalculator,
        draftEmailSent: false,
        createdAt: new Date(),
      });
      docId = docRef.id;
    } else {
      const docRef = collectionRef.doc(estimateId);
      const snap = await docRef.get();

      if (!snap.exists) {
        const newDoc = await collectionRef.add({
          name: name || "N/A",
          phone: phone || "N/A",
          email: email || "N/A",
          quote,
          total,
          finalPrice,
          serviceCalculator,
          draftEmailSent: false,
          createdAt: new Date(),
        });
        docId = newDoc.id;
      } else {
        await docRef.update({
          name: name || "N/A",
          phone: phone || "N/A",
          email: email || "N/A",
          quote,
          total,
          finalPrice,
          serviceCalculator,
          updatedAt: new Date(),
        });
      }
    }

    /* =====================================================
       FORMAT SERVICE NAME
    ===================================================== */
    const serviceNameTitle = serviceCalculator
      .trim()
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    /* =====================================================
       ADMIN DRAFT EMAIL (NO CONTACT DETAILS)
    ===================================================== */
    if (!isFinalSubmit) {
      const docSnap = await collectionRef.doc(docId).get();

      if (!docSnap.data()?.draftEmailSent) {
        await sendEmail({
          to: "aryankuril09@gmail.com",
          subject: `Inquiry - ${serviceNameTitle}`,
          html: `
            <p><strong>Name:</strong> ${name || 'N/A'} </p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Service:</strong> ${serviceCalculator}</p>
            <p><strong>Final Price:</strong> ₹${Number(finalPrice).toLocaleString('en-IN')}</p>
            ${quotationTableHTML(quote, total)}
          `,
          fromName: "Calculator Draft",
          fromAddress: "hello@bombayblokes.com",
        });

        await collectionRef.doc(docId).update({
          draftEmailSent: true,
        });
      }
    }

    /* =====================================================
       USER EMAIL (FINAL SUBMIT ONLY)
    ===================================================== */
    if (isFinalSubmit) {
      await sendEmail({
        to: email,
        subject: `Your ${serviceNameTitle} Quotation From Bombay Blokes`,
        html: `
          <!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
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
                      <p style="margin:0; font-size:14px; color:#333; text-transform: capitalize; ">
                        Thanks for checking out  our Website Cost Calculator!Based on the choices you made, here’s your customized project quotation, 
                         <span style="color:#F7B21A;" > clear,simple, </span>
                        
                        and 
                        <span style="color:#F7B21A;" > transparent. </span>
                      </p>
                    </td>
                  </tr>

                  <!-- dotted separator -->
                  <tr>
                    <td style="padding:6px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>

                  <!-- Details-->
                  <tr>
                    <td style="padding:8px 0 6px 0;">
                      <h3 style="margin:0; font-size:18px; font-weight:700;">Here’s what details you submitted:</h3>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top:5px; padding-bottom:10px;">
                      <table width="100%" style="font-size:14px;">
  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Name:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${name || 'N/A'} </span>
    </td>
  </tr>

  <tr>
    <td style="padding:6px 0;">
      <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
      <strong>Phone:</strong>
      <span style=" color:#555555 ; text-transform: capitalize;" >${phone || 'N/A'} </span>
    </td>
  </tr>



  <tr>
 <td style="padding:6px 0; vertical-align:top;">
  <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span>
  <strong>Email:</strong>
  <a style="color:#555555 !important; text-decoration:none !important; margin-left:6px;">
    ${email || 'N/A'}
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



                  <!-- Quatation-->
                  <tr>
                    <td style="padding:8px 0 6px 0;">
                      <h3 style="margin:0; font-size:18px; font-weight:700;">Here’s what details you submitted:</h3>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top:5px; padding-bottom:10px;">
                      <table width="100%" style="font-size:14px;">
  <tbody>
    ${quote
      .map((item, index) => {
        const isLast = index === quote.length - 1;

        return `
          <tr>
           <td style="padding:8px; ${!isLast ? "border-bottom:1px solid #eee;" : ""}">
  ${item.type
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")} - 
  ${item.value
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")}
</td>


            <td style="padding:8px; text-align:right; ${!isLast ? "border-bottom:1px solid #eee;" : ""}">
              ₹${Number(item.price).toLocaleString("en-IN")}
            </td>
          </tr>
        `;
      })
      .join("")}
  </tbody>
</table>


                    </td>
                  </tr>


                   <!-- dotted separator -->
                  <tr>
                    <td style="padding:6px 0;">
                      <div style="border-top:2px dotted #F4C882; width:100%;"></div>
                    </td>
                  </tr>



                  <tr>
                    <td style="padding:8px 0 6px 0;">
                      <h3 style="margin:0; font-size:18px; font-weight:700;">Estimated Project Cost</h3>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding-top:5px; padding-bottom:10px;">
                      <table width="100%" style="font-size:14px;">
  <tr>
    <td style="padding:6px 0;">
      <td style="padding:8px; text-align:left; font-weight:bold; font-size:20px;">₹${Number(total).toLocaleString(
              "en-IN"
            )}</td>
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


                  <!-- Work CTA -->
                  <tr>
                     <td style="padding-top:10px; padding-bottom:10px;">
                      <p style="margin:0; font-size:18px; font-weight:700;">Since you’re interested in Website, here is our Portfolio:</p>
                      

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


                  <!-- What Happens Next -->
                  <tr>
                     <td style="padding-top:14px; padding-bottom:10px;">
                      <h4 style="font-size:16px; margin:0 0 6px;">What Happens Next?</h4>

                      <p style="margin:0; font-size:14px; color:#333333; line-height:20px;">
                        A member of our team will get in touch with you within 24 hours to:
                      </p>
                      <table style="font-size:14px;">
                        <tr><td style="padding:6px 0;"> <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span> Discuss your project requirements</td></tr>
                        <tr><td style="padding:6px 0;"> <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span> Share timelines and strategy</td></tr>
                        <tr><td style="padding:6px 0;"> <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span> Answer any questions</td></tr>
                        <tr><td style="padding:6px 0;"> <span style="display:inline-block; width:4px; height:4px; background:#000; border-radius:50%; margin-right:10px;"></span> Finalise the proposal</td></tr>
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
                      <p style="margin:12px 0 6px 0; font-size:14px; color:#222222;"><strong>If you’d like to move faster, feel free to contact us anytime:: <br/> Reach us anytime:</strong></p>

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
                        Let’s build something that performs, not just looks good.
                      </p>
                      <p style="font-size:14px;">
                        Cheers,<br/>Team Bombay Blokes<br/>
                        🌐 <a href="https://bombayblokes.com" style="color:#222222 !important; " >bombayblokes.com</a>
                      </p>
                       
                      <span style="font-size:12px;">
                        <a href="https://www.instagram.com/bombay_blokes/?hl=en" style=" color:#222222 !important;">Instagram</a> &nbsp; | &nbsp;
                        <a href="https://www.facebook.com/bombayblokes/" style=" color:#222222 !important; ">Facebook</a> &nbsp; | &nbsp;
                        <a href="https://www.linkedin.com/company/bombay-blokes-digital-solutions-llp/?originalSubdomain=in" style=" color:#222222 !important;">LinkedIn</a>
                      </span>import { quotationTableHTML } from '@/lib/quotationTableHTML';
import { quotationTableHTML } from '@/lib/quotationTableHTML';

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
        `,
        fromName: "Bombay Blokes",
        fromAddress: "hello@bombayblokes.com",
        replyTo: "hello@bombayblokes.com",
      });
    }

    /* =====================================================
       ADMIN FINAL EMAIL
    ===================================================== */
    if (isFinalSubmit) {
      await sendEmail({
        to: "aryankuril09@gmail.com",
        subject: `Inquiry - ${serviceNameTitle}`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Service:</strong> ${serviceNameTitle}</p>
          <p><strong>Final Price:</strong> ₹${Number(finalPrice).toLocaleString(
            "en-IN"
          )}</p>
          ${quotationTableHTML(quote, total)}
        `,
        fromName: "Calculator Submission",
        fromAddress: "hello@bombayblokes.com",
        replyTo: email,
      });
    }

    return NextResponse.json({
      success: true,
      estimateId: docId,
      message: "Form processed successfully",
    });
  } catch (error) {
    console.error("❌ Calculator API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
