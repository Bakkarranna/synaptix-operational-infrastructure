
import React, { useState, useEffect, useRef } from 'react';
import { CORE_SERVICES, ADD_ONS, TRUST_POINTS, YEARLY_DISCOUNT_PERCENTAGE, CALENDLY_LINK, ROI_HIGHLIGHTS, CURRENCIES } from '../constants';
import { useOnScreen } from '../hooks/useOnScreen';
import { Icon, IconName, CheckIcon } from './Icon';
import StyledText from './StyledText';
import { checkReferralCode } from '../services/supabase';
import TrustedBySection from './TrustedBySection';

interface PricingSectionProps {
  navigate: (path: string) => void;
  openCalendlyModal: () => void;
}
type FeeRange = { min: number; max: number };
type PricingPlan = 'monthly' | 'yearly';

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const valueRef = useRef(0);

  useEffect(() => {
    const startValue = valueRef.current;
    valueRef.current = value;
    let startTimestamp: number | null = null;
    const duration = 500;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const nextValue = Math.floor(progress * (value - startValue) + startValue);
      setCurrentValue(nextValue);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCurrentValue(value);
      }
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span>{value === 0 ? '0' : currentValue.toLocaleString()}</span>;
};

const PricingSection: React.FC<PricingSectionProps> = ({ navigate, openCalendlyModal }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisible = useOnScreen(sectionRef);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [pricingPlan, setPricingPlan] = useState<PricingPlan>('monthly');
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  
  const [totalSetupFee, setTotalSetupFee] = useState<FeeRange>({ min: 0, max: 0 });
  const [totalRetainerFee, setTotalRetainerFee] = useState<FeeRange>({ min: 0, max: 0 });

  const selectedCurrency = CURRENCIES[currency as keyof typeof CURRENCIES];

  useEffect(() => {
    const newSetupFee: FeeRange = { min: 0, max: 0 };
    const newRetainerFee: FeeRange = { min: 0, max: 0 };
    
    selectedServices.forEach(serviceId => {
      const service = CORE_SERVICES.find(s => s.id === serviceId);
      if (service) {
        newSetupFee.min += service.setupFeeRange.min;
        newSetupFee.max += service.setupFeeRange.max;
        newRetainerFee.min += service.retainerFeeRange.min;
        newRetainerFee.max += service.retainerFeeRange.max;
      }
    });

    selectedAddons.forEach(addonId => {
        const addon = ADD_ONS.find(a => a.id === addonId);
        if(addon) {
            newSetupFee.min += addon.setupFee;
            newSetupFee.max += addon.setupFee;
            newRetainerFee.min += addon.monthlyFee;
            newRetainerFee.max += addon.monthlyFee;
        }
    });

    if (referralApplied) {
        const discount = 0.9; // 10% discount
        newSetupFee.min *= discount;
        newSetupFee.max *= discount;
    }

    setTotalSetupFee(newSetupFee);
    setTotalRetainerFee(newRetainerFee);
  }, [selectedServices, selectedAddons, referralApplied]);

  const handleSelectService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  const handleSelectAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };
  
  const handleApplyReferral = async () => {
      if (!referralCode.trim() || isVerifyingCode) return;
    
      setIsVerifyingCode(true);
      setReferralError(null);
      setReferralApplied(false);

      try {
          const isValid = await checkReferralCode(referralCode);
          if (isValid) {
              setReferralApplied(true);
          } else {
              setReferralError('Invalid or expired code.');
          }
      } catch (error) {
          console.error('Error verifying code:', error);
          setReferralError('Could not verify code. Please try again.');
      } finally {
          setIsVerifyingCode(false);
      }
  }
  
  const yearlyDiscountMultiplier = (100 - YEARLY_DISCOUNT_PERCENTAGE) / 100;

  return (
    <section 
      ref={sectionRef} 
      id="pricing" 
      className="py-16 sm:py-20"
    >
      <div className="container mx-auto px-6 space-y-20">
        <div className={`text-center transition-all duration-700 ease-out ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl md:text-3xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:text-transparent dark:animate-shimmer [background-size:200%_auto]">
            Build Your Custom AI Automation Quote
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80 max-w-3xl mx-auto">
            No fixed packages. Just tailored solutions for your unique business needs. Mix & match any of our AI-powered solutions below to generate a real-time pricing estimate.
          </p>
        </div>

        {/* Interactive Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Service Selection */}
            <div className="lg:col-span-2 space-y-12">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat mb-4 flex items-center gap-2">
                      <Icon name="gear" className="h-6 w-6 text-primary" />
                      <span>Step 1: Choose Core Services</span>
                    </h3>
                     <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-inner">
                        <div className="hidden md:grid md:grid-cols-[auto_minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] items-center text-xs text-gray-500 dark:text-white/70 uppercase tracking-wider bg-white/10 dark:bg-black/10 px-4 py-3 font-semibold md:gap-x-4">
                            <div className="w-12"></div>
                            <div>Service</div>
                            <div className="text-center">One-Time Setup</div>
                            <div className="text-center">Monthly Retainer</div>
                        </div>
                        <div className="divide-y divide-gray-900/10 dark:divide-white/10 md:divide-y-0">
                            {CORE_SERVICES.map((service, index) => {
                                const isSelected = selectedServices.includes(service.id);
                                return (
                                <div
                                    key={service.id}
                                    onClick={() => handleSelectService(service.id)}
                                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-white/10 dark:hover:bg-black/10'}`}
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    tabIndex={0}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectService(service.id)}
                                >
                                    {/* Desktop View */}
                                    <div className="hidden md:grid md:grid-cols-[auto_minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] items-center px-4 py-4 text-sm md:gap-x-4">
                                        <div className="w-12 flex justify-center">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${isSelected ? 'bg-primary border-primary' : 'bg-transparent border-gray-400 dark:border-white/50'}`}>
                                                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <Icon name={service.icon} className="h-6 w-6 text-primary flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{service.title}</p>
                                                    <p className="font-normal text-xs text-gray-600 dark:text-white/70">{service.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center font-semibold text-gray-800 dark:text-white/90 whitespace-nowrap">${service.setupFeeRange.min.toLocaleString()} - ${service.setupFeeRange.max.toLocaleString()}</div>
                                        <div className="text-center font-semibold text-gray-800 dark:text-white/90 whitespace-nowrap">${service.retainerFeeRange.min.toLocaleString()} - ${service.retainerFeeRange.max.toLocaleString()}</div>
                                    </div>
                                    {/* Mobile View */}
                                    <div className="md:hidden p-3 flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${isSelected ? 'bg-primary border-primary' : 'bg-transparent border-gray-400 dark:border-white/50'}`}>
                                                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <div className="flex-grow flex items-center gap-3">
                                            <Icon name={service.icon} className="h-5 w-5 text-primary flex-shrink-0" />
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{service.title}</p>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white font-montserrat mb-4 flex items-center gap-2">
                      <Icon name="lightbulb" className="h-6 w-6 text-primary" />
                      <span>Step 2: Choose Optional Add-Ons</span>
                    </h3>
                     <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-inner">
                        <div className="hidden md:grid md:grid-cols-[auto_minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] items-center text-xs text-gray-500 dark:text-white/70 uppercase tracking-wider bg-white/10 dark:bg-black/10 px-4 py-3 font-semibold md:gap-x-4">
                            <div className="w-12"></div>
                            <div>Add-On</div>
                            <div className="text-center">One-Time Setup</div>
                            <div className="text-center">Monthly Fee</div>
                        </div>
                        <div className="divide-y divide-gray-900/10 dark:divide-white/10 md:divide-y-0">
                            {ADD_ONS.map((addon, index) => {
                                const isSelected = selectedAddons.includes(addon.id);
                                return (
                                <div
                                    key={addon.id}
                                    onClick={() => handleSelectAddon(addon.id)}
                                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-white/10 dark:hover:bg-black/10'}`}
                                    role="checkbox"
                                    aria-checked={isSelected}
                                    tabIndex={0}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectAddon(addon.id)}
                                >
                                    {/* Desktop View */}
                                    <div className="hidden md:grid md:grid-cols-[auto_minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] items-center px-4 py-4 text-sm md:gap-x-4">
                                        <div className="w-12 flex justify-center">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${isSelected ? 'bg-primary border-primary' : 'bg-transparent border-gray-400 dark:border-white/50'}`}>
                                                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <div className="font-medium text-gray-900 dark:text-white">{addon.title}</div>
                                        <div className="text-center font-semibold text-gray-800 dark:text-white/90 whitespace-nowrap">{addon.setupFee > 0 ? `$${addon.setupFee.toLocaleString()}` : '—'}</div>
                                        <div className="text-center font-semibold text-gray-800 dark:text-white/90 whitespace-nowrap">{addon.monthlyFee > 0 ? `$${addon.monthlyFee.toLocaleString()}` : '—'}</div>
                                    </div>
                                    {/* Mobile View */}
                                     <div className="md:hidden p-3 flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all duration-200 ${isSelected ? 'bg-primary border-primary' : 'bg-transparent border-gray-400 dark:border-white/50'}`}>
                                                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{addon.title}</p>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quote Summary & ROI */}
            <div className="lg:col-span-1 lg:sticky top-24">
                 <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl shadow-2xl p-4 sm:p-6">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white font-montserrat text-center mb-4 flex items-center justify-center gap-2">
                        <Icon name="calculator" className="h-6 w-6 text-primary" />
                        <span>Step 3: Your Estimate</span>
                    </h3>
                    
                    <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
                      {Object.keys(CURRENCIES).map(curr => (
                        <button
                          key={curr}
                          onClick={() => setCurrency(curr)}
                          className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                            currency === curr ? 'bg-primary text-white' : 'bg-white/20 dark:bg-black/20 text-gray-700 dark:text-white/70 hover:bg-white/30 dark:hover:bg-black/30'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>

                    {/* One-Time Fee */}
                    <div className="text-center my-4 sm:my-6">
                        <p className="text-sm font-semibold text-gray-600 dark:text-white/70 tracking-wider uppercase">One-Time Setup Fee</p>
                         <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white my-1">
                           {selectedCurrency.symbol}
                           {totalSetupFee.min > 0 ? <AnimatedNumber value={Math.round(totalSetupFee.min * selectedCurrency.rate)} /> : '0'}
                           {totalSetupFee.max > totalSetupFee.min && <> - {selectedCurrency.symbol}<AnimatedNumber value={Math.round(totalSetupFee.max * selectedCurrency.rate)} /></>}
                        </p>
                    </div>
                    
                    <div className="h-px bg-gray-900/10 dark:bg-white/10 my-4" />

                    {/* Retainer Fee */}
                    <div className="text-center my-4 sm:my-6">
                         <div className="flex justify-center items-center gap-4 mb-4">
                            <span className={`text-sm font-semibold transition-colors ${pricingPlan === 'monthly' ? 'text-primary' : 'text-gray-500 dark:text-white/60'}`}>Pay Monthly</span>
                            <button onClick={() => setPricingPlan(p => p === 'monthly' ? 'yearly' : 'monthly')} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${pricingPlan === 'yearly' ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`} role="switch" aria-checked={pricingPlan === 'yearly'}>
                                <span className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${pricingPlan === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                            <span className={`text-sm font-semibold transition-colors ${pricingPlan === 'yearly' ? 'text-primary' : 'text-gray-500 dark:text-white/60'}`}>Pay Yearly</span>
                        </div>
                        
                        {pricingPlan === 'yearly' && (
                            <div className="bg-green-500/10 text-green-600 dark:text-green-300 text-xs font-bold py-1 px-3 rounded-full inline-block mb-2 animate-fade-in-fast">
                                Save {YEARLY_DISCOUNT_PERCENTAGE}% (Almost 3 months free!)
                            </div>
                        )}
                        
                        <p className="text-sm font-semibold text-gray-600 dark:text-white/70 tracking-wider uppercase">{pricingPlan === 'monthly' ? 'Monthly' : 'Yearly'} Retainer</p>
                        {pricingPlan === 'monthly' ? (
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white my-1">
                                {selectedCurrency.symbol}
                                {totalRetainerFee.min > 0 ? <AnimatedNumber value={Math.round(totalRetainerFee.min * selectedCurrency.rate)} /> : '0'}
                                {totalRetainerFee.max > totalRetainerFee.min && <> - {selectedCurrency.symbol}<AnimatedNumber value={Math.round(totalRetainerFee.max * selectedCurrency.rate)} /></>}
                                <span className="text-lg text-gray-500 dark:text-white/60">/mo</span>
                            </p>
                        ) : (
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white my-1">
                                {selectedCurrency.symbol}
                                {totalRetainerFee.min > 0 ? <AnimatedNumber value={Math.round(totalRetainerFee.min * 12 * yearlyDiscountMultiplier * selectedCurrency.rate)} /> : '0'}
                                {totalRetainerFee.max > totalRetainerFee.min && <> - {selectedCurrency.symbol}<AnimatedNumber value={Math.round(totalRetainerFee.max * 12 * yearlyDiscountMultiplier * selectedCurrency.rate)} /></>}
                                <span className="text-lg text-gray-500 dark:text-white/60">/yr</span>
                            </p>
                        )}
                    </div>
                    
                     <div className="h-px bg-gray-900/10 dark:bg-white/10 my-4 sm:my-6" />

                     {/* Referral */}
                     <div className="space-y-2">
                         <label htmlFor="referral" className="text-sm font-semibold text-gray-600 dark:text-white/70">Have a referral code?</label>
                         <div className="flex gap-2">
                             <input 
                                id="referral" 
                                type="text" 
                                value={referralCode} 
                                onChange={e => { 
                                    setReferralCode(e.target.value); 
                                    setReferralApplied(false); 
                                    setReferralError(null);
                                }} 
                                placeholder="Enter code" 
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-900/10 bg-white/20 dark:bg-black/20 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition text-sm"
                             />
                             <button 
                                onClick={handleApplyReferral} 
                                disabled={isVerifyingCode || !referralCode.trim()}
                                className="bg-white/20 dark:bg-black/20 backdrop-blur-sm text-gray-800 dark:text-white text-sm font-bold px-4 rounded-lg hover:bg-white/30 dark:hover:bg-black/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-24"
                             >
                                {isVerifyingCode ? (
                                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Apply'}
                             </button>
                         </div>
                         {referralApplied && <p className="text-green-500 dark:text-green-300 text-xs text-center animate-fade-in-fast font-semibold">A 10% discount has been applied to your setup fee!</p>}
                         {referralError && <p className="text-red-500 dark:text-red-400 text-xs text-center animate-fade-in-fast">{referralError}</p>}
                     </div>

                    <button onClick={openCalendlyModal} className="mt-4 sm:mt-6 w-full inline-block text-center bg-primary text-white font-bold py-2.5 sm:py-3 px-6 text-sm sm:text-base rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 animate-glow">
                      Book a Free Discovery Call
                    </button>
                    <p className="text-center text-xs text-gray-500 dark:text-white/60 mt-3">Final quote confirmed after discovery call.</p>
                 </div>
                 
                 <div className="mt-8">
                    {(selectedServices.length > 0 || selectedAddons.length > 0) && (
                        <div className="space-y-3 animate-fade-in">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white font-montserrat text-center">Potential ROI Highlights</h3>
                            {[...selectedServices, ...selectedAddons].map(itemId => {
                                const highlight = ROI_HIGHLIGHTS[itemId];
                                if (!highlight) return null;
                                return (
                                    <div key={itemId} className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl p-3 flex items-start gap-3">
                                        <Icon name={highlight.icon} className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{highlight.title}</h4>
                                            <p className="text-xs text-gray-600 dark:text-white/70">{highlight.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* How it works */}
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-8">How Our Pricing Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl p-4">
                    <h3 className="font-bold text-base text-primary mb-3">1. One-Time Setup Fee</h3>
                    <p className="text-gray-600 dark:text-white/80 text-sm">This covers the entire initial project lifecycle: strategy, design, development, testing, and deployment. It’s a one-time investment that saves you the cost and headache of hiring 1-3 full-time employees.</p>
                </div>
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl p-4">
                    <h3 className="font-bold text-base text-primary mb-3">2. Monthly Retainer</h3>
                    <p className="text-gray-600 dark:text-white/80 text-sm">This covers all ongoing operational costs, including hosting, platform fees (e.g., Twilio, OpenAI), API token usage, system monitoring, maintenance, small updates, and dedicated customer support.</p>
                </div>
            </div>
        </div>
        
         {/* Trust Section */}
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-8">Why Clients Trust Synaptix Studio</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TRUST_POINTS.map((point, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/20 dark:bg-black/20 backdrop-blur-md p-3 rounded-lg">
                        <Icon name={point.icon} className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-800 dark:text-white/90 text-sm text-left">{point.text}</span>
                    </div>
                ))}
            </div>
        </div>
        <TrustedBySection />
      </div>
    </section>
  );
};

export default PricingSection;
