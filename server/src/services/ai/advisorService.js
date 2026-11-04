const Product = require('../../models/Product');
const env = require('../../config/env');

class AdvisorService {
  /**
   * Deterministic Expert Recommendation Matrix using Official Company Products (P01-P25)
   */
  async getRuleBasedRecommendation(profile) {
    const {
      segment = 'Micro retail & services',
      employeeCount = 3,
      hasGstin = false,
      monthlyBudget = 2500,
      requiresPaymentPos = true,
      requiresWhatsapp = true,
      language = 'en',
    } = profile;

    const allProducts = await Product.find({ isActive: true });
    const productMap = new Map(allProducts.map((p) => [p.productId, p]));

    let selectedIds = [];
    let bundleName = '';
    let reasoning = [];
    let alternatives = [];

    // Normalize segment
    const isMicro = segment.toLowerCase().includes('micro') || segment.toLowerCase().includes('retail');
    const isOffice = segment.toLowerCase().includes('office') || segment.toLowerCase().includes('prof');
    const isMulti = segment.toLowerCase().includes('multi');

    if (isMicro) {
      bundleName = 'Retail Express Smart Connect';
      // Base Fibre: P01 (Biz Fibre 100) or P02 (Biz Fibre 300)
      selectedIds.push(monthlyBudget >= 2500 ? 'P02' : 'P01');
      // Business Postpaid SIM: P07
      if (productMap.has('P07')) selectedIds.push('P07');
      // Cloud POS & Billing: P19
      if (requiresPaymentPos && productMap.has('P19')) selectedIds.push('P19');
      // WhatsApp Business API: P15
      if (requiresWhatsapp && productMap.has('P15')) selectedIds.push('P15');

      if (language === 'hi') {
        reasoning = [
          'आपकी दुकान में UPI और कार्ड पेमेंट्स बिना रुके चलाने के लिए 100/300 Mbps हाई-स्पीड फाइबर (P01/P02)।',
          'ग्राहकों को बिल और डिलीवरी अपडेट भेजने के लिए ऑफिशियल WhatsApp Business API (P15)।',
          'सप्लायर और कस्टमर कॉल्स के लिए समर्पित बिज़नेस सिम (P07)।',
          'डिजिटल बिलिंग और इन्वेंट्री के लिए Cloud POS & Billing (P19)।',
        ];
      } else {
        reasoning = [
          'High-speed Biz Fibre broadband ensures zero buffering during peak UPI and QR scan payments.',
          'Official WhatsApp Business API (P15) automates order receipts and customer promos directly.',
          'Dedicated Business Postpaid line (P07) separates vendor calls from personal lines.',
          'Cloud POS & Billing (P19) enables instant tablet-based billing and inventory tracking.',
        ];
      }

      alternatives = [
        {
          name: 'Economy Kirana Starter',
          productIds: ['P01', 'P07'],
          estimatedMrc: 1298,
          difference: 'Budget-friendly 100 Mbps broadband with business mobile line.',
        },
      ];
    } else if (isOffice) {
      bundleName = 'Professional Office Suite Pro';
      selectedIds.push('P02'); // Biz Fibre 300
      if (productMap.has('P12')) selectedIds.push('P12'); // Cloud Telephony / SIP
      if (productMap.has('P16')) selectedIds.push('P16'); // Cloud Email & Office Suite
      if (productMap.has('P20')) selectedIds.push('P20'); // Endpoint Security
      if (productMap.has('P11')) selectedIds.push('P11'); // Static IP

      if (language === 'hi') {
        reasoning = [
          '300 Mbps हाई-स्पीड फाइबर (P02) कई क्लाइंट वीडियो कॉल्स और भारी दस्तावेज़ डाउनलोड के लिए आदर्श है।',
          'Cloud Telephony / SIP (P12) एक मुख्य रिसेप्शनिस्ट नंबर से स्मार्ट कॉल ट्रांसफर करता है।',
          'Cloud Email & Office Suite (P16) सुरक्षित कॉर्पोरेट ईमेल प्रदान करता है।',
          'Endpoint Security (P20) मैलवेयर और रैंसमवेयर से ऑफिस कंप्यूटरों को सुरक्षित रखता है।',
        ];
      } else {
        reasoning = [
          '300 Mbps symmetrical Biz Fibre (P02) supports seamless concurrent HD video conferencing.',
          'Cloud Telephony / SIP (P12) provides a single virtual receptionist number with smart call routing.',
          'Cloud Email & Office Suite (P16) equips your team with secure enterprise email on own domain.',
          'Endpoint Security (P20) safeguards confidential client briefs from ransomware and malware.',
        ];
      }

      alternatives = [
        {
          name: 'Legal / CA Starter Pack',
          productIds: ['P01', 'P16', 'P20'],
          estimatedMrc: 1223,
          difference: 'Ideal for 1-3 practitioners with 100 Mbps broadband and enterprise email.',
        },
      ];
    } else if (isMulti) {
      bundleName = 'Multi-Site SD-WAN Enterprise Connect';
      selectedIds.push('P02', 'P09', 'P10', 'P08');

      reasoning = [
        'Managed SD-WAN (P10) links branch locations with application-priority routing.',
        'Automatic 4G/5G Failover (P09) guarantees 100% billing continuity even during optical cuts.',
        'High-bandwidth Biz Fibre (P02) handling continuous inventory sync across sites.',
      ];
    } else {
      // Small Manufacturers
      bundleName = 'Industrial Smart Workshop Connect';
      selectedIds.push('P02', 'P17', 'P25', 'P11');

      reasoning = [
        'Cloud Backup 1 TB (P17) secures daily Tally and ERP accounting archives against data loss.',
        'Fleet Tracker (P25) monitors delivery vans and raw material dispatch in real time.',
        'Fixed Static IP (P11) allows secure remote monitoring of workshop factory CCTV cameras.',
      ];
    }

    const recommendedProducts = selectedIds
      .map((id) => productMap.get(id))
      .filter(Boolean);

    const estimatedMonthlyPrice = recommendedProducts.reduce((sum, p) => sum + p.monthlyPrice, 0);

    return {
      bundleName,
      segment,
      businessSummary: `${profile.tradeName || profile.businessName || 'Your business'} (${segment})`,
      recommendedProducts,
      estimatedMonthlyPrice,
      reasoning,
      alternatives,
      missingInformation: [],
    };
  }

  async recommendBundle(profile) {
    if (!env.GEMINI_API_KEY) {
      return this.getRuleBasedRecommendation(profile);
    }

    try {
      const allProducts = await Product.find({ isActive: true });
      const prompt = `
You are an expert telecom advisor for Accel Business (Airtel SYNC Hackathon 2026).
Recommend a bundle from the available products (IDs: ${allProducts.map((p) => p.productId).join(', ')}) for this MSME profile:
Profile: ${JSON.stringify(profile)}

Return strictly valid JSON:
{
  "bundleName": "String",
  "businessSummary": "String",
  "recommendedProductIds": ["P01", "P..."],
  "reasoning": ["Bullet point 1", "Bullet point 2"],
  "alternatives": []
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (!response.ok) {
        return this.getRuleBasedRecommendation(profile);
      }

      const resData = await response.json();
      const content = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(content);

      const productMap = new Map(allProducts.map((p) => [p.productId, p]));
      const recommendedProducts = (parsed.recommendedProductIds || [])
        .map((id) => productMap.get(id))
        .filter(Boolean);

      if (recommendedProducts.length === 0) {
        return this.getRuleBasedRecommendation(profile);
      }

      const estimatedMonthlyPrice = recommendedProducts.reduce((sum, p) => sum + p.monthlyPrice, 0);

      return {
        bundleName: parsed.bundleName || 'Intelligent MSME Recommended Bundle',
        segment: profile.segment,
        businessSummary: parsed.businessSummary || `${profile.tradeName || 'Your business'} (${profile.segment})`,
        recommendedProducts,
        estimatedMonthlyPrice,
        reasoning: parsed.reasoning || [],
        alternatives: parsed.alternatives || [],
        missingInformation: [],
      };
    } catch (err) {
      return this.getRuleBasedRecommendation(profile);
    }
  }
}

module.exports = new AdvisorService();
