const PDFDocument = require('pdfkit');

class InvoiceService {
  /**
   * Helper to format numbers in Indian Rupee format (e.g. ₹ 2,351.00)
   */
  formatCurrency(num) {
    const val = Number(num || 0).toFixed(2);
    const [intPart, decPart] = val.split('.');
    const lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    const formattedInt = otherNumbers !== '' 
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree 
      : lastThree;
    return `₹ ${formattedInt}.${decPart}`;
  }

  /**
   * Convert number to words in Indian Numbering format
   */
  numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if ((n = n.toString()).length > 9) return 'overflow';
      const nArr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!nArr) return '';
      let str = '';
      str += (Number(nArr[1]) !== 0) ? (a[Number(nArr[1])] || b[nArr[1][0]] + ' ' + a[nArr[1][1]]) + 'Crore ' : '';
      str += (Number(nArr[2]) !== 0) ? (a[Number(nArr[2])] || b[nArr[2][0]] + ' ' + a[nArr[2][1]]) + 'Lakh ' : '';
      str += (Number(nArr[3]) !== 0) ? (a[Number(nArr[3])] || b[nArr[3][0]] + ' ' + a[nArr[3][1]]) + 'Thousand ' : '';
      str += (Number(nArr[4]) !== 0) ? (a[Number(nArr[4])] || b[nArr[4][0]] + ' ' + a[nArr[4][1]]) + 'Hundred ' : '';
      str += (Number(nArr[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(nArr[5])] || b[nArr[5][0]] + ' ' + a[nArr[5][1]]) : '';
      return str.trim();
    };

    const integerPart = Math.floor(num || 0);
    const words = inWords(integerPart);
    return `Rupees ${words} Only`;
  }

  /**
   * Generate vector PDF stream for B2B GST Telecom Tax Invoice
   */
  generateInvoicePdf(invoiceData) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    const redColor = '#E31E24';
    const darkColor = '#111827';
    const grayColor = '#6B7280';
    const lightBg = '#F8FAFC';
    const borderColor = '#E2E8F0';

    const {
      invoiceNumber = 'ACCEL/2026/B2B-INV-8921',
      invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      billingPeriod = '01 Nov 2026 to 30 Nov 2026',
      placeOfSupply = '07 - Delhi NCR',
      reverseCharge = 'No',
      supplier = {
        legalName: 'Accel Telecom Limited (B2B Division)',
        brand: 'Accel Business | Airtel SYNC 2026',
        address: 'Airtel SYNC Technology Park, Plot 16, Udyog Vihar, Sector 18, Gurgaon, Haryana - 122015',
        gstin: '07AAACA0123M1Z2',
        stateCode: '07 - Delhi Circle',
        email: 'enterprise-billing@accel.com',
      },
      customer = {
        legalName: 'Gupta Enterprises Pvt Ltd',
        tradeName: 'Gupta Supermart',
        address: 'Shop 14, Main Market, Sector 18, Noida, Uttar Pradesh - 201301',
        gstin: '07AAAAA0000A1Z5',
        udyamNumber: 'UDYAM-UP-28-0012345',
        stateCode: '09 - Uttar Pradesh',
        phone: '9810123456',
        email: 'contact@guptasupermart.in',
        circuitId: 'ACCEL-NCR-9912',
        staticIp: '103.24.188.42',
      },
      items = [
        {
          desc: 'Accel Biz Fibre 200M Broadband (Unlimited Enterprise Data)',
          sac: '998412',
          qty: 1,
          rate: 1999.00,
          discount: 100.00,
          taxable: 1899.00,
        },
        {
          desc: 'POS Digital Gateway M2M Corporate SIM (Unlimited CUG)',
          sac: '998413',
          qty: 1,
          rate: 299.00,
          discount: 0.00,
          taxable: 299.00,
        },
        {
          desc: 'WhatsApp Business API Starter (1,000 automated sessions/mo)',
          sac: '998422',
          qty: 1,
          rate: 153.00,
          discount: 0.00,
          taxable: 153.00,
        },
      ],
      taxableValue = 2351.00,
      cgstRate = 9,
      cgstAmount = 211.59,
      sgstRate = 9,
      sgstAmount = 211.59,
      totalAmount = 2774.18,
    } = invoiceData;

    // --- 1. TOP HEADER BRAND BANNER ---
    doc.rect(40, 40, 515, 65).fill(darkColor);

    // Red Accent Strip
    doc.rect(40, 40, 6, 65).fill(redColor);

    // Brand Name & Title
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('ACCEL TELECOM LIMITED', 58, 52);
    doc.fontSize(8).font('Helvetica').fillColor('#94A3B8').text('B2B Enterprise Services • Airtel Business & Project Udyam Digital', 58, 72);
    doc.fontSize(7).fillColor('#CBD5E1').text('DoT License: DL-B2B-DOT-2024-9912 | Corporate Identity: U64200DL2024PLC001234', 58, 84);

    // Tax Invoice Badge
    doc.rect(420, 52, 120, 24).fill(redColor);
    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('TAX INVOICE', 438, 59);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text('Original for Recipient', 450, 82);

    // --- 2. INVOICE META BAR ---
    let y = 115;
    doc.rect(40, y, 515, 34).fill(lightBg).stroke(borderColor);
    
    doc.fillColor(darkColor).fontSize(8).font('Helvetica-Bold').text('Invoice No:', 48, y + 8);
    doc.font('Helvetica').fillColor(redColor).text(invoiceNumber, 102, y + 8);

    doc.fillColor(darkColor).font('Helvetica-Bold').text('Invoice Date:', 220, y + 8);
    doc.font('Helvetica').fillColor(darkColor).text(invoiceDate, 280, y + 8);

    doc.fillColor(darkColor).font('Helvetica-Bold').text('Billing Cycle:', 375, y + 8);
    doc.font('Helvetica').fillColor(darkColor).text(billingPeriod, 432, y + 8);

    doc.fillColor(grayColor).fontSize(7).font('Helvetica').text('Place of Supply: ' + placeOfSupply + '  |  Reverse Charge Applicable: ' + reverseCharge, 48, y + 21);
    doc.text('Circuit ID: ' + (customer.circuitId || 'ACCEL-NCR-9912') + '  |  Static IP: ' + (customer.staticIp || '103.24.188.42'), 330, y + 21);

    // --- 3. SUPPLIER VS RECIPIENT DUAL BOXES ---
    y = 160;
    const boxW = 250;
    const boxH = 95;

    // Supplier Box (Left)
    doc.rect(40, y, boxW, boxH).stroke(borderColor);
    doc.rect(40, y, boxW, 16).fill('#F1F5F9');
    doc.fillColor(darkColor).fontSize(8).font('Helvetica-Bold').text('SUPPLIER (ACCEL TELECOM B2B)', 46, y + 4);
    
    doc.fillColor(darkColor).fontSize(8).font('Helvetica-Bold').text(supplier.legalName, 46, y + 22);
    doc.fontSize(7).font('Helvetica').fillColor(grayColor);
    doc.text(supplier.address, 46, y + 33, { width: 238 });
    doc.fillColor(darkColor).font('Helvetica-Bold').text('GSTIN: ', 46, y + 62);
    doc.font('Helvetica').text(supplier.gstin + ' (' + supplier.stateCode + ')', 80, y + 62);
    doc.font('Helvetica').fillColor(grayColor).text('Email: ' + supplier.email, 46, y + 74);

    // Customer Box (Right)
    doc.rect(305, y, boxW, boxH).stroke(borderColor);
    doc.rect(305, y, boxW, 16).fill('#F1F5F9');
    doc.fillColor(darkColor).fontSize(8).font('Helvetica-Bold').text('RECIPIENT / BILLED TO (MSME SUBSCRIBER)', 311, y + 4);

    doc.fillColor(darkColor).fontSize(8).font('Helvetica-Bold').text(customer.tradeName || customer.legalName, 311, y + 22);
    doc.fontSize(7).font('Helvetica').fillColor(grayColor);
    doc.text(customer.address, 311, y + 33, { width: 238 });
    doc.fillColor(darkColor).font('Helvetica-Bold').text('GSTIN: ', 311, y + 62);
    doc.font('Helvetica').fillColor(redColor).text(customer.gstin || 'Unregistered MSME', 345, y + 62);
    doc.fillColor(darkColor).font('Helvetica-Bold').text('Udyam: ', 311, y + 74);
    doc.font('Helvetica').fillColor(darkColor).text(customer.udyamNumber || 'N/A', 348, y + 74);

    // --- 4. ITEMIZED SERVICE CHARGES TABLE ---
    y = 268;
    const tableHeaderH = 20;

    // Table Header Row
    doc.rect(40, y, 515, tableHeaderH).fill(redColor);
    doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
    doc.text('#', 46, y + 6);
    doc.text('Service & Tariff Description', 65, y + 6);
    doc.text('SAC Code', 265, y + 6);
    doc.text('Qty', 320, y + 6);
    doc.text('Rate', 355, y + 6);
    doc.text('Discount', 415, y + 6);
    doc.text('Taxable Value', 480, y + 6);

    y += tableHeaderH;
    let index = 1;

    items.forEach((item) => {
      const rowH = 22;
      const isEven = index % 2 === 0;
      doc.rect(40, y, 515, rowH).fill(isEven ? '#FAFAFA' : '#FFFFFF').stroke(borderColor);

      doc.fillColor(darkColor).fontSize(7.5).font('Helvetica');
      doc.text(index.toString(), 46, y + 7);
      doc.font('Helvetica-Bold').text(item.desc, 65, y + 7, { width: 195, height: rowH });
      doc.font('Helvetica').fillColor(grayColor).text(item.sac || '998412', 265, y + 7);
      doc.fillColor(darkColor).text((item.qty || 1).toString(), 324, y + 7);
      doc.text(this.formatCurrency(item.rate), 350, y + 7);
      doc.fillColor('#16A34A').text(item.discount > 0 ? `-${this.formatCurrency(item.discount)}` : '₹ 0.00', 415, y + 7);
      doc.fillColor(darkColor).font('Helvetica-Bold').text(this.formatCurrency(item.taxable), 475, y + 7);

      y += rowH;
      index++;
    });

    // --- 5. TAX BREAKDOWN & GRAND TOTAL ---
    y += 8;
    const totalBoxX = 330;
    const totalBoxW = 225;

    doc.rect(totalBoxX, y, totalBoxW, 110).stroke(borderColor);

    const printLine = (label, value, isBold = false, color = darkColor, topOffset = 0) => {
      doc.fillColor(color).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(isBold ? 9 : 8);
      doc.text(label, totalBoxX + 10, y + topOffset);
      doc.text(value, totalBoxX + 130, y + topOffset, { width: 85, align: 'right' });
    };

    printLine('Total Taxable Value:', this.formatCurrency(taxableValue), false, darkColor, 8);
    printLine(`CGST (${cgstRate}.0%):`, this.formatCurrency(cgstAmount), false, grayColor, 26);
    printLine(`SGST (${sgstRate}.0%):`, this.formatCurrency(sgstAmount), false, grayColor, 44);
    
    // Total Red Highlight Bar
    doc.rect(totalBoxX, y + 68, totalBoxW, 42).fill(redColor);
    printLine('Grand Total Payable:', this.formatCurrency(totalAmount), true, '#FFFFFF', 78);
    doc.fillColor('#FEE2E2').fontSize(7).font('Helvetica').text('(Includes 18% Input Tax Credit)', totalBoxX + 10, y + 96);

    // Left Box: Amount in Words & Bank Payment Details
    const leftBoxW = 275;
    doc.rect(40, y, leftBoxW, 110).stroke(borderColor);
    doc.rect(40, y, leftBoxW, 16).fill('#F1F5F9');
    doc.fillColor(darkColor).fontSize(8).font('Helvetica-Bold').text('AMOUNT IN WORDS & PAYMENT DETAILS', 46, y + 4);

    doc.fillColor(darkColor).fontSize(8).font('Helvetica-Bold').text('Amount (in words):', 46, y + 24);
    doc.font('Helvetica').fontSize(7.5).fillColor(grayColor).text(this.numberToWords(totalAmount), 46, y + 36, { width: 260 });

    doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(7.5).text('Bank Remittance Account (Virtual CMS):', 46, y + 60);
    doc.font('Helvetica').fontSize(7).fillColor(grayColor)
      .text('A/C Name: Accel Telecom Enterprise Billing Collection', 46, y + 72)
      .text('Virtual A/C No: ACCELB2B991200' + (customer.gstin ? customer.gstin.substring(0, 8) : 'MSME01'), 46, y + 83)
      .text('IFSC Code: HDFC0000123 (RTGS/NEFT/IMPS Accepted)', 46, y + 94);

    // --- 6. REGULATORY TERMS & DIGITAL STAMP FOOTER ---
    y += 122;

    doc.rect(40, y, 360, 50).stroke(borderColor);
    doc.fillColor(darkColor).fontSize(7).font('Helvetica-Bold').text('TERMS & CONDITIONS (DoT / GST REGULATIONS):', 46, y + 6);
    doc.font('Helvetica').fillColor(grayColor).fontSize(6.5)
      .text('1. All telecom services are subject to DoT subscriber verification guidelines.', 46, y + 18)
      .text('2. Input Tax Credit (ITC) on GST is applicable strictly against valid recipient GSTIN.', 46, y + 28)
      .text('3. Invoices not settled within 15 days of due date attract interest @ 18% per annum.', 46, y + 38);

    // Digital Signatory Seal Box
    doc.rect(410, y, 145, 50).stroke(redColor);
    doc.rect(410, y, 145, 14).fill('#FEF2F2');
    doc.fillColor(redColor).fontSize(7).font('Helvetica-Bold').text('DIGITALLY SIGNED', 442, y + 4);
    doc.fillColor(darkColor).fontSize(6.5).font('Helvetica')
      .text('Authorized Signatory', 418, y + 20)
      .text('Accel Telecom B2B Division', 418, y + 30)
      .text('Timestamp: ' + new Date().toISOString(), 418, y + 40);

    // Bottom Watermark
    doc.fontSize(6.5).fillColor('#94A3B8').text(
      'Accel Business Enterprise Gateway — B2B Telecom & Digital Services. Computer-generated official tax invoice under Section 31 of CGST Act 2017.',
      40,
      y + 60,
      { align: 'center', width: 515 }
    );

    doc.end();
    return doc;
  }
}

module.exports = new InvoiceService();

