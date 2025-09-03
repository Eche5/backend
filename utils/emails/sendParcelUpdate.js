const sendParcelUpdateTemplate =  (
  first_name,
  tracking_number,
  state,
  item_name,
  quantity,
  parcel_weight
) => {
  const dropOffLocations = [
    {
      city: "Yaba",
      state: "Lagos",
      address:
        "Shop A3039, 2nd Floor, Tejuosho Ultra Modern Market, Phase 1, Yaba, Lagos State",
      note: "Staff are not permitted to leave the office to receive parcels outside.",
      hours: "Offices are open from 9 am to 5 pm.",
      contact: {
        locationName: "Lagos",
        phone: "08141892503",
      },
    },
    {
      city: "Port Harcourt",
      state: "Rivers",
      address: "HONEYMOON PLAZA, No 14 Rumuola Rd, Rurowolukwo, Port Harcourt",
      note: "Staff are not permitted to leave the office to receive parcels outside.",
      hours: "Offices are open from 9 am to 5 pm.",
      contact: {
        locationName: "PHC",
        phone: "07055557661",
      },
    },
    {
      city: "Abuja",
      state: "Abuja Federal Capital Territory",
      address:
        "Suite BX2, Ground Floor, Zitel Plaza, located beside Chida Hotel Utako",
      note: "Staff are not permitted to leave the office to receive parcels outside.",
      hours: "Offices are open from 9 am to 5 pm.",
      contact: {
        locationName: "Abuja",
        phone: "08137167867",
      },
    },
  ];

  const location = dropOffLocations.find((loc) => loc.state === state);
  const locationDetails = location
    ? `${location.address}. ${location.note} ${location.hours} Contact: ${location.contact.locationName} - ${location.contact.phone}`
    : "Please check with our nearest office for drop-off locations.";

  const subject = `Shipment Confirmed - Tracking #${tracking_number}`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
    <div style="background: #012152; padding: 18px; text-align: center; color: #fff;">
      <h2 style="margin: 0; font-size: 20px;">Shipment Confirmation</h2>
    </div>

    <div style="padding: 20px;">
      <p>Dear <strong>${first_name}</strong>,</p>
      <p>Your shipment with tracking number <strong>${tracking_number}</strong> has been confirmed. 
      Kindly ensure to write the tracking number on your parcel before bringing it to our office.</p>

      <p><strong>Drop-off Location:</strong><br/>${locationDetails}</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Item Name</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${item_name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Weight</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${parcel_weight}kg</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Quantity</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${quantity}</td>
        </tr>
      </table>

      <p>Yours sincerely,<br/><strong>Pickupman</strong></p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;"/>
      <p><strong>PICKUPMAN LOGISTICS</strong><br/>
      Pickupman House<br/>
      Suite BX2, Ground Floor, Zitel Plaza,<br/>
      Beside Chida Hotel Utako<br/>
      Tel: 08146684422<br/>
      Email: support@pickupmanng.ng<br/>
      Website: <a href="http://www.pickupmanng.ng">www.pickupmanng.ng</a></p>

      <p style="font-size: 12px; color: #888;">
        <strong>DISCLAIMER:</strong> This is a no-reply email. This message, including any attachments, 
        is intended solely for the designated recipient(s) and may contain confidential or privileged information. 
        Unauthorized use, disclosure, or distribution is prohibited. If you received this in error, 
        please notify the sender immediately and delete it permanently from your system. 
        For inquiries, contact <a href="mailto:support@pickupmanng.ng">support@pickupmanng.ng</a>.
      </p>
    </div>

    <div style="background: #012152; color: white; padding: 12px; text-align: center; font-size: 12px;">
      <p style="margin: 0;">Thank you for choosing Pickupman Logistics.</p>
    </div>
  </div>
  `;

  return { subject, html };
};

module.exports = { sendParcelUpdateTemplate };
