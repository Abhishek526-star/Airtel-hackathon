const fs = require('fs');

let content = fs.readFileSync('README.md', 'utf8');

const target = '## 3. Pre-Configured Demo Credentials & Quick Switcher';
const newSection = `## 3. Pan-India Multi-Language Support (10 Official Indian Languages)

To eliminate digital adoption barriers for micro-enterprises across every Indian state, the entire platform provides real-time, zero-reload multilingual localization. The supported languages match the exact distribution found in the official \`smb_leads.csv\` dataset:

| Code | Language | Native Script | Primary Target States / Regions |
| :---: | :--- | :--- | :--- |
| \`en\` | **English** | English | Pan-India Enterprise Standard |
| \`hi\` | **Hindi** | हिंदी | Delhi NCR, UP, MP, Bihar, Rajasthan, Haryana |
| \`ta\` | **Tamil** | தமிழ் | Tamil Nadu, Puducherry |
| \`te\` | **Telugu** | తెలుగు | Andhra Pradesh, Telangana |
| \`mr\` | **Marathi** | मराठी | Maharashtra |
| \`bn\` | **Bengali** | বাংলা | West Bengal, Tripura, Assam |
| \`gu\` | **Gujarati** | ગુજરાતી | Gujarat, Daman & Diu |
| \`kn\` | **Kannada** | ಕನ್ನಡ | Karnataka |
| \`ml\` | **Malayalam** | മലയാളം | Kerala, Lakshadweep |
| \`pa\` | **Punjabi** | ਪੰਜਾਬੀ | Punjab, Chandigarh |

### Multi-Language Features:
1. **Interactive Language Selector:** Accessible via the Globe icon dropdown in the top header and mobile drawer. Switching languages immediately reflects across all active components without page reloads.
2. **AI Business Advisor in Native Language:** Conversational questions and response options are presented in the customer's selected language, reducing apprehension for non-English-speaking Kirana proprietors.
3. **Smart KYC & DPDP Consent:** Critical consent forms, document upload instructions, and validation diagnoses are clearly explained in the user's native tongue.
4. **Persistent Preference:** Selected language is stored in browser \`localStorage\` under \`udyam_language_preference\` and syncs with HTML \`lang\` attributes.

---

## 4. Pre-Configured Demo Credentials & Quick Switcher`;

content = content.replace(target, newSection);
content = content.replace('## 4. Official Company Datasets Integrated', '## 5. Official Company Datasets Integrated');
content = content.replace('## 5. Technology Stack & Directory Structure', '## 6. Technology Stack & Directory Structure');
content = content.replace('## 6. Architecture & Implementation Highlights', '## 7. Architecture & Implementation Highlights');
content = content.replace('## 7. How to Run Locally', '## 8. How to Run Locally');
content = content.replace('## 8. Automated Verification & Subsystem Test Suite', '## 9. Automated Verification & Subsystem Test Suite');

fs.writeFileSync('README.md', content, 'utf8');
console.log('README.md successfully updated with Section 3 Multi-Language Support!');

