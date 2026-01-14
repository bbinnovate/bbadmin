// lib/quotationTableHTML.js

const quotationTableHTML = (quote, total) => {
  if (!Array.isArray(quote) || quote.length === 0) {
    return "<p>No quotation items available.</p>";
  }


  const titleCase = (str = "") =>
  str
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");


  return `
    <div style="margin-top:20px; width:50%; padding:15px; border:1px solid #ddd; border-radius:8px; background:#f9f9f9;">
      <h3 style="margin:0 0 10px 0; font-size:16px; color:#333;">Quotation Summary</h3>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left; border-bottom:1px solid #ccc; padding:8px;">Question</th>
            <th style="text-align:center; border-bottom:1px solid #ccc; padding:8px;">Option</th>
            <th style="text-align:right; border-bottom:1px solid #ccc; padding:8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${quote
            .map(
              (item) => `
            <tr>
              <td style="padding:8px; border-bottom:1px solid #eee;">${titleCase(item.type)} - ${item.label ? titleCase(item.label) : ""}</td>
              <td style="padding:8px; text-align:center; border-bottom:1px solid #eee;">${titleCase(item.value)}</td>
              <td style="padding:8px; text-align:right; border-bottom:1px solid #eee;">₹${Number(
                item.price
              ).toLocaleString("en-IN")}</td>
            </tr>`
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:8px; text-align:left; font-weight:bold;">Estimated Cost:</td>
            <td style="padding:8px; text-align:right; font-weight:bold;">₹${Number(total).toLocaleString(
              "en-IN"
            )}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
};

export default quotationTableHTML;
