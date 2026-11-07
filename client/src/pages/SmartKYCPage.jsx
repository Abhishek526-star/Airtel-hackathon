import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import Stepper from '../components/common/Stepper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import RequestAssistanceModal from '../components/partner/RequestAssistanceModal';
import { 
  ShieldCheck, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  RefreshCw,
  Building2,
  FileCheck2,
  LayoutDashboard,
  Calendar,
  Check,
  UserCheck,
  Phone,
  MapPin
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
  const [isAssistanceModalOpen, setIsAssistanceModalOpen] = useState(false);

  // Status check for existing verified KYC
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [existingKyc, setExistingKyc] = useState(null);
  const [showReverifyForm, setShowReverifyForm] = useState(false);

  // Registered Enterprise Profiles for Live Registry Cross-Verification
  const demoSamples = [
    { label: 'Balaji Dental Care (Active GSTIN)', id: '32TTNXB7384T1ZW', docType: 'GST_CERTIFICATE', status: 'PASS' },
    { label: 'Balaji Dental (Registered Udyam MSME)', id: 'UDYAM-KL-00-3078801', docType: 'UDYAM_CERTIFICATE', status: 'PASS' },
    { label: 'Vindhya Tours (GSTIN Cancelled / Inactive)', id: '37IHKXV5167L1ZS', docType: 'GST_CERTIFICATE', status: 'REJECT' },
    { label: 'Commercial Utility Bill (Expired >90 Days)', id: 'EXP-BILL-2026-JAN', docType: 'ADDRESS_PROOF', status: 'REJECT' },
    { label: 'Director Signatory ID (Registry Name Mismatch)', id: 'MISMATCH-PAN-889', docType: 'SIGNATORY_ID', status: 'REVIEW' },
  ];

  // Check if current user already has completed KYC
  useEffect(() => {
    let isMounted = true;
    const fetchKYCStatus = async () => {
      try {
        setIsLoadingStatus(true);
        const res = await api.get('/kyc/status');
        if (isMounted && res.success && res.data) {
          if (
            res.data.overallStatus === 'VERIFIED' ||
            res.data.hasGstin ||
            res.data.hasUdyam ||
            user?.businessProfile?.kycStatus === 'VERIFIED' ||
            user?.businessProfile?.hasGstin ||
            user?.businessProfile?.hasUdyam
          ) {
            setExistingKyc(res.data);
            setConsentChecked(true);
            setKycData({
              consentGiven: true,
              verificationStatus: 'VERIFIED',
              extractedId: res.data.kycVerifiedIdentifier || res.data.gstin || res.data.udyamNumber || '',
              notes: 'Verified via Regulatory Registry',
            });
          }
        }
      } catch (err) {
        console.warn('[SmartKYCPage] Status check error:', err);
      } finally {
        if (isMounted) setIsLoadingStatus(false);
      }
    };

    fetchKYCStatus();
    return () => {
      isMounted = false;
    };
  }, [user]);

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

        if (res.data.verificationStatus === 'VERIFIED') {
          setExistingKyc((prev) => ({
            ...prev,
            overallStatus: 'VERIFIED',
            kycVerifiedIdentifier: res.data.extractedId,
            kycDocumentType: res.data.documentType,
            kycVerifiedAt: new Date().toISOString(),
          }));
        }
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

  const isKycCompleted = Boolean(
    existingKyc?.overallStatus === 'VERIFIED' ||
    uploadResult?.verificationStatus === 'VERIFIED' ||
    user?.businessProfile?.hasGstin ||
    user?.businessProfile?.hasUdyam ||
    user?.businessProfile?.kycStatus === 'VERIFIED'
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Stepper currentStep={3} isKycCompleted={isKycCompleted} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        
        {/* Page Title & Status Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isKycCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-airtel-700'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t('kyc.title', 'Smart KYC & Verification')}</h1>
              <p className="text-xs text-slate-500">{t('kyc.subtitle', 'DPDP Act 2023 Compliant • Instant Government Registry Verification (GSTN & Udyam)')}</p>
            </div>
          </div>
          <Badge variant={isKycCompleted ? 'success' : 'brand'}>
            {isKycCompleted ? 'KYC Completed & Verified' : t('kyc.automatedBadge', 'Automated OCR + Registry')}
          </Badge>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Loading state indicator */}
        {isLoadingStatus ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-airtel-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Checking enterprise verification status with regulatory registry...</p>
          </div>
        ) : isKycCompleted && !showReverifyForm ? (
          /* ========================================================= */
          /* PERSISTENT KYC COMPLETED & VERIFIED HERO DISPLAY          */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                      <Check className="w-8 h-8 text-white stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                          Regulatory Verified
                        </span>
                        <span className="text-xs text-emerald-100">DPDP Act 2023 Compliant</span>
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                        Smart KYC Completed & Verified
                      </h2>
                      <p className="text-xs text-emerald-50 mt-0.5">
                        Your enterprise credentials have been verified and authenticated against official government registries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* Entity Legal Name */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Enterprise / Trade Name</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      {existingKyc?.tradeName || user?.businessProfile?.tradeName || 'Gupta Supermart'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      Legal: {existingKyc?.legalName || user?.businessProfile?.legalName || user?.fullName || 'Gupta Enterprises Pvt Ltd'}
                    </div>
                  </div>

                  {/* Verified Identifier */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                    <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Registry Identifier</span>
                    </div>
                    <div className="font-mono font-extrabold text-sm text-emerald-950">
                      {existingKyc?.kycVerifiedIdentifier || existingKyc?.gstin || existingKyc?.udyamNumber || user?.businessProfile?.gstin || user?.businessProfile?.udyamNumber || '32TTNXB7384T1ZW'}
                    </div>
                    <div className="text-xs text-emerald-700 font-semibold">
                      {existingKyc?.hasGstin || existingKyc?.gstin || user?.businessProfile?.gstin
                        ? 'GSTIN Active Taxpayer (GSTN)'
                        : 'Udyam Registered MSME (MSME Registry)'}
                    </div>
                  </div>

                  {/* Compliance & Timestamp */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Verification Audit</span>
                    </div>
                    <div className="font-bold text-xs text-slate-800">
                      Instant Automated OCR Match
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Consent cryptographically sealed</span>
                    </div>
                  </div>

                </div>

                {/* DPDP Act 2023 Security Guarantee Notice */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">DPDP Act 2023 Certified Verification</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your identity and enterprise records are authenticated directly with statutory authorities. No additional documentation is required. You can proceed directly to choose your installation schedule and checkout.
                    </p>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReverifyForm(true)}
                    icon={RefreshCw}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Upload Additional Document / Re-verify
                  </Button>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => navigate('/dashboard')}
                      icon={LayoutDashboard}
                      className="text-xs"
                    >
                      Business Dashboard
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleProceedToCheckout}
                      icon={ArrowRight}
                      className="text-xs px-6"
                    >
                      Proceed to Installation & Checkout
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ) : !consentChecked ? (
          /* ========================================================= */
          /* Step A: DPDP Act 2023 Digital Consent Card                */
          /* ========================================================= */
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
          /* ========================================================= */
          /* Step B: Document Upload & Verification Zone               */
          /* ========================================================= */
          <div className="space-y-6">
            
            {/* If user was already verified but clicked to re-verify */}
            {isKycCompleted && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Your account already has verified KYC. Any new document submitted will append to your verification record.</span>
                </div>
                <button
                  onClick={() => setShowReverifyForm(false)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline ml-2 whitespace-nowrap"
                >
                  Return to Verified Summary
                </button>
              </div>
            )}

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

              {/* Sample Enterprise Verification Profiles */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-airtel-600" />
                  <span>{t('kyc.testRecordsTitle', 'Registered Enterprise Profiles (Live Verification)')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {demoSamples.map((sample, idx) => (
                    <button
                      key={idx}
                      disabled={isProcessing}
                      onClick={() => handleUploadAndVerify(sample.id, sample.docType)}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-airtel-500 text-left text-xs font-semibold text-slate-800 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate pr-1">{sample.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                          sample.status === 'PASS' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : sample.status === 'REJECT' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sample.status}
                        </span>
                      </div>
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

                {/* Assigned Smart KYC Partner Card */}
                {(uploadResult.assignedPartner || existingKyc?.assignedPartner) && uploadResult.verificationStatus !== 'VERIFIED' && (
                  <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            Assigned Smart KYC Verification Partner
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Authorized Airtel field agent dispatched for physical document verification
                          </div>
                        </div>
                      </div>
                      <Badge variant="warning">
                        {uploadResult.assignedPartner?.partnerCode || existingKyc?.assignedPartner?.partnerCode || 'KYC-DEL-101'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Agent</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {uploadResult.assignedPartner?.name || existingKyc?.assignedPartner?.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {uploadResult.assignedPartner?.agencyName || existingKyc?.assignedPartner?.agencyName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Operational Circle</span>
                        <span className="font-semibold text-slate-700 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>{uploadResult.assignedPartner?.territoryCircle || existingKyc?.assignedPartner?.territoryCircle || 'Delhi NCR'}</span>
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold block">
                          🟢 Assigned & Available in Circle
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        {uploadResult.assistanceRequestId ? (
                          <>Request ID: <strong className="font-mono text-slate-700">{uploadResult.assistanceRequestId}</strong></>
                        ) : (
                          <span>Compliant with DPDP Act 2023 Digital Onboarding</span>
                        )}
                      </span>
                      <a
                        href={`tel:${uploadResult.assignedPartner?.phone || existingKyc?.assignedPartner?.phone || '9871122338'}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition self-start sm:self-auto"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Agent: {uploadResult.assignedPartner?.phone || existingKyc?.assignedPartner?.phone}</span>
                      </a>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setUploadResult(null)}
                        icon={RefreshCw}
                      >
                        {t('kyc.tryAnother', 'Try Another Document')}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAssistanceModalOpen(true)}
                        className="bg-slate-800 hover:bg-slate-700"
                      >
                        Request Channel Partner Help
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      <RequestAssistanceModal
        isOpen={isAssistanceModalOpen}
        onClose={() => setIsAssistanceModalOpen(false)}
        defaultType="KYC_ASSISTANCE"
        initialNotes="Need in-person assisted KYC verification or physical document review."
      />
    </div>
  );
};

export default SmartKYCPage;
