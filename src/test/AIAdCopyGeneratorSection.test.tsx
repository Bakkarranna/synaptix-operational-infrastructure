import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIAdCopyGeneratorSection from '../../components/AIAdCopyGeneratorSection'

// Mock external dependencies
vi.mock('../../constants', () => ({
  AD_PLATFORMS: ['Facebook / Instagram', 'Google Ads', 'LinkedIn Ads'],
  LOADING_MESSAGES: {
    AD_COPY: [
      "Analyzing your product and audience...",
      "Developing different marketing angles...",
      "Writing compelling, platform-specific headlines...",
      "Crafting persuasive body copy...",
      "Suggesting high-impact visuals and CTAs...",
      "Assembling your ad variations..."
    ]
  }
}))

// Mock Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          adVariations: [
            {
              angle: "Problem-Agitate-Solve (PAS)",
              headline: "Tired of Inefficient Marketing? This AI Tool Changes Everything.",
              body: "Stop wasting hours on campaigns that don't convert. Our AI-powered marketing tool generates high-converting copy in seconds, helping you focus on what matters most - growing your business.",
              imageSuggestion: "A split-screen image showing a frustrated marketer on one side and a successful, confident marketer using AI tools on the other side",
              ctaSuggestion: "Start Your Free Trial Now"
            },
            {
              angle: "Benefit-Driven",
              headline: "Generate High-Converting Marketing Copy in Seconds",
              body: "Transform your marketing with AI-powered copywriting. Generate dozens of variations, test different approaches, and scale your campaigns faster than ever before.",
              imageSuggestion: "A modern workspace with multiple screens showing different marketing campaigns and analytics dashboards",
              ctaSuggestion: "Try It Free Today"
            },
            {
              angle: "Social Proof",
              headline: "Join 10,000+ Marketers Using AI to 3x Their Conversion Rates",
              body: "Leading brands trust our AI copywriting tool to create campaigns that convert. Join the marketing revolution and see why industry leaders choose our platform.",
              imageSuggestion: "A collage of recognizable brand logos with upward trending graphs and testimonial quotes",
              ctaSuggestion: "Join the Community"
            }
          ]
        })
      })
    }
  })),
  Type: {
    OBJECT: 'object',
    ARRAY: 'array',
    STRING: 'string',
    INTEGER: 'integer'
  }
}))

// Mock analytics
vi.mock('../../services/analytics', () => ({
  trackEvent: vi.fn()
}))

// Mock useOnScreen hook
vi.mock('../hooks/useOnScreen', () => ({
  useOnScreen: vi.fn().mockReturnValue(true)
}))

// Mock StyledText component
vi.mock('../../components/StyledText', () => ({
  default: ({ text }: { text: string }) => 
    <span dangerouslySetInnerHTML={{ 
      __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
    }} />
}))

// Mock DynamicLoader component
vi.mock('../../components/DynamicLoader', () => ({
  default: ({ messages, className }: { messages: string[], className?: string }) => 
    <div data-testid="dynamic-loader" className={className}>
      {messages[0]}
    </div>
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(void 0)
  }
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GEMINI_API_KEY: 'test-api-key'
  },
  writable: true
})

describe('AIAdCopyGeneratorSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders section with title and description', () => {
    render(<AIAdCopyGeneratorSection />)
    
    expect(screen.getByText('AI Ad Copy')).toBeInTheDocument()
    expect(screen.getByText('Generator')).toBeInTheDocument()
    expect(screen.getByText(/Generate multiple high-converting ad variations/)).toBeInTheDocument()
  })

  it('renders form with all required input fields', () => {
    render(<AIAdCopyGeneratorSection />)
    
    // Platform selection buttons
    expect(screen.getByRole('button', { name: 'Facebook / Instagram' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Google Ads' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'LinkedIn Ads' })).toBeInTheDocument()
    
    // Form inputs
    expect(screen.getByLabelText(/Product Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Audience/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Key Benefits/)).toBeInTheDocument()
    
    // Submit button
    expect(screen.getByRole('button', { name: /Generate Ad Copy/ })).toBeInTheDocument()
  })

  it('handles platform selection correctly', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const googleAdsButton = screen.getByRole('button', { name: 'Google Ads' })
    const linkedInButton = screen.getByRole('button', { name: 'LinkedIn Ads' })
    
    // Initially Facebook/Instagram should be selected
    const facebookButton = screen.getByRole('button', { name: 'Facebook / Instagram' })
    expect(facebookButton).toHaveClass('bg-primary/20')
    
    // Select Google Ads
    await user.click(googleAdsButton)
    expect(googleAdsButton).toHaveClass('bg-primary/20')
    expect(facebookButton).not.toHaveClass('bg-primary/20')
    
    // Select LinkedIn Ads
    await user.click(linkedInButton)
    expect(linkedInButton).toHaveClass('bg-primary/20')
    expect(googleAdsButton).not.toHaveClass('bg-primary/20')
  })

  it('validates form inputs before submission', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    // Try to submit empty form
    await user.click(submitButton)
    
    expect(screen.getByText('Please fill out all fields.')).toBeInTheDocument()
  })

  it('handles form input changes correctly', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    
    await user.type(productInput, 'AI Marketing Tool')
    await user.type(audienceInput, 'Digital marketers')
    await user.type(benefitsInput, 'Saves time, increases conversions')
    
    expect(productInput).toHaveValue('AI Marketing Tool')
    expect(audienceInput).toHaveValue('Digital marketers')
    expect(benefitsInput).toHaveValue('Saves time, increases conversions')
  })

  it('submits form successfully with valid inputs', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    await user.type(productInput, 'AI Marketing Tool')
    await user.type(audienceInput, 'Digital marketers')
    await user.type(benefitsInput, 'Saves time, increases conversions')
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-loader')).toBeInTheDocument()
  })

  it('displays AI generation results correctly', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    await user.type(productInput, 'AI Marketing Tool')
    await user.type(audienceInput, 'Digital marketers')
    await user.type(benefitsInput, 'Saves time, increases conversions')
    await user.click(submitButton)
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show ad variations
    expect(screen.getByText('Problem-Agitate-Solve (PAS)')).toBeInTheDocument()
    expect(screen.getByText('Benefit-Driven')).toBeInTheDocument()
    expect(screen.getByText('Social Proof')).toBeInTheDocument()
    
    // Should show headlines
    expect(screen.getByText(/Tired of Inefficient Marketing/)).toBeInTheDocument()
    expect(screen.getByText(/Generate High-Converting Marketing Copy/)).toBeInTheDocument()
    expect(screen.getByText(/Join 10,000+ Marketers/)).toBeInTheDocument()
  })

  it('handles copy functionality for ad variations', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    await user.type(productInput, 'AI Marketing Tool')
    await user.type(audienceInput, 'Digital marketers')
    await user.type(benefitsInput, 'Saves time, increases conversions')
    await user.click(submitButton)
    
    // Wait for results
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Click copy button for first ad
    const copyButtons = screen.getAllByLabelText('Copy ad text')
    await user.click(copyButtons[0])
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('handles AI generation errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API to throw error
    const { GoogleGenAI } = await import('@google/genai')
    const mockAI = GoogleGenAI as any
    mockAI.mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
      }
    }))
    
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    await user.type(productInput, 'AI Marketing Tool')
    await user.type(audienceInput, 'Digital marketers')
    await user.type(benefitsInput, 'Saves time, increases conversions')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, we couldn't generate ad copy right now/)).toBeInTheDocument()
    })
  })

  it('displays image suggestions and CTA suggestions', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    await user.type(productInput, 'AI Marketing Tool')
    await user.type(audienceInput, 'Digital marketers')
    await user.type(benefitsInput, 'Saves time, increases conversions')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show image suggestions
    expect(screen.getByText('Image Suggestion')).toBeInTheDocument()
    expect(screen.getByText(/split-screen image showing a frustrated marketer/)).toBeInTheDocument()
    
    // Should show CTA suggestions
    expect(screen.getByText('A/B Test CTA Suggestion')).toBeInTheDocument()
    expect(screen.getByText('Start Your Free Trial Now')).toBeInTheDocument()
  })

  it('shows different marketing angles correctly', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    await user.type(productInput, 'AI Marketing Tool')
    await user.type(audienceInput, 'Digital marketers')
    await user.type(benefitsInput, 'Saves time, increases conversions')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show all three marketing angles
    expect(screen.getByText('Problem-Agitate-Solve (PAS)')).toBeInTheDocument()
    expect(screen.getByText('Benefit-Driven')).toBeInTheDocument()
    expect(screen.getByText('Social Proof')).toBeInTheDocument()
  })

  it('renders placeholder content when no results', () => {
    render(<AIAdCopyGeneratorSection />)
    
    expect(screen.getByText('Your Ad Creatives Appear Here')).toBeInTheDocument()
    expect(screen.getByText('Fill out the brief and let our AI become your copywriter.')).toBeInTheDocument()
  })

  it('handles form validation edge cases', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    // Only fill product name, leave others empty
    await user.type(productInput, 'AI Tool')
    await user.click(submitButton)
    
    expect(screen.getByText('Please fill out all fields.')).toBeInTheDocument()
  })

  it('tracks analytics events correctly', async () => {
    const { trackEvent } = await import('../../services/analytics')
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    await user.type(productInput, 'AI Marketing Tool')
    await user.type(audienceInput, 'Digital marketers')
    await user.type(benefitsInput, 'Saves time, increases conversions')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('generate_ad_copy', { platform: 'Facebook / Instagram' })
    })
  })

  it('maintains platform-specific context in prompts', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const linkedInButton = screen.getByRole('button', { name: 'LinkedIn Ads' })
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const submitButton = screen.getByRole('button', { name: /Generate Ad Copy/ })
    
    // Select LinkedIn platform
    await user.click(linkedInButton)
    
    await user.type(productInput, 'B2B Software')
    await user.type(audienceInput, 'Business executives')
    await user.type(benefitsInput, 'Increases productivity')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should track with LinkedIn platform
    const { trackEvent } = await import('../../services/analytics')
    expect(trackEvent).toHaveBeenCalledWith('generate_ad_copy', { platform: 'LinkedIn Ads' })
  })

  it('implements proper accessibility attributes', () => {
    render(<AIAdCopyGeneratorSection />)
    
    // Check for proper form labels
    expect(screen.getByLabelText(/Product Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Audience/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Key Benefits/)).toBeInTheDocument()
    
    // Check for proper button accessibility
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('handles responsive design elements', () => {
    render(<AIAdCopyGeneratorSection />)
    
    // Check for responsive grid classes
    const gridContainer = document.querySelector('.lg\\:grid-cols-2')
    expect(gridContainer).toBeInTheDocument()
    
    // Check for responsive padding
    const section = document.querySelector('.py-16.sm\\:py-20')
    expect(section).toBeInTheDocument()
  })

  it('preserves form state during platform switches', async () => {
    const user = userEvent.setup()
    render(<AIAdCopyGeneratorSection />)
    
    const productInput = screen.getByLabelText(/Product Name/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const benefitsInput = screen.getByLabelText(/Key Benefits/)
    const googleAdsButton = screen.getByRole('button', { name: 'Google Ads' })
    
    // Fill out form
    await user.type(productInput, 'Test Product')
    await user.type(audienceInput, 'Test Audience')
    await user.type(benefitsInput, 'Test Benefits')
    
    // Switch platform
    await user.click(googleAdsButton)
    
    // Form values should be preserved
    expect(productInput).toHaveValue('Test Product')
    expect(audienceInput).toHaveValue('Test Audience')
    expect(benefitsInput).toHaveValue('Test Benefits')
  })
})