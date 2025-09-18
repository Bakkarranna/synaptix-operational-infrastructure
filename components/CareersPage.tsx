
import React, { useState } from 'react';
import { Icon, IconName } from './Icon';
import Modal from './Modal';
import InternshipApplicationForm from './InternshipApplicationForm';
import StyledText from './StyledText';
import { CAREER_CATEGORIES } from '../constants';


interface CareersPageProps {
  navigate: (path: string) => void;
}

const WHO_WE_ARE_LOOKING_FOR = [
    "Knows how to **build cool things with AI** (even without code)",
    "Can vibe-code (yes, that’s a thing) — you know how to figure it out",
    "Dabbles in design, content, or automation tools",
    "Has basic knowledge of AI tools like ChatGPT, Midjourney, Zapier, Notion AI, etc.",
    "Loves experimenting, prototyping, shipping fast, and breaking limits",
    "Wants to build their personal brand while contributing to a bigger mission",
    "Reads AI news, trends, and tech like it's your morning coffee",
    "Believes in teamwork, accountability, and ownership",
];

const CareersPage: React.FC<CareersPageProps> = ({ navigate }) => {
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
    return (
        <>
        <div className="relative z-10 animate-fade-in">
            <div className="container mx-auto px-6 py-24 sm:py-32">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
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
                            Careers at Synaptix Studio
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-white/80">
                            Join the AI revolution. Build the future with us.
                        </p>
                        <p className="mt-6 text-base text-gray-700 dark:text-white/70 max-w-3xl mx-auto">
                            At Synaptix Studio, we don’t just build tech — we build what’s next. We’re on a mission to empower small and medium businesses through smart, scalable, AI-powered systems. But behind every great tool is a great team — and that’s where you come in.
                        </p>
                         <p className="mt-4 text-base text-gray-700 dark:text-white/70 max-w-3xl mx-auto">
                           <StyledText text="We’re not looking for traditional techies. We’re hiring **creators, problem-solvers, AI tinkerers, digital thinkers**, and **future leaders**." />
                        </p>
                    </div>

                    {/* Who We're Looking For */}
                    <div className="my-16">
                        <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-6 text-center">Who We’re Looking For</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                            {WHO_WE_ARE_LOOKING_FOR.map(item => (
                                 <div key={item} className="flex items-center gap-3 bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 rounded-lg text-sm text-gray-800 dark:text-white/90">
                                    <span className="text-primary">→</span>
                                    <span><StyledText text={item} /></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="my-16 space-y-12">
                        {CAREER_CATEGORIES.map(category => (
                            <div key={category.categoryTitle}>
                                <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-8 text-center">{category.categoryTitle}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {category.roles.map(role => (
                                        <div key={role.title} className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-900/10 dark:border-white/10 rounded-xl p-6 flex flex-col">
                                            <div className="flex items-center gap-4 mb-4">
                                                <Icon name={role.icon} className="h-8 w-8 text-primary flex-shrink-0" />
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{role.title}</h3>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-white/80 flex-grow space-y-2">
                                                <h4 className="font-bold text-gray-800 dark:text-white/90 flex items-center gap-2">
                                                    <Icon name="target" className="h-5 w-5 text-primary"/>
                                                    Responsibilities:
                                                </h4>
                                                <ul className="list-disc list-inside pl-2 space-y-1">
                                                    {role.responsibilities.map(resp => <li key={resp}>{resp}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* How to Apply */}
                    <div className="my-16 bg-white/20 dark:bg-black/20 backdrop-blur-md border-2 border-dashed border-primary/50 rounded-xl p-6 sm:p-8 text-center">
                        <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white mb-4">Apply Now</h2>
                        <p className="text-gray-600 dark:text-white/80 mb-6 max-w-xl mx-auto font-semibold">Ready to build the future? Click the button below to fill out our short application form. We're excited to see what you've been working on!</p>
                        <div>
                             <button
                                onClick={() => setIsApplicationModalOpen(true)}
                                className="bg-primary text-white font-bold py-3 px-8 text-lg rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 animate-glow inline-block"
                            >
                                Send Application
                            </button>
                        </div>
                        <p className="text-gray-500 dark:text-white/70 text-sm mt-4 max-w-lg mx-auto">
                            Alternatively, you can email your resume and a brief introduction to <a href="mailto:info@synaptixstudio.com" className="text-primary hover:underline">info@synaptixstudio.com</a> or connect with us on <a href="https://www.linkedin.com/company/synaptix-studio" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>.
                        </p>
                    </div>

                    {/* Our Promise */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white">Our Promise</h2>
                        <p className="mt-4 text-lg text-primary font-semibold">
                           We’re building a next-gen AI company with future leaders, not just employees.
                        </p>
                        <p className="mt-2 text-gray-600 dark:text-white/80 max-w-2xl mx-auto">
                            Whether you're here for 3 months or 3 years — you’ll leave smarter, sharper, and more ready to lead than ever before.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <Modal isOpen={isApplicationModalOpen} onClose={() => setIsApplicationModalOpen(false)}>
            <InternshipApplicationForm onClose={() => setIsApplicationModalOpen(false)} />
        </Modal>
        </>
    );
};

export default CareersPage;