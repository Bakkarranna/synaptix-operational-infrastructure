import React from 'react';
import { saveAffiliateApplication } from '../services/supabase';
import { UserIcon, EmailIcon, CheckCircleIcon, LinkedInIcon, CodeIcon } from './Icon';

interface AffiliateApplicationFormProps {
  onClose: () => void;
}

const AffiliateApplicationForm: React.FC<AffiliateApplicationFormProps> = ({ onClose }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    socialProfile: '',
    workedBefore: 'No',
    affiliateCode: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name || !formData.email || !formData.socialProfile || !formData.affiliateCode) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    console.log("Submitting affiliate application...");

    try {
      await saveAffiliateApplication({
        Name: formData.name,
        Email: formData.email,
        SocialProfile: formData.socialProfile,
        WorkedWithUs: formData.workedBefore,
        AffiliateCode: formData.affiliateCode,
      });
      console.log("Affiliate application submitted to Supabase.");
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 4000); // Close modal after 4 seconds
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't submit your application. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center animate-fade-in py-12">
        <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-montserrat">Application Received!</h3>
        <p className="text-gray-600 dark:text-white/80 mt-2">Thank you for your interest. We'll review your profile and get back to you in 1-2 business days. Your affiliate code is registered as:</p>
        <p className="mt-2 text-lg font-bold text-primary bg-primary/10 dark:bg-white/10 py-2 px-4 rounded-lg inline-block">{formData.affiliateCode}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-montserrat text-center mb-6">Affiliate Program Application</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
          <UserIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
          <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
        </div>
        <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
          <EmailIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
          <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
        </div>
        <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
          <LinkedInIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
          <input type="url" name="socialProfile" placeholder="LinkedIn or Social Profile URL" value={formData.socialProfile} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
        </div>
        <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
          <CodeIcon className="h-5 w-5 text-gray-500 dark:text-white/70 flex-shrink-0" />
          <input type="text" name="affiliateCode" placeholder="Your Unique Affiliate Code" value={formData.affiliateCode} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
        </div>
        <div>
          <label htmlFor="workedBefore" className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Have you worked with us before?</label>
          <div className="group flex items-center gap-3 px-4 rounded-lg border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/30 backdrop-blur-sm transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white relative">
            <select id="workedBefore" name="workedBefore" value={formData.workedBefore} onChange={handleInputChange} className="w-full bg-transparent py-3 pr-8 border-none focus:ring-0 appearance-none text-gray-900 dark:text-white">
              <option className="bg-white dark:bg-gray-800">No</option>
              <option className="bg-white dark:bg-gray-800">Yes</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-white/70">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {error && <p className="text-center text-red-400 text-sm" role="alert">{error}</p>}

        <div className="text-center pt-2">
          <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 px-8 text-base rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 animate-glow disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AffiliateApplicationForm;