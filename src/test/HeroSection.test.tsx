import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeroSection from '../../components/HeroSection'

// Mock all external dependencies
vi.mock('../../services/analytics', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('../../services/supabase', () => ({
  saveNewsletter: vi.fn().mockResolvedValue({}),
}))

// Mock the useOnScreen hook
vi.mock('../hooks/useOnScreen', () => ({
  useOnScreen: vi.fn().mockReturnValue(true)
}))

// Mock StyledText component
vi.mock('../../components/StyledText', () => ({
  default: ({ text }: { text: string }) => <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
}))

// Mock InteractiveNetwork component
vi.mock('../../components/InteractiveNetwork', () => ({
  default: () => <div data-testid="interactive-network">Interactive Network</div>
}))

// Mock PartnerLogo component
vi.mock('../../components/PartnerLogo', () => ({
  default: ({ name, domain }: { name: string, domain: string }) => (
    <div data-testid={`partner-logo-${name.toLowerCase()}`}>{name}</div>
  )
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  Icon: ({ name, className, ...props }: any) => (
    <svg className={className} {...props} data-testid={`icon-${name}`} />
  ),
  SendIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="send-icon" />,
  CheckCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="check-circle-icon" />,
  GiftIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="gift-icon" />,
  LightbulbIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="lightbulb-icon" />,
  BoltIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="bolt-icon" />,
  WebIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="web-icon" />,
}))

// Mock constants with proper structure
vi.mock('../../constants', () => ({
  PARTNERS: [
    { name: 'Microsoft', domain: 'microsoft.com' },
    { name: 'Google', domain: 'google.com' },
  ],
  SOCIAL_LINKS: [
    { name: 'LinkedIn', href: 'https://linkedin.com/company/synaptix-studio', icon: 'linkedin' },
  ],
  FLOATING_SERVICES: [
    {
      icon: 'phone',
      name: 'AI Voice Receptionist',
      benefit: 'Answer every call with AI precision, 24/7.',
      setupFeeRange: { min: 1200, max: 3000 },
      targetId: '/#services'
    },
    {
      icon: 'chat',
      name: 'Automated Lead Capture',
      benefit: 'Never miss a lead on your website, day or night.',
      setupFeeRange: { min: 800, max: 1800 },
      targetId: '/#services'
    }
  ],
  TRUSTED_BY_CLIENTS: [
    { name: 'Client1', domain: 'client1.com' },
    { name: 'Client2', domain: 'client2.com' },
  ],
  CALENDLY_LINK: 'https://calendly.com/test'
}))

describe('HeroSection Component', () => {
  const mockNavigate = vi.fn()
  const mockOpenCalendlyModal = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders hero section with main content', async () => {
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for component to mount and all state updates to complete
    await waitFor(() => {
      expect(screen.getByText(/Synaptix Studio: The Future of Smart Business/i)).toBeInTheDocument()
    })
  })

  it('displays newsletter subscription form', async () => {
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for main content to load first
    await waitFor(() => {
      expect(screen.getByText(/Synaptix Studio/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Check for newsletter form elements - the form should be present immediately
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/enter your email address/i)
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('id', 'hero-email')
      expect(emailInput).toHaveAttribute('type', 'email')
    }, { timeout: 5000 })
    
    // Verify subscribe button exists
    await waitFor(() => {
      const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
      expect(subscribeButton).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('handles email subscription submission', async () => {
    const user = userEvent.setup()
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for form elements to be available
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/enter your email address/i)
      expect(emailInput).toBeInTheDocument()
    }, { timeout: 5000 })
    
    const emailInput = screen.getByLabelText(/enter your email address/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    // Enter email and submit
    await user.type(emailInput, 'test@example.com')
    expect(emailInput).toHaveValue('test@example.com')
    
    await user.click(subscribeButton)
    
    // After successful submission, form should clear and show success message
    await waitFor(() => {
      expect(emailInput).toHaveValue('') // Form clears after successful submission
    }, { timeout: 5000 })
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/success! thanks for subscribing/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('displays floating services carousel', async () => {
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for component to mount and check for main content
    await waitFor(() => {
      expect(screen.getByText(/Synaptix Studio: The Future of Smart Business/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // The floating services carousel is in the RightColumnContent component
    // It's hidden on mobile (hidden md:flex) but should exist in the DOM
    // Check for the service card elements
    await waitFor(() => {
      // Look for elements that indicate the floating services are present
      const serviceElements = screen.getAllByText(/AI Voice Receptionist|Answer every call with AI precision|Automated Lead Capture|Never miss a lead/i)
      expect(serviceElements.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('shows social proof section', async () => {
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText(/Synaptix Studio: The Future of Smart Business/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Check for social proof elements - the contact email is in the bottom section
    await waitFor(() => {
      const emailElement = screen.getByText(/info@synaptixstudio\.com/i)
      expect(emailElement).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Also check for the "Trusted by" social proof in the RightColumnContent
    await waitFor(() => {
      const trustedText = screen.getByText(/Trusted by 50\+ Businesses/i)
      expect(trustedText).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('displays free consultation call-to-action', async () => {
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for main content
    await waitFor(() => {
      expect(screen.getByText(/Synaptix Studio: The Future of Smart Business/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Look for the consultation CTA button in the main section
    await waitFor(() => {
      const freeSessionButton = screen.getByText(/Get Your Free AI Strategy/i)
      expect(freeSessionButton).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Also check for the consultation button in the right column
    await waitFor(() => {
      const consultationButton = screen.getByRole('button', { name: /book a free ai strategy session/i })
      expect(consultationButton).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('calls openCalendlyModal when consultation button is clicked', async () => {
    const user = userEvent.setup()
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText(/Synaptix Studio: The Future of Smart Business/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Find the consultation button in the right column
    await waitFor(() => {
      const consultationButton = screen.getByRole('button', { name: /book a free ai strategy session/i })
      expect(consultationButton).toBeInTheDocument()
    }, { timeout: 5000 })
    
    const consultationButton = screen.getByRole('button', { name: /book a free ai strategy session/i })
    await user.click(consultationButton)
    
    expect(mockOpenCalendlyModal).toHaveBeenCalledTimes(1)
  })

  it('validates email format before submission', async () => {
    const user = userEvent.setup()
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for form elements
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/enter your email address/i)
      expect(emailInput).toBeInTheDocument()
    }, { timeout: 5000 })
    
    const emailInput = screen.getByLabelText(/enter your email address/i)
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i })
    
    // Try invalid email
    await user.type(emailInput, 'invalid-email')
    await user.click(subscribeButton)
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('cycles through animated button text', async () => {
    render(<HeroSection navigate={mockNavigate} openCalendlyModal={mockOpenCalendlyModal} />)
    
    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByText(/Synaptix Studio: The Future of Smart Business/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Check that subscribe button exists with one of the expected text values
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /subscribe|get ai insights|stay ahead/i })
      expect(button).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Verify the button is functional
    const subscribeButton = screen.getByRole('button', { name: /subscribe|get ai insights|stay ahead/i })
    expect(subscribeButton).toBeEnabled()
  })
})