import React, { useState } from 'react';
import StyledText from './StyledText';
import { CheckIcon, Icon } from './Icon';
import Modal from './Modal';
import AffiliateApplicationForm from './AffiliateApplicationForm';
import ReferralForm from './ReferralForm';

interface PartnerPageProps {
  navigate: (path: string) => void;
}

const PartnerPage: React.FC<PartnerPageProps> = ({ navigate }) => {
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  const handleReferralClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsReferralModalOpen(true);
  };

  const handleAffiliateApplyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsAffiliateModalOpen(true);
  };

  return (
    <>
      <div className="relative z-10 animate-fade-in">
        <div className="container mx-auto px-6 py-24 sm:py-32">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <button 
                onClick={() => navigate('/')} 
                className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-3xl md:text-4xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">
                Partner With Synaptix Studio
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-white/80 max-w-2xl mx-auto">
                Earn commissions. Empower businesses. Grow together.
              </p>
              <p className="mt-6 text-base text-gray-700 dark:text-white/70 max-w-3xl mx-auto">
                At Synaptix Studio, we believe automation should be for everyone — and if you believe the same, we want to work with you. Whether you’re a creator, consultant, freelancer, or someone who just knows a few business owners, you can start earning by simply referring people to us.
              </p>
            </div>

            <div className="my-16">
              <h2 className="text-center text-xl font-bold text-gray-900 dark:text-white font-montserrat mb-8">We’ve got two ways to partner with us:</h2>
              <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                  {/* Affiliate Program */}
                  <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl p-8 flex flex-col">
                  <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-4 flex items-center gap-3"><Icon name="zap" className="h-6 w-6 text-primary" /> 1. Affiliate Program</h2>
                  <p className="text-gray-600 dark:text-white/80 mb-6">Earn passive income by sharing your custom link.</p>
                  
                  <div className="space-y-4 mb-6">
                      <h3 className="font-bold text-primary flex items-center gap-2"><Icon name="chart-bar" className="h-5 w-5" /> Commission:</h3>
                      <ul className="text-gray-700 dark:text-white/90 space-y-2 text-sm">
                          <li><StyledText text="**10%** of the One-Time Setup Fee" /></li>
                          <li><StyledText text="**10%** of the first 3 months of Retainer" /></li>
                          <li className="text-gray-500 dark:text-white/60 italic">(avg. client value: $1,500–$10,000+)</li>
                      </ul>
                  </div>
                  <div className="space-y-4 mb-6">
                      <h3 className="font-bold text-primary flex items-center gap-2"><Icon name="target" className="h-5 w-5" /> Perfect for:</h3>
                      <ul className="text-gray-700 dark:text-white/90 space-y-2 text-sm list-disc list-inside">
                          <li>Content creators & Agencies</li>
                          <li>Tech influencers</li>
                          <li>Bloggers, YouTubers</li>
                          <li>SaaS tool communities</li>
                      </ul>
                  </div>
                  <div className="space-y-4 flex-grow">
                      <h3 className="font-bold text-primary flex items-center gap-2"><Icon name="gear" className="h-5 w-5" /> What you get:</h3>
                      <ul className="text-gray-700 dark:text-white/90 space-y-2 text-sm list-disc list-inside">
                          <li>Your own custom referral dashboard</li>
                          <li>Trackable affiliate links</li>
                          <li>Monthly payouts via Payoneer or bank</li>
                          <li>Access to marketing assets</li>
                          <li>Dedicated partner support</li>
                      </ul>
                  </div>
                  <a href="#apply" onClick={handleAffiliateApplyClick} className="mt-8 w-full block text-center bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 animate-glow">
                      Apply for Affiliate Program
                      </a>
                  </div>

                  {/* Referral Program */}
                  <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl p-8 flex flex-col">
                  <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-4 flex items-center gap-3"><Icon name="megaphone" className="h-6 w-6 text-primary" /> 2. Referral Program</h2>
                  <p className="text-gray-600 dark:text-white/80 mb-6">Got a client or a friend who needs automation? Send them our way.</p>
                  
                  <div className="space-y-4 mb-6">
                      <h3 className="font-bold text-primary flex items-center gap-2"><Icon name="chart-bar" className="h-5 w-5" /> Commission Options:</h3>
                      <ul className="text-gray-700 dark:text-white/90 space-y-2 text-sm">
                          <li><StyledText text="**Flat bonus: $200–$500** per closed lead" /></li>
                          <li className="text-gray-500 dark:text-white/70">OR choose ongoing commission like the affiliate model</li>
                      </ul>
                  </div>
                  <div className="space-y-4 mb-6">
                      <h3 className="font-bold text-primary flex items-center gap-2"><Icon name="target" className="h-5 w-5" /> Perfect for:</h3>
                      <ul className="text-gray-700 dark:text-white/90 space-y-2 text-sm list-disc list-inside">
                          <li>Freelancers with business clients</li>
                          <li>Past clients who loved our work</li>
                          <li>Consultants, growth hackers, advisors</li>
                          <li>Sales pros & biz dev folks</li>
                      </ul>
                  </div>
                  <div className="space-y-4 flex-grow">
                      <p className="text-gray-700 dark:text-white/90 font-semibold flex items-center gap-2"><Icon name="users" className="h-5 w-5 text-primary" /> No need for content or links — just introduce us.</p>
                  </div>
                  <a href="#refer" onClick={handleReferralClick} className="mt-8 w-full block text-center bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-gray-900/10 dark:border-white/20 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-full hover:bg-white/50 dark:hover:bg-black/50 transition-all transform hover:scale-105 animate-glow">
                      Send a Referral
                      </a>
                  </div>
              </div>
            </div>
            
             {/* What We Automate */}
            <div className="my-16 max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-3"><Icon name="gear" className="h-7 w-7" /> What We Automate (aka Why They’ll Thank You)</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                   {['AI Voice Receptionists', 'AI Chatbots (Website, WhatsApp, Messenger)', 'CRM & Lead Management Tools', 'Automation Workflows', 'Web Funnels & Custom Dashboards', 'AI Agents for Sales, Support, Outreach & more'].map(item => (
                       <div key={item} className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 rounded-lg text-sm text-gray-800 dark:text-white/90">{item}</div>
                   ))}
               </div>
            </div>
            
            {/* Who to Refer */}
            <div className="my-16 max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-3"><Icon name="users" className="h-7 w-7" /> Who Should You Refer?</h2>
               <p className="text-center text-gray-600 dark:text-white/80 mb-6">Any business that:</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {['Takes too long to reply to leads', 'Struggles with repetitive tasks', 'Needs a smarter CRM', 'Wants AI agents but doesn’t know where to start', 'Wants to scale without hiring more people', 'Is overwhelmed by customer support inquiries'].map(item => (
                       <div key={item} className="flex items-center gap-3 bg-white/20 dark:bg-black/20 backdrop-blur-md p-3 rounded-lg">
                          <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-800 dark:text-white/90">{item}</span>
                       </div>
                   ))}
               </div>
            </div>
            
             {/* Extras */}
            <div className="my-16 max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-3"><Icon name="sparkles" className="h-7 w-7" /> Extras for Our Partners</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                   {['Onboarding to help you sell smarter', 'Bundle deals for your audience', 'Idea jam sessions if you want to co-create something cool', 'Priority access to new tools we’re building'].map(item => (
                       <div key={item} className="bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 rounded-lg text-sm text-gray-800 dark:text-white/90 font-semibold">{item}</div>
                   ))}
               </div>
            </div>

            {/* Transparency Promise */}
            <div className="my-16 max-w-2xl mx-auto bg-white/20 dark:bg-black/20 backdrop-blur-md border-2 border-dashed border-primary/50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat mb-3 flex items-center justify-center gap-2"><Icon name="check" className="h-6 w-6 text-primary" /> Transparency Promise</h3>
              <p className="text-gray-600 dark:text-white/80">We track every lead. We pay on time. We keep things fair. No weird fine print. No ghosting.</p>
            </div>
            
            <div className="text-center">
                <h2 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white flex items-center justify-center gap-3"><Icon name="users" className="h-8 w-8 text-primary" /> Let’s Build Smarter Businesses — Together.</h2>
                <p className="mt-4 text-gray-600 dark:text-white/80">
                  Questions? Email us at <a href="mailto:info@synaptixstudio.com" className="text-primary hover:underline">info@synaptixstudio.com</a> or DM us on <a href="https://www.linkedin.com/company/synaptix-studio" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>.
                </p>
            </div>

          </div>
        </div>
      </div>
      <Modal isOpen={isAffiliateModalOpen} onClose={() => setIsAffiliateModalOpen(false)}>
        <AffiliateApplicationForm onClose={() => setIsAffiliateModalOpen(false)} />
      </Modal>

      <Modal isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)}>
        <ReferralForm onClose={() => setIsReferralModalOpen(false)} />
      </Modal>
    </>
  );
};

export default PartnerPage;