import React from 'react';
// import { saveReferral } from '../services/supabase'; // Removed
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { UserIcon, EmailIcon, CheckCircleIcon, BuildingIcon } from './Icon';

interface ReferralFormProps {
  onClose: () => void;
}

const ReferralForm: React.FC<ReferralFormProps> = ({ onClose }) => {
  const [formData, setFormData] = React.useState({
    referrerName: '',
    referrerEmail: '',
    referredName: '',
    referredEmail: '',
    referredCompany: '',
    referralCode: '',
  });
  const submitReferral = useMutation(api.forms.submitReferral);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.referrerName || !formData.referrerEmail || !formData.referredName || !formData.referredEmail || !formData.referralCode) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    console.log("Submitting referral...");

    try {
      await submitReferral({
        referrerName: formData.referrerName,
        referrerEmail: formData.referrerEmail,
        referredName: formData.referredName,
        referredEmail: formData.referredEmail,
        referredCompany: formData.referredCompany,
        referralCode: formData.referralCode,
      });
      console.log("Referral submitted to Supabase.");
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 4000); // Close modal after 4 seconds
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't submit your referral. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center animate-fade-in py-12">
        <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-montserrat">Referral Sent!</h3>
        <p className="text-gray-600 dark:text-white/80 mt-2">Thank you for sharing the opportunity. Your referral has been logged with your unique code:</p>
        <p className="mt-2 text-lg font-bold text-primary bg-primary/10 dark:bg-white/10 py-2 px-4 rounded-lg inline-block">{formData.referralCode}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-montserrat text-center mb-6">Send a Referral</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-lg border border-gray-200 dark:border-white/10">
          <h3 className="font-bold text-primary mb-2">Your Information</h3>
          <div className="space-y-4">
            <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
              <UserIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
              <input type="text" name="referrerName" placeholder="Your Name" value={formData.referrerName} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
            </div>
            <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
              <EmailIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
              <input type="email" name="referrerEmail" placeholder="Your Email" value={formData.referrerEmail} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-lg border border-gray-200 dark:border-white/10">
          <h3 className="font-bold text-primary mb-2">Their Information</h3>
          <div className="space-y-4">
            <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
              <UserIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
              <input type="text" name="referredName" placeholder="Referred Person's Name" value={formData.referredName} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
            </div>
            <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
              <EmailIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
              <input type="email" name="referredEmail" placeholder="Referred Person's Email" value={formData.referredEmail} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
            </div>
            <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
              <BuildingIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
              <input type="text" name="referredCompany" placeholder="Their Company (Optional)" value={formData.referredCompany} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Your Unique Referral Code *</label>
          <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
            <input id="referralCode" type="text" name="referralCode" placeholder="Create a custom code to track this referral" value={formData.referralCode} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
          </div>
        </div>

        {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}

        <div className="text-center pt-2">
          <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 px-8 text-base rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 animate-glow disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Referral'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReferralForm;