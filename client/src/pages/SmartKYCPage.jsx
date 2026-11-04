import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import Stepper from '../components/common/Stepper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  ShieldCheck, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw
} from 'lucide-react';

const SmartKYCPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setKycData, setCurrentStep } = useOnboarding();
  const { t } = useTranslation();

  const [consentChecked, setConsentChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('GST_CERTIFICATE');
  const [manualId, setManualId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Real one-click test records from company's mock registries
  const demoSamples = [
    { label: 'Balaji Dental Care (Active GSTIN)', id: '32TTNXB7384T1ZW', docType: 'GST_CERTIFICATE' },
    { label: 'Balaji Dental (Active Udyam)', id: 'UDYAM-KL-00-3078801', docType: 'UDYAM_CERTIFICATE' },
    { label: 'Vindhya Tours (Cancelled GSTIN - Rejection Test)', id: '37IHKXV5167L1ZS', docType: 'GST_CERTIFICATE' },
  ];

  const handleConsentSubmit = async () => {
    try {
      await api.post('/kyc/consent', {
        consentGiven: true,
        purpose: 'Digital Business Onboarding & Telecom Subscriber Verification under DPDP Act 2023',
      });
      setConsentChecked(true);
    } catch (err) {
      setErrorMsg(err.message || 'Consent submission failed.');
    }
  };

  const handleUploadAndVerify = async (testId = null, testType = null) => {
    try {
      setIsProcessing(true);
      setErrorMsg('');

      const activeIdToVerify = testId || manualId;
      const activeTypeToVerify = testType || documentType;

      const formData = new FormData();
      if (selectedFile) {
        formData.append('document', selectedFile);
      } else {
        const demoContent = `TAX INVOICE / CERTIFICATE: ${activeIdToVerify || '32TTNXB7384T1ZW'}`;
        const blob = new Blob([demoContent], { type: 'text/plain' });
        formData.append('document', blob, `${activeTypeToVerify.toLowerCase()}_sample.pdf`);
      }

      formData.append('documentType', activeTypeToVerify);
      if (activeIdToVerify) {
        formData.append('manualId', activeIdToVerify);
      }

      const res = await api.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data) {
        setUploadResult(res.data);
        setKycData({
          consentGiven: true,
          documentId: res.data.documentId,
          verificationStatus: res.data.verificationStatus,
          extractedId: res.data.extractedId,
          notes: res.message,
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'KYC verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToCheckout = () => {
    setCurrentStep(4);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Stepper currentStep={3} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-airtel-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t('kyc.title', 'Smart KYC & Verification')}</h1>
              <p className="text-xs text-slate-500">{t('kyc.subtitle', 'DPDP Act 2023 compliant • Instant Mock Registry validation')}</p>
            </div>
          </div>
          <Badge variant="brand">{t('kyc.automatedBadge', 'Automated OCR + Registry')}</Badge>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Step A: DPDP Act 2023 Digital Consent Card */}
        {!consentChecked ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center space-x-3 text-slate-900">
              <Lock className="w-6 h-6 text-airtel-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-base">{t('kyc.consentTitle', 'DPDP Act 2023 Digital Subscriber Consent')}</h3>
                <p className="text-xs text-slate-500">{t('kyc.consentSubtitle', 'Digital Personal Data Protection Act compliance')}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                {t('kyc.consentP1', 'By proceeding, you grant explicit consent to Accel Telecom to verify your business identity credentials against official regulatory registries (GSTIN / Udyam) strictly for the following purposes:')}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                <li>{t('kyc.consentB1', 'Automated telecom subscriber KYC validation & B2B GST billing setup')}</li>
                <li>{t('kyc.consentB2', 'Fraud prevention & verification of authorized enterprise signatories')}</li>
                <li>{t('kyc.consentB3', 'Zero retention of non-essential personal identifiers')}</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">{t('kyc.consentTimestampNote', 'Recorded with cryptographic timestamp')}</span>
              <Button
                variant="primary"
                size="md"
                onClick={handleConsentSubmit}
                icon={CheckCircle2}
              >
                {t('kyc.agreeBtn', 'I Agree & Proceed to Upload')}
              </Button>
            </div>
          </div>
        ) : (
          /* Step B: Document Upload & Verification Zone */
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900">{t('kyc.uploadTitle', 'Upload Business Proof')}</h3>
                <span className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('kyc.consentActive', 'DPDP Consent Active')}</span>
                </span>
              </div>

              {/* Document Type Selector */}
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  onClick={() => setDocumentType('GST_CERTIFICATE')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    documentType === 'GST_CERTIFICATE'
                      ? 'border-airtel-600 bg-red-50 text-airtel-700 ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  {t('kyc.gstTab', 'GST Certificate (15-Digit)')}
                </button>
                <button
                  onClick={() => setDocumentType('UDYAM_CERTIFICATE')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    documentType === 'UDYAM_CERTIFICATE'
                      ? 'border-airtel-600 bg-red-50 text-airtel-700 ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  {t('kyc.udyamTab', 'Udyam MSME Registration')}
                </button>
              </div>

              {/* Upload Drag & Drop Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-airtel-500 rounded-2xl p-6 text-center space-y-2 bg-slate-50 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : t('kyc.dragDrop', 'Drag & drop your document or click to browse')}
                </div>
                <p className="text-[11px] text-slate-500">Supports PDF, PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  className="hidden"
                  id="doc-upload-input"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <label
                  htmlFor="doc-upload-input"
                  className="inline-block mt-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {t('kyc.chooseFile', 'Choose File')}
                </label>
              </div>

              {/* Demo Pre-filled Records for Instant Hackathon Testing */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-airtel-600" />
                  <span>{t('kyc.testRecordsTitle', 'One-Click Test Records (Mock Registry)')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {demoSamples.map((sample, idx) => (
                    <button
                      key={idx}
                      disabled={isProcessing}
                      onClick={() => handleUploadAndVerify(sample.id, sample.docType)}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-airtel-500 text-left text-xs font-semibold text-slate-800 transition-all flex flex-col justify-between"
                    >
                      <span className="truncate">{sample.label}</span>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono">{sample.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual ID Input & Run Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder={documentType === 'GST_CERTIFICATE' ? t('kyc.manualInputGst', 'Enter 15-character GSTIN (e.g. 32TTNXB7384T1ZW)') : t('kyc.manualInputUdyam', 'Enter Udyam Number (e.g. UDYAM-KL-00-3078801)')}
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 uppercase tracking-wider font-mono"
                />
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isProcessing}
                  onClick={() => handleUploadAndVerify()}
                  className="w-full sm:w-auto text-xs px-6"
                >
                  {t('kyc.scanVerifyBtn', 'Scan & Verify Instantly')}
                </Button>
              </div>

            </div>

            {/* Verification Results Card */}
            {uploadResult && (
              <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                uploadResult.verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : uploadResult.verificationStatus === 'REJECTED'
                  ? 'bg-red-50/50 border-red-200'
                  : 'bg-amber-50/50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {uploadResult.verificationStatus === 'VERIFIED' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : uploadResult.verificationStatus === 'REJECTED' ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {uploadResult.verificationStatus === 'VERIFIED'
                          ? t('kyc.verifiedTitle', 'Smart KYC Verification Succeeded')
                          : uploadResult.verificationStatus === 'REJECTED'
                          ? t('kyc.rejectedTitle', 'Verification Failed (Registry Invalidation)')
                          : t('kyc.reviewTitle', 'Flagged for Sales Partner Assisted Review')}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {t('kyc.matchedId', 'Matched Identifier:')} <strong className="font-mono">{uploadResult.extractedId}</strong>
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      uploadResult.verificationStatus === 'VERIFIED'
                        ? 'success'
                        : uploadResult.verificationStatus === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {uploadResult.verificationStatus}
                  </Badge>
                </div>

                {/* Registry Details Box */}
                {uploadResult.registryValidation?.matchedRecord && (
                  <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-800">
                      Entity Legal Name: {uploadResult.registryValidation.matchedRecord.legalName || uploadResult.registryValidation.matchedRecord.enterpriseName}
                    </div>
                    <div className="text-slate-600">
                      Trade Name: {uploadResult.registryValidation.matchedRecord.tradeName || 'N/A'}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Registered Address: {uploadResult.registryValidation.matchedRecord.address || uploadResult.registryValidation.matchedRecord.city}
                    </div>
                  </div>
                )}

                {/* Action to proceed */}
                <div className="pt-2 flex justify-end">
                  {uploadResult.verificationStatus === 'VERIFIED' ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleProceedToCheckout}
                      icon={ArrowRight}
                    >
                      {t('kyc.proceedCheckout', 'Proceed to Installation & Checkout')}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setUploadResult(null)}
                      icon={RefreshCw}
                    >
                      {t('kyc.tryAnother', 'Try Another Document')}
                    </Button>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default SmartKYCPage;
