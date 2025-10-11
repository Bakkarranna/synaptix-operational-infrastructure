import React, { useState, useEffect, useCallback } from 'react';
import { iconCacheService } from '../services/iconCache';

// FIX: Changed IconProps to use SVGProps to match SVG elements, resolving prop type conflicts.
interface IconProps extends React.SVGProps<SVGSVGElement> {}

// Core Service Icons
export const ChatIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
export const UsersIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21v-2a4 4 0 0 0-3-3.85" />
</svg>);
export const CodeIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);
export const CartIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
export const BuildingIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>);
export const ZapIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
export const LayoutIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>);
export const PhoneIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>);
export const PencilIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
export const ChartBarIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>);
export const TargetIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>);
export const SearchIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
export const RocketIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.479 12.212a2.543 2.543 0 01-.01-3.6L4.2 7.333a1 1 0 011.414-1.414l1.278 1.278a2.542 2.542 0 013.6-.01l5.09-5.09a1 1 0 011.414 1.414l-5.09 5.09a2.543 2.543 0 01-.01 3.6l1.278 1.278a1 1 0 01-1.414 1.414l-1.278-1.278a2.542 2.542 0 01-3.6.01l-5.09 5.09a1 1 0 01-1.414-1.414l5.09-5.09zM15 15l2.5-2.5" /></svg>);
export const GearIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
export const QuoteIcon: React.FC<IconProps> = (props) => (<svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-9.57v3.543c-2.822 0-4.335 1.766-4.335 4.817v8.601h-4.648zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-9.57v3.543c-2.834 0-4.356 1.766-4.356 4.817v8.601h-4.644z"/></svg>);
export const LightbulbIcon: React.FC<IconProps> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>);
export const CheckIcon: React.FC<IconProps> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>);
export const BoltIcon: React.FC<IconProps> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
export const CubeIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7v10l8 4m0-14v10" /></svg>);
export const UploadIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
export const XCircleIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
export const BookOpenIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>);
export const MicrophoneIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>);
export const VolumeUpIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>);
export const VolumeOffIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>);
export const LinkIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>);
export const GiftIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 11.25v8.25a2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0H9.375m13.125 3.75H1.5" /></svg>);
export const KeyIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>);


// Social & UI Icons
export const XIcon: React.FC<IconProps> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>);
export const LinkedInIcon: React.FC<IconProps> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.5 2.5-2.5c1.6 0 2.5 1.2 2.5 2.5s-1 2.5-2.5 2.5zm11.5 6c-1 0-2 1-2 2v7h-5v-13h5V10s1.6-1.5 4-1.5c3 0 5 2.2 5 6.3v6.7h-5v-7c0-1-1-2-2-2z"></path></svg>);
export const InstagramIcon: React.FC<IconProps> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>);
export const YouTubeIcon: React.FC<IconProps> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,12.89 21.94,13.78 21.84,14.93C21.78,15.73 21.69,16.36 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.73,18.78 17.93,18.84C17.13,18.91 16.44,18.94 15.84,18.94L15,19C14.11,19 13.22,18.94 12,18.94C10.78,18.94 9.89,18.94 9,19L8.16,18.94C7.56,18.94 6.87,18.91 6.07,18.84C5.27,18.78 4.64,18.69 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,11.11 2.06,10.22 2.16,9.07C2.22,8.27 2.31,7.64 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.27,5.22 6.07,5.16C6.87,5.09 7.56,5.06 8.16,5.06L9,5C9.89,5 10.78,5.06 12,5.06C13.22,5.06 14.11,5.06 15,5L15.84,5.06C16.44,5.06 17.13,5.09 17.93,5.16C18.73,5.22 19.36,5.31 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z"></path></svg>);
export const SendIcon: React.FC<IconProps> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>);
export const CheckCircleIcon: React.FC<IconProps> = (props) => (<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
export const CloseIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>);
export const ChatBubbleIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z" /></svg>);
export const ArrowRightIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>);
export const UserIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
export const EmailIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
export const WebIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m0 18a9 9 0 00-9-9m9-9V3" /></svg>);
export const CalculatorIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h6M6 3a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H6z" /></svg>);
export const SparklesIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L15 6m-4 13l-2.293-2.293a1 1 0 011.414-1.414L11 18m7-7l2.293-2.293a1 1 0 00-1.414-1.414L18 9m-7 7l-2.293 2.293a1 1 0 001.414 1.414L11 18" /></svg>);
export const MegaphoneIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584C18.35 1.832 17.65 1 16.5 1h-2.51c-1.12 0-2.076.74-2.43 1.832L11 5.882z" /></svg>);
export const InboxIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>);
export const FileSearchIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>);
export const DownloadIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
export const FileTextIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
export const ClipboardIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 012-2h4a2 2 0 012 2M8 5v2h8V5" /></svg>);
export const EditIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>);
export const TrophyIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18zm0 18c-3.314 0-6-4.03-6-9s2.686-9 6-9 6 4.03 6 9-2.686 9-6 9z" /></svg>);
export const ClipboardListIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>);
export const MediumIcon: React.FC<IconProps> = (props) => (<svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>);
export const SunIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 110-10 5 5 0 010 10z" /></svg>);
export const MoonIcon: React.FC<IconProps> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);

export type IconName =
  'chat' | 'users' | 'code' | 'cart' | 'building' | 'zap' | 'layout' | 'phone' |
  'pencil' | 'chart-bar' | 'target' | 'search' | 'rocket' | 'gear' | 'lightbulb' | 'check' | 'bolt' | 'cube' | 'upload' | 'x-circle' | 'book-open' | 'microphone' |
  'x' | 'linkedin' | 'instagram' | 'youtube' | 'send' | 'check-circle' | 'close' | 'chat-bubble' | 'arrow-right' | 'user' | 'email' | 'web' | 'calculator' |
  'sparkles' | 'megaphone' | 'inbox' | 'file-search' | 'file-text' | 'clipboard' | 'edit' | 'trophy' | 'clipboard-list' | 'download' | 'volume-up' | 'volume-off' | 'link' |
  'sun' | 'moon' | 'gift' | 'key' | 'medium';

const icons: { [key in IconName]: React.FC<IconProps> } = {
  'chat': ChatIcon,
  'users': UsersIcon,
  'code': CodeIcon,
  'cart': CartIcon,
  'building': BuildingIcon,
  'zap': ZapIcon,
  'layout': LayoutIcon,
  'phone': PhoneIcon,
  'pencil': PencilIcon,
  'chart-bar': ChartBarIcon,
  'target': TargetIcon,
  'search': SearchIcon,
  'rocket': RocketIcon,
  'gear': GearIcon,
  'lightbulb': LightbulbIcon,
  'check': CheckIcon,
  'bolt': BoltIcon,
  'cube': CubeIcon,
  'upload': UploadIcon,
  'x-circle': XCircleIcon,
  'book-open': BookOpenIcon,
  'microphone': MicrophoneIcon,
  'x': XIcon,
  'linkedin': LinkedInIcon,
  'instagram': InstagramIcon,
  'youtube': YouTubeIcon,
  'send': SendIcon,
  'check-circle': CheckCircleIcon,
  'close': CloseIcon,
  'chat-bubble': ChatBubbleIcon,
  'arrow-right': ArrowRightIcon,
  'user': UserIcon,
  'email': EmailIcon,
  'web': WebIcon,
  'calculator': CalculatorIcon,
  'sparkles': SparklesIcon,
  'megaphone': MegaphoneIcon,
  'inbox': InboxIcon,
  'file-search': FileSearchIcon,
  'download': DownloadIcon,
  'file-text': FileTextIcon,
  'clipboard': ClipboardIcon,
  'edit': EditIcon,
  'trophy': TrophyIcon,
  'clipboard-list': ClipboardListIcon,
  'volume-up': VolumeUpIcon,
  'volume-off': VolumeOffIcon,
  'link': LinkIcon,
  'sun': SunIcon,
  'moon': MoonIcon,
  'gift': GiftIcon,
  'key': KeyIcon,
  'medium': MediumIcon,
};

const socialIconDomains: Partial<Record<IconName, string>> = {
    'x': 'x.com',
    'linkedin': 'linkedin.com',
    'instagram': 'instagram.com',
    'youtube': 'youtube.com',
    'medium': 'medium.com'
};

export const Icon: React.FC<{ name: IconName } & IconProps> = ({ name, ...props }) => {
  const domain = socialIconDomains[name];
    
  if (domain) {
      const [hasError, setHasError] = useState(false);
      const [iconUrl, setIconUrl] = useState<string>('');
      // Removed isLoading state for preloader elimination
      
      // Load icon URL with caching
      const loadIconUrl = useCallback(async () => {
        setHasError(false);
        
        try {
          // Special case for 'x' which uses /logo instead of /symbol on Brandfetch for the correct icon
          const endpoint = name === 'x' ? 'logo' : 'symbol';
          const url = await iconCacheService.getIconUrl(domain, endpoint);
          setIconUrl(url);
        } catch (error) {
          setHasError(true);
          setIconUrl('');
        }
      }, [domain, name]);
      
      useEffect(() => {
        loadIconUrl();
      }, [loadIconUrl]);
      
      if (hasError || !iconUrl) {
          const IconComponent = icons[name];
          return <IconComponent {...props} />;
      }
      
      const { className, ...restProps } = props;

      return (
          <img
              src={iconUrl}
              alt={`${name} logo`}
              loading="lazy"
              decoding="async"
              onError={() => setHasError(true)}
              className={`h-full w-auto object-contain filter grayscale group-hover:grayscale-0 dark:invert dark:group-hover:invert-0 transition-all duration-300 ${className || ''}`}
              {...restProps as unknown as React.ImgHTMLAttributes<HTMLImageElement>}
          />
      );
  }

  const IconComponent = icons[name];
  return <IconComponent {...props} />;
};