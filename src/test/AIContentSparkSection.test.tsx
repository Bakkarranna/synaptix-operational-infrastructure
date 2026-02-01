import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIContentSparkSection from '../../components/AIContentSparkSection'

// Mock external dependencies
vi.mock('../../constants', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../constants')>()
  return {
    ...actual,
    LOADING_MESSAGES: {
      CONTENT_SPARK: [
        "Analyzing your topic and audience...",
        "Brainstorming viral hooks and angles...",
        "Crafting the core message with your chosen tone...",
        "Developing compelling calls-to-action...",
        "Assessing virality potential...",
        "Generating platform-specific adaptations..."
      ]
    }
  }
})

// Mock Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          hook: "🚀 This AI hack increased our productivity by 300% in just 2 weeks",
          hookVariations: [
            "⚡ The simple AI tool that's revolutionizing how teams work",
            "🎯 Why 95% of businesses are missing this AI opportunity"
          ],
          body: "Here's what happened when we implemented AI automation:\n\n✅ Tasks that took 8 hours now take 30 minutes\n✅ Zero errors in data processing\n✅ Team focusing on strategic work instead of repetitive tasks\n\nThe best part? It costs less than your monthly coffee budget.",
          cta: "Ready to automate your business? Book a free discovery call to see how AI can transform your operations in 30 days or less.",
          viralityScore: 85,
          justification: "High virality potential due to specific metrics, clear benefits, and curiosity gap. Could improve with more emotional language.",
          hashtags: ["aiautomation", "productivity", "businessgrowth", "automation", "ai"],
          adaptations: [
            {
              platform: "Twitter",
              text: "🚀 AI hack = 300% productivity boost in 2 weeks.\n\n8hr tasks → 30min\nZero errors\nMore strategic work\n\nCosts less than coffee ☕\n\nWant details? 👇"
            },
            {
              platform: "Instagram Story Idea",
              text: "Before/After productivity comparison with dramatic visual showing time savings from AI automation"
            }
          ],
          imageIdea: "Split screen image showing overwhelmed person with pile of paperwork on left, relaxed person with laptop and AI interface on right, with '300% productivity' text overlay"
        })
      })
    }
  }))
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  SparklesIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="sparkles-icon" />,
  ClipboardIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="clipboard-icon" />,
  CheckIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="check-icon" />
}))

// Mock StyledText component
vi.mock('../../components/StyledText', () => ({
  default: ({ text }: { text: string }) => {
    const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />
  }
}))

// Mock ViralityMeter component
vi.mock('../../components/ViralityMeter', () => ({
  default: ({ score, className }: { score: number, className?: string }) => (
    <div className={className} data-testid="virality-meter">
      <div data-testid="virality-score">{score}</div>
    </div>
  )
}))

// Mock DynamicLoader component
vi.mock('../../components/DynamicLoader', () => ({
  default: ({ messages, className }: { messages: string[], className?: string }) => (
    <div className={className} data-testid="dynamic-loader">
      {messages[0] || 'Loading...'}
    </div>
  )
}))

// Mock useOnScreen hook
vi.mock('../../hooks/useOnScreen', () => ({
  useOnScreen: () => true
}))

// Mock services
vi.mock('../../services/analytics', () => ({
  trackEvent: vi.fn()
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GEMINI_API_KEY: 'test-api-key'
  },
  writable: true
})

// Define constants that would be imported
const CONTENT_TYPES = [
  { name: 'LinkedIn Post', description: 'Professional networking content' },
  { name: 'Twitter Thread', description: 'Multi-tweet storytelling' },
  { name: 'Instagram Caption', description: 'Visual-first content' },
  { name: 'Facebook Post', description: 'Community engagement' },
  { name: 'Blog Introduction', description: 'Article opening hook' }
]

const CONTENT_LENGTHS = ['Short (1-2 sentences)', 'Medium (1 paragraph)', 'Long (2-3 paragraphs)']

const TONES_OF_VOICE = ['Professional', 'Conversational', 'Inspiring', 'Humorous', 'Educational', 'Bold']

describe('AIContentSparkSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders section with title and description', () => {
    render(<AIContentSparkSection />)

    expect(screen.getByText('Viral Content')).toBeInTheDocument()
    expect(screen.getByText('Strategist')).toBeInTheDocument()
    expect(screen.getByText(/Go beyond simple generation/)).toBeInTheDocument()
  })

  it('renders content brief form with all inputs', () => {
    render(<AIContentSparkSection />)

    // Topic input
    expect(screen.getByLabelText(/Topic \/ Keyword/)).toBeInTheDocument()

    // Content type dropdown
    expect(screen.getByLabelText(/Content Type/)).toBeInTheDocument()

    // Content length dropdown
    expect(screen.getByLabelText(/Desired Length/)).toBeInTheDocument()

    // Tone dropdown
    expect(screen.getByLabelText(/Tone of Voice/)).toBeInTheDocument()

    // Target audience input
    expect(screen.getByLabelText(/Target Audience/)).toBeInTheDocument()

    // Call to action input
    expect(screen.getByLabelText(/Call to Action/)).toBeInTheDocument()

    // Generate button
    expect(screen.getByRole('button', { name: /Generate Viral Content/ })).toBeInTheDocument()
  })

  it('handles topic input correctly', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)

    await user.type(topicInput, 'AI productivity tools')

    expect(topicInput).toHaveValue('AI productivity tools')
  })

  it('handles dropdown selections correctly', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const contentTypeSelect = screen.getByLabelText(/Content Type/)
    const lengthSelect = screen.getByLabelText(/Desired Length/)
    const toneSelect = screen.getByLabelText(/Tone of Voice/)

    await user.selectOptions(contentTypeSelect, 'Twitter Thread')
    await user.selectOptions(lengthSelect, 'Long (2-3 paragraphs)')
    await user.selectOptions(toneSelect, 'Inspiring')

    expect(contentTypeSelect).toHaveValue('Twitter Thread')
    expect(lengthSelect).toHaveValue('Long (2-3 paragraphs)')
    expect(toneSelect).toHaveValue('Inspiring')
  })

  it('handles optional inputs correctly', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const audienceInput = screen.getByLabelText(/Target Audience/)
    const ctaInput = screen.getByLabelText(/Call to Action/)

    await user.type(audienceInput, 'Small business owners')
    await user.type(ctaInput, 'Book a free consultation')

    expect(audienceInput).toHaveValue('Small business owners')
    expect(ctaInput).toHaveValue('Book a free consultation')
  })

  it('validates required topic field', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.click(generateButton)

    expect(screen.getByText(/Please enter a topic to generate content/)).toBeInTheDocument()
  })

  it('submits form successfully with valid input', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    // Should show loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-loader')).toBeInTheDocument()
  })

  it('displays generated content results correctly', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    // Wait for results
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Should show generated content sections
    expect(screen.getByText(/This AI hack increased our productivity by 300%/)).toBeInTheDocument()
    expect(screen.getByText(/Here's what happened when we implemented AI automation/)).toBeInTheDocument()
    expect(screen.getByText(/Ready to automate your business/)).toBeInTheDocument()
  })

  it('displays virality score and analysis', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Should show virality meter
    expect(screen.getByTestId('virality-meter')).toBeInTheDocument()
    expect(screen.getByTestId('virality-score')).toHaveTextContent('85')

    // Should show justification
    expect(screen.getByText(/High virality potential due to specific metrics/)).toBeInTheDocument()
  })

  it('displays hook variations for A/B testing', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Should show hook variations
    expect(screen.getByText(/The simple AI tool that's revolutionizing/)).toBeInTheDocument()
    expect(screen.getByText(/Why 95% of businesses are missing/)).toBeInTheDocument()
  })

  it('displays hashtags correctly', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Should show hashtags
    expect(screen.getByText(/#aiautomation/)).toBeInTheDocument()
    expect(screen.getByText(/#productivity/)).toBeInTheDocument()
    expect(screen.getByText(/#businessgrowth/)).toBeInTheDocument()
  })

  it('displays platform adaptations', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Should show platform adaptations
    expect(screen.getByText('Twitter')).toBeInTheDocument()
    expect(screen.getByText('Instagram Story Idea')).toBeInTheDocument()
    expect(screen.getByText(/AI hack = 300% productivity boost/)).toBeInTheDocument()
    expect(screen.getByText(/Before\/After productivity comparison/)).toBeInTheDocument()
  })

  it('displays image idea suggestion', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Should show image idea
    expect(screen.getByText(/Split screen image showing overwhelmed person/)).toBeInTheDocument()
  })

  it('allows editing of generated content', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Find editable text areas
    const editableHook = screen.getByDisplayValue(/This AI hack increased our productivity/)
    const editableBody = screen.getByDisplayValue(/Here's what happened when we implemented/)
    const editableCta = screen.getByDisplayValue(/Ready to automate your business/)

    // Edit content
    await user.clear(editableHook)
    await user.type(editableHook, 'Custom hook text')

    expect(editableHook).toHaveValue('Custom hook text')
  })

  it('handles copy to clipboard functionality', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Click copy button
    const copyButton = screen.getByRole('button', { name: /Copy All Content/ })
    await user.click(copyButton)

    // Should call clipboard API
    expect(navigator.clipboard.writeText).toHaveBeenCalled()

    // Should show copied state
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()

    // Mock API to throw error
    const { GoogleGenAI } = await import('@google/genai')
    const mockAI = GoogleGenAI as any
    mockAI.mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
      }
    }))

    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/Sorry, we had trouble generating content/)).toBeInTheDocument()
    })
  })

  it('tracks analytics events correctly', async () => {
    const user = userEvent.setup()
    const { trackEvent } = await import('../../services/analytics')

    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('generate_content_spark', {
        content_type: 'LinkedIn Post',
        tone: 'Professional'
      })
    })
  })

  it('scrolls to results after generation', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    // Should call scrollIntoView on results element
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('clears previous results when generating new content', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    // First generation
    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText(/This AI hack increased our productivity/)).toBeInTheDocument()
    })

    // Clear and generate new content
    await user.clear(topicInput)
    await user.type(topicInput, 'Machine learning advantages')
    await user.click(generateButton)

    // Should show loading again (previous results cleared)
    expect(screen.getByTestId('dynamic-loader')).toBeInTheDocument()
  })

  it('applies correct responsive styling', () => {
    render(<AIContentSparkSection />)

    // Check for responsive grid
    const gridContainer = document.querySelector('.grid.lg\\:grid-cols-2')
    expect(gridContainer).toBeInTheDocument()

    // Check for responsive padding
    const section = document.querySelector('.py-16.sm\\:py-20')
    expect(section).toBeInTheDocument()
  })

  it('implements proper accessibility', () => {
    render(<AIContentSparkSection />)

    // Check for proper form labels
    expect(screen.getByLabelText(/Topic \/ Keyword/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Content Type/)).toBeInTheDocument()

    // Check for required field indication
    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    expect(topicInput).toHaveAttribute('required')

    // Check for proper button accessibility
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })
    expect(generateButton).toBeInTheDocument()
  })

  it('prevents form submission during loading', async () => {
    const user = userEvent.setup()
    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    // Button should be disabled during loading
    expect(generateButton).toBeDisabled()
    expect(generateButton).toHaveClass('cursor-not-allowed')
  })

  it('handles copy state timeout correctly', async () => {
    const user = userEvent.setup()
    vi.useFakeTimers()

    render(<AIContentSparkSection />)

    const topicInput = screen.getByLabelText(/Topic \/ Keyword/)
    const generateButton = screen.getByRole('button', { name: /Generate Viral Content/ })

    await user.type(topicInput, 'AI automation benefits')
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })

    const copyButton = screen.getByRole('button', { name: /Copy All Content/ })
    await user.click(copyButton)

    expect(screen.getByText('Copied!')).toBeInTheDocument()

    // Fast-forward 2 seconds
    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })

    vi.useRealTimers()
  })
})
