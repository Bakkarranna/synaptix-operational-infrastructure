# User Interaction Components

<cite>
**Referenced Files in This Document**   
- [CalendlyModal.tsx](file://components/CalendlyModal.tsx)
- [CookieConsentBanner.tsx](file://components/CookieConsentBanner.tsx)
- [ChatWidget.tsx](file://components/ChatWidget.tsx)
- [constants.tsx](file://constants.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [CalendlyModal for Consultation Scheduling](#calendlymodal-for-consultation-scheduling)
3. [CookieConsentBanner for GDPR Compliance](#cookieconsentbanner-for-gdpr-compliance)
4. [ChatWidget for Real-Time Support](#chatwidget-for-real-time-support)
5. [Integration and Data Handling](#integration-and-data-handling)
6. [Visual Design and Behavior Patterns](#visual-design-and-behavior-patterns)
7. [Accessibility and Performance Considerations](#accessibility-and-performance-considerations)
8. [Configuration and Customization](#configuration-and-customization)

## Introduction
This document provides comprehensive analysis of user interaction components designed to enhance engagement and drive business objectives. The components discussed—CalendlyModal, CookieConsentBanner, and ChatWidget—serve critical functions in lead generation, compliance, and customer support. These interactive elements are strategically implemented to improve user experience while maintaining technical excellence in accessibility, performance, and data responsibility.

## CalendlyModal for Consultation Scheduling

The CalendlyModal component facilitates seamless consultation scheduling by integrating with the Calendly third-party service. This modal-based interface allows users to book demo calls or strategy sessions directly from the website, serving as a key conversion tool for lead generation.

The component implements responsive design principles, dynamically adjusting its dimensions based on viewport size and device characteristics. It calculates optimal modal size for different screen configurations, ensuring appropriate display on mobile (portrait and landscape), tablet, and desktop devices. The implementation includes a sophisticated loading sequence with a custom preloader that displays until the Calendly widget is fully initialized.

Interaction behavior includes a backdrop overlay that closes the modal when clicked, with a prominent close button positioned in the top-right corner. The modal employs smooth animations for opening and closing transitions, enhancing the user experience with opacity and transform effects. The component also handles theme adaptation, adjusting Calendly's embedded widget parameters to match the website's light or dark mode.

**Section sources**
- [CalendlyModal.tsx](file://components/CalendlyModal.tsx#L9-L186)

## CookieConsentBanner for GDPR Compliance

The CookieConsentBanner component ensures compliance with data privacy regulations including GDPR and CCPA by implementing a user consent mechanism for cookie usage. This banner appears after a 3-second delay following page load, preventing immediate intrusion while ensuring visibility.

The component stores user consent in localStorage, allowing the preference to persist across sessions. When users accept cookies, the banner sets a 'cookie_consent' flag and disappears from view. The implementation includes proper cleanup of timers to prevent memory leaks.

The banner's content emphasizes transparency about data usage, explaining that cookies enhance browsing experience and enable traffic analysis. It provides a clear call-to-action with an "Accept" button and includes a link to the Privacy Policy page for users seeking more information. The component uses navigation functions to programmatically route users to the privacy page when they click the policy link.

**Section sources**
- [CookieConsentBanner.tsx](file://components/CookieConsentBanner.tsx#L9-L56)
- [constants.tsx](file://constants.tsx#L848-L896)

## ChatWidget for Real-Time Support

The ChatWidget component provides an AI-powered assistance system that serves as a primary customer support channel. Implemented as a floating button in the bottom-right corner of the screen, the widget expands into a full chat interface when activated, offering real-time interaction with an AI assistant.

The chat interface includes several advanced features:
- Voice input capabilities using Web Speech API for speech recognition
- Text-to-speech functionality for auditory responses
- Contextual follow-up suggestions to guide user interactions
- Integration with external services through navigation actions
- Support for voice message recording and playback

The AI assistant is powered by Google's Gemini API and is configured with a comprehensive system instruction that defines its knowledge base and response formatting rules. The chatbot can direct users to relevant pages, blog articles, or external social media profiles based on their queries. It handles navigation through the openCalendlyModal function for booking consultations and uses the navigate prop for internal routing.

The component maintains conversation state with message history, loading indicators, and smooth scrolling behavior. It includes accessibility features such as ARIA attributes and keyboard navigation support. The interface adapts to the website's theme, displaying appropriate branding elements and color schemes.

**Section sources**
- [ChatWidget.tsx](file://components/ChatWidget.tsx#L55-L447)

## Integration and Data Handling

These interactive components integrate with various third-party services while maintaining responsible data handling practices. The CalendlyModal connects to Calendly's scheduling platform, passing theme parameters to ensure visual consistency. The integration listens for Calendly's event_type_viewed message to determine when the widget has fully loaded, providing a seamless user experience.

The ChatWidget establishes connections with multiple external services:
- Google's Gemini API for AI processing
- Supabase for chat log persistence
- Analytics services for tracking user interactions

Data privacy is prioritized throughout the implementation. The CookieConsentBanner respects user preferences by checking localStorage before displaying, ensuring compliance with privacy regulations. The ChatWidget implements proper cleanup of speech synthesis instances when the widget is closed or muted.

All components follow secure coding practices, including proper cleanup of event listeners and timers to prevent memory leaks. The implementations avoid exposing sensitive information in client-side code, with API keys and credentials properly managed through environment variables.

**Section sources**
- [ChatWidget.tsx](file://components/ChatWidget.tsx#L1-L30)
- [constants.tsx](file://constants.tsx#L848-L896)

## Visual Design and Behavior Patterns

The interactive components employ consistent visual design patterns that align with the overall website aesthetic. All components utilize glass-morphism effects with backdrop-blur and semi-transparent backgrounds, creating a modern, layered interface. They incorporate the primary brand color (orange/ff5630) for interactive elements, ensuring visual consistency.

Animation patterns include:
- Smooth fade-in and slide-up transitions for component appearance
- Hover effects with scale transformations and shadow changes
- Loading animations with bouncing dot indicators
- Glowing effects for important interactive elements

The components respond to user interactions with immediate visual feedback, including button press effects and cursor changes. The CalendlyModal implements a sophisticated animation sequence that combines opacity changes, vertical translation, and scaling for its entrance and exit transitions.

Responsive behavior is a key feature across all components. The CalendlyModal adjusts its dimensions based on viewport size, while the CookieConsentBanner uses a fixed positioning strategy that centers itself on the screen. The ChatWidget maintains a consistent position in the bottom-right corner regardless of screen size.

**Section sources**
- [CalendlyModal.tsx](file://components/CalendlyModal.tsx#L0-L37)
- [CookieConsentBanner.tsx](file://components/CookieConsentBanner.tsx#L40-L58)
- [ChatWidget.tsx](file://components/ChatWidget.tsx#L351-L376)

## Accessibility and Performance Considerations

The components implement comprehensive accessibility features to ensure usability for all users. The CalendlyModal includes proper ARIA attributes (role="dialog", aria-modal="true") and manages focus with tabIndex controls. The close button has an appropriate aria-label for screen readers.

Keyboard navigation is supported across components, with logical tab ordering and keyboard event handling. The ChatWidget includes visual indicators for recording state and provides text alternatives for voice interactions. The CookieConsentBanner ensures sufficient color contrast and text size for readability.

Performance optimization strategies include:
- Lazy loading of external widgets (Calendly)
- Efficient state management to minimize re-renders
- Proper cleanup of event listeners and timers
- Optimized animation performance using CSS transitions
- Conditional rendering to avoid unnecessary DOM elements

The components are designed to minimize impact on page load performance. The Calendly widget only initializes when the modal is opened, and the ChatWidget only loads its AI functionality when activated. The CookieConsentBanner uses a delayed appearance to avoid blocking initial page rendering.

**Section sources**
- [CalendlyModal.tsx](file://components/CalendlyModal.tsx#L174-L188)
- [ChatWidget.tsx](file://components/ChatWidget.tsx#L210-L239)
- [CookieConsentBanner.tsx](file://components/CookieConsentBanner.tsx#L2-L38)

## Configuration and Customization

These components offer various configuration options to adapt to different use cases. The CalendlyModal accepts theme and open state as props, allowing integration with different page layouts and design systems. The component's responsive sizing logic can be extended to accommodate additional breakpoints or device types.

The ChatWidget provides extensive customization through its system instruction configuration, which defines the AI's knowledge base and response formatting rules. The component can be configured with different blog post data, navigation functions, and theme settings. The follow-up suggestions can be customized based on business priorities or user segments.

The CookieConsentBanner can be localized by modifying the consent text and button labels. Its appearance timing (3-second delay) can be adjusted based on user experience requirements. The component's styling can be modified to match different design systems while maintaining its functional requirements.

All components follow a modular design that allows for easy customization and extension. They can be integrated into different pages or layouts with minimal configuration, making them versatile tools for enhancing user engagement across the website.

**Section sources**
- [CalendlyModal.tsx](file://components/CalendlyModal.tsx#L75-L113)
- [ChatWidget.tsx](file://components/ChatWidget.tsx#L241-L273)
- [CookieConsentBanner.tsx](file://components/CookieConsentBanner.tsx#L0-L38)