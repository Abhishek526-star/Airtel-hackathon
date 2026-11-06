import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { 
  X, 
  UserCheck, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase,
  ShieldCheck,
  Send
} from 'lucide-react';

const RequestAssistanceModal = ({ isOpen, onClose, defaultType = 'KYC_ASSISTANCE', initialNotes = '' }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    businessName: user?.businessProfile?.tradeName || '',
    locationCircle: user?.businessProfile?.address?.city?.includes('Delhi') ? 'Delhi NCR' : 'Delhi NCR',
    requestType: defaultType,
    notes: initialNotes,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [assignedResult, setAssignedResult] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMsg('');

      const res = await api.post('/partner/request-assistance', formData);
      if (res.success && res.data) {
        setAssignedResult(res.data);
      } else {
        throw new Error(res.message || 'Could not assign partner');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Partner assignment failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-red-600 text-white shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Request Channel Partner Assistance
              </h3>
              <p className="text-xs text-slate-300">
                Location-based auto assignment to certified Airtel field agents
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {assignedResult ? (
            /* Assignment Success View */
            <div className="space-y-5 text-center py-2 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <Badge variant="success">Assigned & Dispatched</Badge>
                <h4 className="text-lg font-bold text-slate-900 mt-2">
                  Channel Partner Assigned Successfully!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  A certified enterprise field sales partner in your telecom circle has accepted your request.
                </p>
              </div>

              {/* Partner Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {assignedResult.assignedPartner?.fullName}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {assignedResult.assignedPartner?.agencyName}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700">
                    ID: {assignedResult.assignedPartner?.partnerCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/80">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{assignedResult.assignedPartner?.territoryCircle}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status: Available (Active)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`tel:${assignedResult.assignedPartner?.phone}`}
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Agent: {assignedResult.assignedPartner?.phone}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>Request Ref: <strong className="font-mono text-slate-700">{assignedResult.request?.requestId}</strong></span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-airtel-700 font-bold hover:underline"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Request Form View */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Circle Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Telecom Circle (Location)
                </label>
                <select
                  name="locationCircle"
                  value={formData.locationCircle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai Metro">Mumbai Metro</option>
                  <option value="Bengaluru Urban">Bengaluru Urban</option>
                  <option value="Pune Hub">Pune Hub</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Engine will match currently available active partners stationed in this circle.
                </p>
              </div>

              {/* Request Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assistance Type
                </label>
                <select
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="KYC_ASSISTANCE">Smart KYC / Physical Document Verification</option>
                  <option value="FIELD_VISIT">Schedule In-Person Field Site Survey</option>
                  <option value="QUOTE_REVIEW">Commercial Quote & Bandwidth Customization</option>
                  <option value="GENERAL_ASSISTANCE">General Business Telecom Consultation</option>
                </select>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="e.g. Rajesh Gupta"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    placeholder="10-digit number"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Requirements or Issue Context
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="e.g. Facing difficulty with partnership deed OCR, need in-person verification."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  icon={Send}
                  className="w-full text-xs shadow-md shadow-red-500/20"
                >
                  Assign Available Channel Partner
                </Button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default RequestAssistanceModal;

