import React, { useState, useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';
import { UserIcon, EmailIcon, PhoneIcon, PencilIcon, CheckCircleIcon } from './Icon';
import StyledText from './StyledText';
import { saveContactLead } from '../services/supabase';
import { trackEvent } from '../services/analytics';

interface LetsTalkSectionProps {
    openCalendlyModal: () => void;
}

const LetsTalkSection: React.FC<LetsTalkSectionProps> = ({ openCalendlyModal }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);
    const scrollPositionRef = useRef<number | null>(null);
    
    React.useLayoutEffect(() => {
        if (scrollPositionRef.current !== null && submitted) {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
            scrollPositionRef.current = null;
        }
    }, [submitted]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!formData.name || !formData.email || !formData.message) {
            setError('Please fill in all required fields.');
            return;
        }

        scrollPositionRef.current = window.scrollY;
        console.log("Submitting 'Let's Talk' form data...");
        setLoading(true);
        setSubmitted(false);

        try {
            await saveContactLead({
                Name: formData.name,
                Email: formData.email,
                Phone: formData.phone,
                Message: formData.message,
                BookedDemo: false
            });
            console.log("'Let's Talk' data submitted to Supabase successfully. This confirms the backend connection is working.");

            // Set a static success message confirming the save
            setSuccessMessage(`**Thank you, ${formData.name}!** Your message has been successfully submitted. Our team will get back to you shortly.`);
            
            trackEvent('submit_contact_form');
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', message: '' });

        } catch (err) {
            console.error(err);
            setError("Sorry, we couldn't send your message right now. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleBookDemoClick = () => {
      trackEvent('click_book_demo', { section: 'lets_talk' });
      openCalendlyModal();
    };

    if (submitted && !loading) {
        // Automatically hide the success message after 8 seconds
        setTimeout(() => setSubmitted(false), 8000);
    }

    return (
        <section
            ref={ref}
            id="lets-talk"
            className={`py-16 sm:py-20 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            <div className="container mx-auto px-6">
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-xl md:text-2xl font-bold font-montserrat bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent dark:text-transparent dark:bg-gradient-to-r dark:from-brand-accent dark:via-white dark:to-brand-accent dark:animate-shimmer [background-size:200%_auto]">Let's Talk</h2>
                        <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-white/80">
                            Have a project in mind or just want to learn more? Drop us a line or book a call.
                        </p>
                    </div>

                    {submitted ? (
                        <div className="text-center animate-fade-in py-12">
                            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-montserrat">Submission Confirmed!</h3>
                            <p className="text-gray-600 dark:text-white/80 mt-2 leading-relaxed"><StyledText text={successMessage} /></p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group flex items-center gap-4 px-4 rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm dark:border-white/10 transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
                                    <UserIcon className="h-5 w-5 text-gray-600 dark:text-white/70 flex-shrink-0" />
                                    <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60" required />
                                </div>
                                <div className="group flex items-center gap-4 px-4 rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm dark:border-white/10 transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
                                    <EmailIcon className="h-5 w-5 text-gray-600 dark:text-white/70 flex-shrink-0" />
                                    <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60" required />
                                </div>
                            </div>
                            <div className="group flex items-center gap-4 px-4 rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm dark:border-white/10 transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
                                <PhoneIcon className="h-5 w-5 text-gray-600 dark:text-white/70 flex-shrink-0" />
                                <input type="tel" name="phone" placeholder="Your Phone (Optional)" value={formData.phone} onChange={handleInputChange} className="w-full bg-transparent py-3 border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60" />
                            </div>
                            <div className="group flex items-start gap-4 px-4 py-3 rounded-lg border border-black/10 bg-white/80 dark:bg-black/20 backdrop-blur-sm dark:border-white/10 transition-all group-focus-within:ring-2 group-focus-within:ring-primary/50 dark:group-focus-within:ring-white">
                                <PencilIcon className="h-5 w-5 text-gray-600 dark:text-white/70 flex-shrink-0 mt-1" />
                                <textarea name="message" placeholder="Your Message" rows={5} value={formData.message} onChange={handleInputChange} className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/60 resize-none" required></textarea>
                            </div>

                            {error && <p className="text-center text-red-400 text-sm" role="alert" aria-live="polite">{error}</p>}

                            <div className="text-center pt-2 flex flex-col items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full max-w-sm bg-primary/20 border border-primary/50 text-gray-800 dark:text-white font-bold py-2.5 text-sm px-12 rounded-full hover:bg-primary/30 transition-all transform hover:scale-105 animate-glow disabled:bg-primary/10 disabled:border-primary/20 disabled:text-gray-400 dark:disabled:text-white/50 disabled:cursor-not-allowed disabled:animate-none flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : 'Send Message'}
                                </button>

                                <div className="relative w-full max-w-xs text-center">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-gray-300 dark:border-white/20"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white/20 backdrop-blur-sm dark:bg-brand-dark px-2 text-sm text-gray-500 dark:text-white/60">OR</span>
                                    </div>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={handleBookDemoClick}
                                    className="w-full max-w-sm bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white font-bold py-2.5 text-sm px-12 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all transform hover:scale-105"
                                >
                                    Book a 15-Min Demo Call
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default LetsTalkSection;