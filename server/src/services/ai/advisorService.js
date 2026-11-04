const Product = require('../../models/Product');
const env = require('../../config/env');

class AdvisorService {
  /**
   * Deterministic Expert Recommendation Matrix (Guaranteed Fallback)
   */
  async getRuleBasedRecommendation(profile) {
    const {
      segment = 'Micro Retail and Services',
      employees = 2,
      hasGstin = false,
      cityTier = 'Tier 1',
      monthlyBudget = 2000,
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

    // Rule Logic by Segment
    if (segment === 'Micro Retail and Services') {
      bundleName = 'Retail Express Smart Connect';
      // Base: 200M or 100M based on budget
      selectedIds.push(monthlyBudget >= 2000 ? 'PROD-BB-200' : 'PROD-BB-100');
      // POS M2M Sim for UPI / Card swipe
      if (requiresPaymentPos && productMap.has('PROD-IOT-POS')) {
        selectedIds.push('PROD-IOT-POS');
      }
      // WhatsApp API
      if (requiresWhatsapp && productMap.has('PROD-WABA-LITE')) {
        selectedIds.push('PROD-WABA-LITE');
      }
      // Business SIM
      if (productMap.has('PROD-SIM-VOICE1')) {
        selectedIds.push('PROD-SIM-VOICE1');
      }

      if (language === 'hi') {
        reasoning = [
          'आपकी दुकान में UPI और कार्ड पेमेंट्स बिना रुके चलाने के लिए 200 Mbps हाई-स्पीड फाइबर।',
          'ग्राहकों को बिल और डिलीवरी अपडेट भेजने के लिए ऑफिशियल WhatsApp Business API।',
          'सप्लायर और कस्टमर कॉल्स को निजी फोन से अलग रखने के लिए एक समर्पित बिज़नेस सिम।',
          'POS स्वाइप मशीन के लिए हमेशा एक्टिव रहने वाला M2M डेटा सिम।',
        ];
      } else {
        reasoning = [
          'High-speed 200 Mbps business fiber ensures zero buffering during peak UPI and QR scan payments.',
          'Official WhatsApp Business API automates grocery order receipts and customer promos directly.',
          'Dedicated corporate mobile SIM separates business vendor calls from personal lines.',
          'M2M POS backup SIM keeps card swipe terminals operational even during main router restarts.',
        ];
      }

      alternatives = [
        {
          name: 'Economy Kirana Starter',
          productIds: ['PROD-BB-100', 'PROD-IOT-POS'],
          estimatedMrc: 1098,
          difference: 'Budget-friendly 100 Mbps broadband without WhatsApp API add-on.',
        },
      ];
    } else if (segment === 'Professional Offices') {
      bundleName = 'Professional Office Suite Pro';
      selectedIds.push('PROD-BB-500');
      if (productMap.has('PROD-PBX-VIRT')) selectedIds.push('PROD-PBX-VIRT');
      if (productMap.has('PROD-CLD-M365')) selectedIds.push('PROD-CLD-M365');
      if (productMap.has('PROD-SEC-DNS')) selectedIds.push('PROD-SEC-DNS');
      if (productMap.has('PROD-IP-STAT')) selectedIds.push('PROD-IP-STAT');

      if (language === 'hi') {
        reasoning = [
          '500 Mbps हाई-स्पीड फाइबर कई क्लाइंट वीडियो कॉल्स और भारी दस्तावेज़ डाउनलोड के लिए आदर्श है।',
          'वर्चुअल क्लाउड PBX एक मुख्य लैंडलाइन नंबर से सभी पार्टनर्स के फोन पर स्मार्ट कॉल ट्रांसफर करता है।',
          'Microsoft 365 सुरक्षित कॉर्पोरेट ईमेल और 1TB क्लाउड डेटा स्टोरेज प्रदान करता है।',
          'साइबरशील्ड DNS मैलवेयर और फ़िशिंग हमलों से ऑफिस नेटवर्क को सुरक्षित रखता है।',
        ];
      } else {
        reasoning = [
          '500 Mbps symmetrical fiber supports seamless concurrent HD video conferencing and large file transfers.',
          'Cloud Virtual PBX provides a single prestigious receptionist number routing calls to associate SIMs.',
          'Microsoft 365 Business Basic equips your team with secure enterprise email and 1TB encrypted cloud storage.',
          'CyberShield DNS safeguards confidential client briefs from ransomware and phishing threats.',
        ];
      }

      alternatives = [
        {
          name: 'Legal / CA Starter Pack',
          productIds: ['PROD-BB-200', 'PROD-CLD-GSUITE', 'PROD-SEC-DNS'],
          estimatedMrc: 1908,
          difference: 'Ideal for 1-3 practitioners using Google Workspace with 200 Mbps broadband.',
        },
      ];
    } else if (segment === 'Small Multi-site Businesses') {
      bundleName = 'Multi-Site SD-WAN Enterprise Connect';
      selectedIds.push('PROD-BB-500', 'PROD-SDWAN-BR', 'PROD-SIM-POOL');

      reasoning = [
        'SD-WAN gateway links branch locations with automated 4G optical failover for 100% billing continuity.',
        'Pooled corporate voice pack across 5 staff SIM cards with zero internal calling charges.',
        'High-bandwidth 500 Mbps fiber handling continuous inventory sync between branches.',
      ];
    } else {
      // Small Manufacturers
      bundleName = 'Industrial Smart Workshop Connect';
      selectedIds.push('PROD-BB-200', 'PROD-IOT-TRK', 'PROD-CLD-BAK', 'PROD-IP-STAT');

      reasoning = [
        'Cloud Backup Vault secures daily Tally and ERP accounting archives against ransomware or hard drive loss.',
        'GPS Fleet tracking monitors delivery vehicles and raw material dispatch in real time.',
        'Dedicated Static IP allows secure remote monitoring of workshop factory CCTV cameras.',
      ];
    }

    // Filter by availability & calculate estimated MRC
    const recommendedProducts = selectedIds
      .map((id) => productMap.get(id))
      .filter((p) => Boolean(p));

    const estimatedMonthlyPrice = recommendedProducts.reduce((sum, p) => sum + p.monthlyPrice, 0);

    return {
      bundleName,
      segment,
      businessSummary: `${profile.tradeName || 'Your business'} (${segment}, ${employees} staff, ${cityTier})`,
      recommendedProducts,
      estimatedMonthlyPrice,
      reasoning,
      alternatives,
      missingInformation: [],
    };
  }

  /**
   * AI-Assisted Recommendation (calls Gemini API if key is set, otherwise falls back gracefully)
   */
  async recommendBundle(profile) {
    // Check if Gemini API key exists
    if (!env.GEMINI_API_KEY) {
      return this.getRuleBasedRecommendation(profile);
    }

    try {
      // Attempt Gemini API call
      const prompt = `
You are an expert telecom and digital transformation advisor for Accel Business (Airtel SYNC Hackathon 2026).
Recommend a bundle from the available products for this Indian MSME profile:
Profile: ${JSON.stringify(profile)}

Return strictly valid JSON adhering to this schema:
{
  "bundleName": "String",
  "businessSummary": "String",
  "recommendedProductIds": ["PROD-..."],
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
        console.warn('[AI Advisor] Gemini API returned error status, falling back to rule engine.');
        return this.getRuleBasedRecommendation(profile);
      }

      const resData = await response.json();
      const content = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(content);

      // Verify product IDs exist in DB
      const allProducts = await Product.find({ isActive: true });
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
      console.warn('[AI Advisor] Error invoking Gemini, fallback triggered:', err.message);
      return this.getRuleBasedRecommendation(profile);
    }
  }
}

module.exports = new AdvisorService();
