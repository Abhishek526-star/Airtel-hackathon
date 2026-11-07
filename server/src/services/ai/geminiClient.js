const env = require('../../config/env');

class GeminiClient {
  constructor() {
    this.apiKey = env.GEMINI_API_KEY || '';
    this.primaryModels = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Universal text/chat completion
   */
  async generateText({ prompt, systemInstruction = '', history = [], temperature = 0.3, responseMimeType = null, timeoutMs = 12000 }) {
    if (!this.isConfigured()) return null;

    // Build contents array
    const contents = [];
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content || msg.text || '' }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const bodyPayload = {
      contents,
      generationConfig: {
        temperature,
        ...(responseMimeType ? { responseMimeType } : {}),
      },
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    for (const model of this.primaryModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch (err) {
        // try next model in cascade
        continue;
      }
    }

    return null;
  }

  /**
   * Multimodal Document OCR Extraction using Gemini Vision
   */
  async extractDocumentOCR({ base64Data, mimeType, fileName, documentHint = 'GST_CERTIFICATE' }) {
    if (!this.isConfigured() || !base64Data) return null;

    const systemPrompt = `You are an expert AI document inspection engine for Indian Government Business Certificates (GSTIN, Udyam MSME, PAN, Aadhaar, Utility Bills).
Examine the document with high precision and extract:
1. documentType: One of 'GST_CERTIFICATE', 'UDYAM_CERTIFICATE', 'SIGNATORY_ID', 'ADDRESS_PROOF', 'TRADE_LICENSE'
2. extractedId: The exact identifier:
   - For GST: 15-character alphanumeric (e.g., 07AAAAA0000A1Z5)
   - For Udyam: Format UDYAM-XX-00-0000000
   - For PAN: 10-character alphanumeric (e.g., ABCDE1234F)
   - For Aadhaar: 12-digit number (or masked XXXX-XXXX-1234)
   - For Utility Bill: Consumer/Account number
3. entityName: Legal entity name (as registered)
4. tradeName: Commercial trade / shop name (if present)
5. signatoryName: Authorized signatory, proprietor, or director name
6. address: Full business or site address
7. state: State of registration (e.g., Delhi, Maharashtra, Uttar Pradesh)
8. issueDate: Date of registration or bill date (YYYY-MM-DD or DD/MM/YYYY)
9. ocrConfidence: Confidence score from 0.00 to 1.00 based on text sharpness and completeness
10. discrepancies: Array of strings indicating any flaws detected (e.g. "expired issue date", "tampered font", "missing QR code")

Return strictly valid JSON matching this schema:
{
  "documentType": "String",
  "extractedId": "String",
  "entityName": "String",
  "tradeName": "String",
  "signatoryName": "String",
  "address": "String",
  "state": "String",
  "issueDate": "String",
  "ocrConfidence": 0.95,
  "discrepancies": []
}`;

    const promptText = `Analyze this uploaded Indian business document (${fileName || 'document'}). Expected document category: ${documentHint}. Extract all credentials with confidence ratings.`;

    const parts = [
      { text: promptText },
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Data,
        },
      },
    ];

    for (const model of this.primaryModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 14000);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) continue;

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            return JSON.parse(text);
          } catch (e) {
            // attempt parsing if wrapped in code blocks
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
          }
        }
      } catch (err) {
        continue;
      }
    }

    return null;
  }
}

module.exports = new GeminiClient();
