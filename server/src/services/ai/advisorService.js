const Product = require('../../models/Product');
const geminiClient = require('./geminiClient');

class AdvisorService {
  /**
   * Deterministic Expert Recommendation Matrix using Official Company Products (P01-P25)
   * Grounded strictly in official catalogue with zero invented services or prices.
   */
  async getRuleBasedRecommendation(profile = {}) {
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

    const normSegment = (segment || '').toLowerCase();
    const isMicro = normSegment.includes('micro') || normSegment.includes('retail') || normSegment.includes('kirana') || normSegment.includes('store') || normSegment.includes('shop');
    const isOffice = normSegment.includes('office') || normSegment.includes('prof') || normSegment.includes('legal') || normSegment.includes('ca') || normSegment.includes('clinic') || normSegment.includes('consult');
    const isMulti = normSegment.includes('multi') || normSegment.includes('site') || normSegment.includes('branch');

    if (isMicro) {
      bundleName = 'Retail Express Smart Connect';
      selectedIds.push(monthlyBudget >= 2500 ? 'P02' : 'P01'); // Biz Fibre 300 or 100
      if (productMap.has('P07')) selectedIds.push('P07'); // Business Postpaid 299
      if (requiresPaymentPos && productMap.has('P19')) selectedIds.push('P19'); // Cloud POS & Billing
      if (requiresWhatsapp && productMap.has('P15')) selectedIds.push('P15'); // WhatsApp Business API Starter

      if (language === 'hi') {
        reasoning = [
          'दुकान में UPI और कार्ड पेमेंट्स बिना रुके चलाने के लिए 100/300 Mbps हाई-स्पीड फाइबर (P01/P02)।',
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
          bundleName: 'Economy Kirana Starter',
          recommendedProductIds: ['P01', 'P07'],
          difference: 'Budget-friendly 100 Mbps broadband with business mobile line.',
        },
        {
          bundleName: 'Retail Pro with Cloud Surveillance',
          recommendedProductIds: ['P02', 'P07', 'P19', 'P15', 'P23'],
          difference: 'Full retail suite plus 24/7 Cloud CCTV camera for store security.',
        },
      ];
    } else if (isOffice) {
      bundleName = 'Professional Office Suite Pro';
      selectedIds.push('P02'); // Biz Fibre 300
      if (productMap.has('P12')) selectedIds.push('P12'); // Cloud Telephony / SIP
      if (productMap.has('P16')) selectedIds.push('P16'); // Cloud Email & Office Suite
      if (productMap.has('P20')) selectedIds.push('P20'); // Endpoint Security
      if (monthlyBudget >= 4000 && productMap.has('P11')) selectedIds.push('P11'); // Static IP

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
          bundleName: 'Legal / CA Starter Pack',
          recommendedProductIds: ['P01', 'P16', 'P20'],
          difference: 'Ideal for 1-3 practitioners with 100 Mbps broadband and enterprise email.',
        },
        {
          bundleName: 'Enterprise Office High-Reliability Pro',
          recommendedProductIds: ['P02', 'P09', 'P11', 'P12', 'P16', 'P20'],
          difference: 'Adds 4G/5G automatic failover backup and dedicated static IP for server access.',
        },
      ];
    } else if (isMulti) {
      bundleName = 'Multi-Site SD-WAN Enterprise Connect';
      selectedIds.push('P02', 'P09', 'P10', 'P08');

      reasoning = [
        'Managed SD-WAN (P10) links branch locations with application-priority routing.',
        'Automatic 4G/5G Failover (P09) guarantees 100% billing continuity even during optical cuts.',
        'High-bandwidth Biz Fibre (P02) handling continuous inventory sync across sites.',
        'Business Postpaid 599 (P08) equips site supervisors with unlimited nationwide roaming and data.',
      ];

      alternatives = [
        {
          bundleName: 'Dual-Store Connected Retail',
          recommendedProductIds: ['P01', 'P09', 'P19'],
          difference: 'Essential 100 Mbps fiber with cellular failover and shared cloud POS.',
        },
      ];
    } else {
      // Small Manufacturers / Workshop
      bundleName = 'Industrial Smart Workshop Connect';
      selectedIds.push('P02', 'P17', 'P25', 'P11');

      reasoning = [
        'Cloud Backup 1 TB (P17) secures daily Tally and ERP accounting archives against data loss.',
        'Fleet Tracker (P25) monitors delivery vans and raw material dispatch in real time.',
        'Fixed Static IP (P11) allows secure remote monitoring of workshop factory CCTV cameras.',
        'Biz Fibre 300 (P02) provides robust bandwidth for uninterrupted machine and production telemetry.',
      ];

      alternatives = [
        {
          bundleName: 'Workshop CCTV & Fiber Starter',
          recommendedProductIds: ['P01', 'P23', 'P17'],
          difference: 'Entry 100 Mbps fiber with Cloud CCTV monitoring and automated Tally backup.',
        },
      ];
    }

    const recommendedProducts = selectedIds
      .map((id) => productMap.get(id))
      .filter(Boolean);

    const estimatedMonthlyPrice = recommendedProducts.reduce((sum, p) => sum + p.monthlyPrice, 0);

    // Format alternative bundles with real product objects & calculated prices
    const formattedAlternatives = alternatives.map((alt) => {
      const prods = (alt.recommendedProductIds || [])
        .map((id) => productMap.get(id))
        .filter(Boolean);
      const mrc = prods.reduce((sum, p) => sum + p.monthlyPrice, 0);
      return {
        bundleName: alt.bundleName,
        recommendedProducts: prods,
        estimatedMonthlyPrice: mrc,
        oneTimeSetup: 1000,
        difference: alt.difference,
      };
    });

    return {
      bundleName,
      segment,
      businessSummary: `${profile.tradeName || profile.businessName || 'Your business'} (${segment})`,
      recommendedProducts,
      estimatedMonthlyPrice,
      oneTimeSetup: 1000,
      reasoning,
      alternatives: formattedAlternatives,
      missingInformation: [],
    };
  }

  /**
   * Natural Conversation Engine – Consultant-Driven Dialogue with Dynamic Bundling
   * Multi-turn conversational consultation analyzing customer requirements, budget, bottlenecks, and catalogue matching.
   */
  async converse({ message, history = [], currentBundle = null, language = 'en', userProfile = null }) {
    const allProducts = await Product.find({ isActive: true });
    const productMap = new Map(allProducts.map((p) => [p.productId, p]));

    // Catalogue knowledge grounding for LLM
    const catalogueKnowledge = allProducts
      .map(
        (p) =>
          `- [${p.productId}] ${p.productName} (${p.category}): ₹${p.monthlyPrice}/mo. Bandwidth: ${p.speedBandwidth || 'Standard'}. Features: ${(p.features || []).join(', ')}`
      )
      .join('\n');

    // 1. If Gemini API is configured, use conversational LLM reasoning
    if (geminiClient.isConfigured()) {
      try {
        const systemInstruction = `You are the Principal Enterprise Telecom & Digital Solutions Consultant for Accel Telecom (Project Udyam Digital / Airtel SYNC 2026).
You are having a natural, friendly pair-programming consultation with an Indian MSME merchant.

STRICT KNOWLEDGE BASE - USE ONLY THESE 25 OFFICIAL PRODUCTS (NEVER INVENT ANY ID, PRODUCT NAME, OR PRICE):
${catalogueKnowledge}

ONE-TIME POLICY:
Standard installation & fiber termination setup fee is strictly ₹1,000 once per enterprise (flat policy).

CONSULTATIVE MISSION:
1. Understand the customer's business domain, scale (employees, sites), daily operational bottlenecks (UPI dropouts, slow downloads, CCTV remote streaming, Tally data backup, customer WhatsApp updates), and budget.
2. If the customer's message has enough context (or provides clear details), formulate a targeted PRIMARY BUNDLE from P01-P25 with specific operational reasoning for each product.
3. If the customer's message is brief, ambiguous, or lacks key info (e.g. just saying "hello" or "I have a shop"), ask 1-2 focused, conversational follow-up questions to clarify their needs, and provide 2-4 interactive "suggestedQuickReplies".
4. If the customer asks to modify an existing bundle (e.g. "make it cheaper", "add CCTV", "remove cloud telephony"), immediately adapt the bundle, update the products, and explain the change.
5. If the customer writes in Hindi or Hinglish, answer conversationally in Hindi/Hinglish while keeping product IDs and numbers accurate.

Always reply with strictly valid JSON in this schema:
{
  "reply": "Conversational advisor response in customer's language. Warm, empathetic, professional.",
  "detectedContext": {
    "businessType": "String or null",
    "employeeCount": "Number or null",
    "identifiedNeeds": ["String"],
    "budgetBand": "String or null"
  },
  "isReadyForRecommendation": true or false,
  "bundle": {
    "bundleName": "String",
    "businessSummary": "String",
    "recommendedProductIds": ["P01", "P07", "P..."],
    "reasoning": [
      "Why product 1 is needed for their business workflow...",
      "Why product 2 is needed..."
    ],
    "keyBenefits": [
      "Operational benefit 1",
      "Operational benefit 2"
    ]
  } or null,
  "alternatives": [
    {
      "bundleName": "String",
      "recommendedProductIds": ["P..."],
      "difference": "Short 1-sentence comparison vs primary bundle"
    }
  ],
  "followUpQuestions": ["Short question if asking for clarification"],
  "suggestedQuickReplies": ["Short clickable reply chip 1", "Chip 2"]
}`;

        // Format history for Gemini
        const formattedHistory = [];
        for (const h of history) {
          if (h.content) {
            formattedHistory.push({
              role: h.role === 'assistant' || h.role === 'model' ? 'assistant' : 'user',
              content: h.content,
            });
          }
        }

        const rawJson = await geminiClient.generateText({
          prompt: `Customer Message: "${message}"\nLanguage: ${language}\nExisting Active Bundle: ${currentBundle ? JSON.stringify(currentBundle.bundleName || currentBundle) : 'None'}\nKnown User Profile: ${userProfile ? JSON.stringify(userProfile) : 'None'}`,
          systemInstruction,
          history: formattedHistory,
          responseMimeType: 'application/json',
          temperature: 0.25,
        });

        if (rawJson) {
          let parsed = null;
          try {
            parsed = JSON.parse(rawJson);
          } catch (e) {
            const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleaned);
          }

          if (parsed && (parsed.reply || parsed.bundle)) {
            let enrichedBundle = null;
            if (parsed.bundle && parsed.bundle.recommendedProductIds && parsed.bundle.recommendedProductIds.length > 0) {
              const prods = parsed.bundle.recommendedProductIds
                .map((id) => productMap.get(id))
                .filter(Boolean);

              if (prods.length > 0) {
                const totalMrc = prods.reduce((sum, p) => sum + p.monthlyPrice, 0);
                enrichedBundle = {
                  bundleName: parsed.bundle.bundleName || 'Tailored MSME Business Bundle',
                  businessSummary: parsed.bundle.businessSummary || 'Customized for your enterprise operations',
                  recommendedProducts: prods,
                  estimatedMonthlyPrice: totalMrc,
                  oneTimeSetup: 1000,
                  reasoning: parsed.bundle.reasoning || [],
                  keyBenefits: parsed.bundle.keyBenefits || [],
                };
              }
            }

            // Enrich alternatives
            const enrichedAlternatives = (parsed.alternatives || []).map((alt) => {
              const altProds = (alt.recommendedProductIds || []).map((id) => productMap.get(id)).filter(Boolean);
              const altMrc = altProds.reduce((sum, p) => sum + p.monthlyPrice, 0);
              return {
                bundleName: alt.bundleName,
                recommendedProducts: altProds,
                estimatedMonthlyPrice: altMrc,
                oneTimeSetup: 1000,
                difference: alt.difference || 'Alternative tier option',
              };
            });

            return {
              reply: parsed.reply || 'Here is your customized telecom bundle based on your business requirements.',
              detectedContext: parsed.detectedContext || {},
              isReadyForRecommendation: Boolean(enrichedBundle),
              bundle: enrichedBundle,
              alternatives: enrichedAlternatives,
              followUpQuestions: parsed.followUpQuestions || [],
              suggestedQuickReplies: parsed.suggestedQuickReplies || (enrichedBundle ? ['Proceed with this bundle', 'Can we lower the price?', 'Add Cloud CCTV'] : ['Retail Store with 4 staff', '10-person Professional Office', 'Manufacturing Workshop']),
            };
          }
        }
      } catch (geminiErr) {
        console.warn('[Advisor Service Gemini Fallback]', geminiErr.message);
      }
    }

    // 2. High-Fidelity Local Conversational Consultant Engine (Deterministic Expert NLU Fallback)
    return this.getLocalConversationalResponse({
      message,
      history,
      currentBundle,
      language,
      userProfile,
      allProducts,
      productMap,
    });
  }

  /**
   * Deterministic Natural Language Understanding & Consultant Dialogue Fallback
   */
  getLocalConversationalResponse({ message = '', history = [], currentBundle = null, language = 'en', userProfile = null, allProducts = [], productMap = new Map() }) {
    const text = message.toLowerCase();

    // Check for greeting or low-context inputs
    const isGreeting = text.match(/^(hi|hello|hey|namaste|pranam|greetings|good\s*(morning|afternoon|evening)|hlo)\b/i) && text.length < 25;
    const isVague = text.length < 15 && !text.match(/retail|shop|clinic|office|factory|tally|cctv|wifi|speed|price|cost|budget/i);

    if (isGreeting || isVague) {
      const isHindi = language === 'hi' || text.includes('namaste');
      return {
        reply: isHindi
          ? 'नमस्ते! मैं आपका Accel बिजनेस टेलीकॉम सलाहकार हूँ। अपने व्यवसाय के बारे में थोड़ा बताएं—आपकी किस प्रकार की दुकान या ऑफिस है, कितने कर्मचारी हैं, और क्या आपको UPI पेमेंट्स, WhatsApp बिलिंग, CCTV या क्लाउड बैकअप की आवश्यकता है? मैं आपके लिए सटीक प्लान तैयार करूँगा।'
          : "Hello! I am your Accel Business Telecom Consultant. Tell me about your business in your own words—what type of business do you run (retail store, clinic, CA office, workshop), how many staff members you have, and your daily digital needs (like UPI payments, CCTV, or WhatsApp customer billing). I'll curate the ideal bundle from our official catalogue.",
        detectedContext: {
          businessType: null,
          employeeCount: null,
          identifiedNeeds: [],
          budgetBand: null,
        },
        isReadyForRecommendation: false,
        bundle: null,
        alternatives: [],
        followUpQuestions: [
          'What type of business do you run?',
          'How many team members need connectivity?',
        ],
        suggestedQuickReplies: [
          '🏪 Retail / Kirana Store (Fast UPI & WhatsApp)',
          '🏢 Professional Office / Clinic (10 staff)',
          '🏭 Manufacturing Workshop (CCTV + Tally)',
          '🔗 Multi-Branch Business (SD-WAN)',
        ],
      };
    }

    // Detect Business Domain
    let segment = 'Micro retail & services';
    let businessTitle = 'Enterprise Business Merchant';

    if (text.match(/retail|kirana|supermarket|grocery|mart|store|shop|showroom|restaurant|cafe|bakery|sweet/i)) {
      segment = 'Micro retail & services';
      businessTitle = 'Retail & Consumer Merchant';
    } else if (text.match(/office|legal|law|ca|chartered|consult|clinic|dental|hospital|doctor|pharma|agency|software|tech/i)) {
      segment = 'Professional Offices';
      businessTitle = 'Professional Office & Practice';
    } else if (text.match(/factory|manufactur|workshop|plant|industrial|tooling|warehouse|textile|forge/i)) {
      segment = 'Small Manufacturers';
      businessTitle = 'Manufacturing Workshop & Plant';
    } else if (text.match(/branch|multi|chain|locations|sites|depot|across/i)) {
      segment = 'Small Multi-site Businesses';
      businessTitle = 'Multi-Branch Connected Business';
    }

    // Detect Specific Operational Needs & Product Add-ons
    const needsPos = Boolean(text.match(/upi|qr|card|pos|billing|swipe|payment|counter/i));
    const needsWhatsapp = Boolean(text.match(/whatsapp|wa|receipt|invoice|delivery|promo/i));
    const needsCctv = Boolean(text.match(/cctv|camera|surveillance|security\s*cam/i));
    const needsBackup = Boolean(text.match(/backup|tally|erp|cloud\s*backup|data\s*loss|accounting/i));
    const needsFailover = Boolean(text.match(/failover|backup\s*internet|dongle|optical\s*cut|redundant|4g|5g/i));
    const needsStaticIp = Boolean(text.match(/static\s*ip|dedicated\s*ip|server|cctv\s*view|firewall/i));
    const needsTelephony = Boolean(text.match(/calling|telephony|sip|ivr|reception|landline|pbx/i));
    const isBudgetLow = Boolean(text.match(/cheap|budget|sasta|reduce|low\s*cost|affordable|kam\s*paisa/i));
    const isHighSpeed = Boolean(text.match(/1gbps|1\s*gb|fast|heavy|latency|fiber\s*300|300\s*mbps/i));

    // Curate Product Set
    let productIds = [];
    let bundleName = '';
    let reasoning = [];
    let alternatives = [];

    if (segment === 'Micro retail & services') {
      bundleName = isBudgetLow ? 'Economy Kirana Value Pack' : 'Retail Express Smart Connect';
      productIds.push(isBudgetLow ? 'P01' : (isHighSpeed ? 'P02' : 'P02'));
      productIds.push('P07'); // Business Postpaid 299
      if (needsPos || !isBudgetLow) productIds.push('P19'); // Cloud POS & Billing
      if (needsWhatsapp || !isBudgetLow) productIds.push('P15'); // WhatsApp Business API Starter
      if (needsCctv) productIds.push('P23'); // Cloud CCTV
      if (needsBackup) productIds.push('P17'); // Cloud Backup

      reasoning = [
        'High-speed Biz Fibre broadband ensures instantaneous QR scan and UPI merchant settlements without terminal timeouts.',
        'Official WhatsApp Business API (P15) automatically delivers digital payment receipts and promotional discounts directly to customers.',
        'Cloud POS & Billing (P19) turns counter tablets and smartphones into automated inventory and billing terminals.',
        'Dedicated Business Postpaid SIM (P07) keeps supplier negotiations and distributor calls off personal phones.',
      ];
      if (needsCctv) reasoning.push('Cloud CCTV (P23) keeps store counters and billing tills monitored with automated cloud archiving.');

      alternatives = [
        {
          bundleName: 'Economy Kirana Starter',
          recommendedProductIds: ['P01', 'P07'],
          difference: 'Budget 100 Mbps broadband with business mobile SIM (₹1,298/mo).',
        },
        {
          bundleName: 'Retail Pro with Cloud Surveillance',
          recommendedProductIds: ['P02', 'P07', 'P19', 'P15', 'P23'],
          difference: 'Adds 24/7 Cloud CCTV camera for store security and theft deterrence.',
        },
      ];
    } else if (segment === 'Professional Offices') {
      bundleName = 'Professional Office Suite Pro';
      productIds.push(isHighSpeed ? 'P03' : 'P02'); // Biz Fibre 300 or 1G
      productIds.push('P16'); // Cloud Email & Office Suite
      productIds.push('P20'); // Endpoint Security
      if (needsTelephony || !isBudgetLow) productIds.push('P12'); // Cloud Telephony / SIP
      if (needsStaticIp) productIds.push('P11'); // Static IP
      if (needsFailover) productIds.push('P09'); // Failover 4G/5G

      reasoning = [
        'Symmetrical Biz Fibre 300 (P02) delivers bufferless HD video conferences across Zoom, Teams, and client portals.',
        'Cloud Telephony / SIP (P12) routes customer calls to available staff extensions through a single professional virtual IVR.',
        'Cloud Email & Office Suite (P16) equips your practice with secure corporate email on your own domain.',
        'Endpoint Security (P20) shields confidential financial, patient, and legal records from ransomware attacks.',
      ];
      if (needsStaticIp) reasoning.push('Dedicated Static IP (P11) guarantees secure remote access to internal CRM and practice servers.');

      alternatives = [
        {
          bundleName: 'Legal & CA Starter Pack',
          recommendedProductIds: ['P01', 'P16', 'P20'],
          difference: 'Essential 100 Mbps broadband with enterprise email and endpoint antivirus.',
        },
        {
          bundleName: 'Enterprise Office High-Reliability Pro',
          recommendedProductIds: ['P02', 'P09', 'P11', 'P12', 'P16', 'P20'],
          difference: 'Adds 4G/5G automatic failover backup and dedicated static IP.',
        },
      ];
    } else if (segment === 'Small Multi-site Businesses') {
      bundleName = 'Multi-Site SD-WAN Enterprise Connect';
      productIds.push('P02', 'P09', 'P10', 'P08');
      if (needsStaticIp) productIds.push('P11');

      reasoning = [
        'Managed SD-WAN (P10) links store branches and warehouse locations with application-prioritized tunnels.',
        'Backup 4G/5G Failover (P09) guarantees zero downtime for billing and ERP synchronization even during roadside optical cuts.',
        'Biz Fibre 300 (P02) delivers robust primary bandwidth for continuous cloud synchronization.',
        'Business Postpaid 599 (P08) equips the site supervisor with unlimited corporate calling and roaming data.',
      ];

      alternatives = [
        {
          bundleName: 'Dual-Store Connected Retail',
          recommendedProductIds: ['P01', 'P09', 'P19'],
          difference: '100 Mbps fiber with cellular failover and shared cloud POS.',
        },
      ];
    } else {
      // Manufacturers / Workshop
      bundleName = 'Industrial Smart Workshop Connect';
      productIds.push('P02', 'P17', 'P25', 'P11');
      if (needsCctv) productIds.push('P23');

      reasoning = [
        'Cloud Backup 1 TB (P17) automates nightly encrypted backups of Tally ERP, CAD drawings, and accounting archives.',
        'Fleet Tracker (P25) provides real-time GPS tracking and geofencing for dispatch vehicles and raw material deliveries.',
        'Fixed Static IP (P11) enables seamless remote monitoring of factory CCTV feeds and server infrastructure.',
        'Biz Fibre 300 (P02) ensures consistent factory floor connectivity without dropped packets.',
      ];

      alternatives = [
        {
          bundleName: 'Workshop CCTV & Fiber Starter',
          recommendedProductIds: ['P01', 'P23', 'P17'],
          difference: 'Entry 100 Mbps fiber with Cloud CCTV monitoring and automated Tally backup.',
        },
      ];
    }

    // Map to real DB product objects
    const recommendedProducts = productIds.map((id) => productMap.get(id)).filter(Boolean);
    const estimatedMonthlyPrice = recommendedProducts.reduce((sum, p) => sum + p.monthlyPrice, 0);

    // Format alternative bundles with real product objects
    const formattedAlternatives = alternatives.map((alt) => {
      const prods = (alt.recommendedProductIds || []).map((id) => productMap.get(id)).filter(Boolean);
      const mrc = prods.reduce((sum, p) => sum + p.monthlyPrice, 0);
      return {
        bundleName: alt.bundleName,
        recommendedProducts: prods,
        estimatedMonthlyPrice: mrc,
        oneTimeSetup: 1000,
        difference: alt.difference,
      };
    });

    const isHindi = language === 'hi' || text.includes('namaste') || text.includes('chahiye');

    const consultantReply = isHindi
      ? `मैंने आपकी आवश्यकताओं का विश्लेषण करके आपके लिए **${bundleName}** तैयार किया है। इसमें ₹${estimatedMonthlyPrice}/महीना में हाई-स्पीड ब्रॉडबैंड और डिजिटल टूल्स शामिल हैं। क्या यह आपके बजट और काम के अनुकूल है, या कुछ बदलाव करना चाहेंगे?`
      : `Based on your business operations and requirements, I have curated the **${bundleName}** for ₹${estimatedMonthlyPrice}/month. It provides enterprise-grade connectivity with essential digital tools tailored to your daily workflow. Review the service breakdown below—would you like to proceed with this bundle or customize any services?`;

    return {
      reply: consultantReply,
      detectedContext: {
        businessType: businessTitle,
        employeeCount: 4,
        identifiedNeeds: productIds.map((id) => productMap.get(id)?.productName).filter(Boolean),
        budgetBand: `₹${estimatedMonthlyPrice}/mo`,
      },
      isReadyForRecommendation: true,
      bundle: {
        bundleName,
        businessSummary: `Curated for ${businessTitle}`,
        recommendedProducts,
        estimatedMonthlyPrice,
        oneTimeSetup: 1000,
        reasoning,
        keyBenefits: [
          'Guaranteed 99.8% SLA optical connectivity with dedicated enterprise support',
          'Standard ₹1,000 one-time optical installation & termination policy',
          '18% GST input tax credit invoice generated on company GSTIN',
        ],
      },
      alternatives: formattedAlternatives,
      followUpQuestions: [
        'Would you like to customize any of these items, or proceed with this bundle to get your official quote?',
      ],
      suggestedQuickReplies: [
        'Accept bundle & get quote',
        'Can we make it more budget-friendly?',
        'Add Cloud CCTV cameras',
        'Add 4G/5G backup failover',
      ],
    };
  }

  /**
   * Direct Bundle Recommendation API (Compatible with official Test 5)
   */
  async recommendBundle(profile = {}) {
    return this.getRuleBasedRecommendation(profile);
  }
}

module.exports = new AdvisorService();
