import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIEmailSubjectLineTesterSection from '../../components/AIEmailSubjectLineTesterSection'

// Mock external dependencies
vi.mock('../../constants', () => ({
  LOADING_MESSAGES: {
    SUBJECT_LINE: [
      "Assessing your subject line for clarity...",
      "Analyzing its potential to spark curiosity...",
      "Checking for common spam trigger words...",
      "Scoring its open rate potential...",
      "Generating high-impact alternatives..."
    ]
  }
}))

// Mock Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          score: 78,
          analysis: {
            clarity: "The subject line clearly communicates what the email contains, though it could be more specific.",
            urgency: "Lacks urgency and time-sensitive language that would encourage immediate opening.",
            curiosity: "Generates moderate curiosity but could benefit from more intriguing or surprising elements.",
            spamRisk: "Low spam risk - uses professional language without trigger words or excessive punctuation."
          },
          suggestions: [
            "🔥 Last 24 Hours: Your Weekly Marketing Report Inside",
            "Marketing Report Ready - See This Week's Top Insights",
            "Your Marketing Performance This Week (3 Key Wins Inside)"
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

// Mock ViralityMeter component
vi.mock('../../components/ViralityMeter', () => ({
  default: ({ score }: { score: number }) => 
    <div data-testid="virality-meter" data-score={score}>
      {score}/100
    </div>
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

describe('AIEmailSubjectLineTesterSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders section with title and description', () => {
    render(<AIEmailSubjectLineTesterSection />)
    
    expect(screen.getByText('Email Subject Line')).toBeInTheDocument()
    expect(screen.getByText('Analyzer')).toBeInTheDocument()
    expect(screen.getByText(/Boost your open rates/)).toBeInTheDocument()
  })

  it('renders form with all required input fields', () => {
    render(<AIEmailSubjectLineTesterSection />)
    
    // Form inputs
    expect(screen.getByLabelText(/Enter Subject Line/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Audience/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Topic/)).toBeInTheDocument()
    
    // Submit button
    expect(screen.getByRole('button', { name: /Analyze Subject Line/ })).toBeInTheDocument()
  })

  it('validates required subject line input', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    // Try to submit without subject line
    await user.click(submitButton)
    
    expect(screen.getByText('Please enter a subject line to analyze.')).toBeInTheDocument()
  })

  it('handles form input changes correctly', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const topicInput = screen.getByLabelText(/Email Topic/)
    
    await user.type(subjectInput, 'Weekly Newsletter')
    await user.type(audienceInput, 'Marketing professionals')
    await user.type(topicInput, 'Industry updates')
    
    expect(subjectInput).toHaveValue('Weekly Newsletter')
    expect(audienceInput).toHaveValue('Marketing professionals')
    expect(topicInput).toHaveValue('Industry updates')
  })

  it('submits form successfully with valid subject line', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'Weekly Newsletter')
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-loader')).toBeInTheDocument()
  })

  it('displays analysis results correctly', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'Weekly Newsletter')
    await user.click(submitButton)
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show score
    expect(screen.getByText('Open Rate Potential')).toBeInTheDocument()
    expect(screen.getByTestId('virality-meter')).toHaveAttribute('data-score', '78')
    
    // Should show analysis sections
    expect(screen.getByText('Clarity:')).toBeInTheDocument()
    expect(screen.getByText('Urgency:')).toBeInTheDocument()
    expect(screen.getByText('Curiosity:')).toBeInTheDocument()
    expect(screen.getByText('Spam Risk:')).toBeInTheDocument()
    
    // Should show analysis content
    expect(screen.getByText(/clearly communicates what the email contains/)).toBeInTheDocument()
    expect(screen.getByText(/Lacks urgency and time-sensitive language/)).toBeInTheDocument()
  })

  it('displays improvement suggestions correctly', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'Weekly Newsletter')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show suggestions section
    expect(screen.getByText('Improved Suggestions')).toBeInTheDocument()
    
    // Should show all three suggestions
    expect(screen.getByText(/Last 24 Hours: Your Weekly Marketing Report Inside/)).toBeInTheDocument()
    expect(screen.getByText(/Marketing Report Ready - See This Week's Top Insights/)).toBeInTheDocument()
    expect(screen.getByText(/Your Marketing Performance This Week/)).toBeInTheDocument()
  })

  it('handles copy functionality for suggestions', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'Weekly Newsletter')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Find and click copy button
    const copyButtons = screen.getAllByText('Copy')
    await user.click(copyButtons[0])
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('🔥 Last 24 Hours: Your Weekly Marketing Report Inside')
  })

  it('handles AI analysis errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API to throw error
    const { GoogleGenAI } = await import('@google/genai')
    const mockAI = GoogleGenAI as any
    mockAI.mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
      }
    }))
    
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'Test Subject')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, we couldn't analyze the subject line/)).toBeInTheDocument()
    })
  })

  it('includes optional context in analysis', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const topicInput = screen.getByLabelText(/Email Topic/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'New Product Launch')
    await user.type(audienceInput, 'Tech enthusiasts')
    await user.type(topicInput, 'Product announcement')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show analysis with context
    expect(screen.getByTestId('virality-meter')).toBeInTheDocument()
  })

  it('shows placeholder content when no results', () => {
    render(<AIEmailSubjectLineTesterSection />)
    
    expect(screen.getByText('Your Analysis Appears Here')).toBeInTheDocument()
    expect(screen.getByText('Enter a subject line to see how it scores.')).toBeInTheDocument()
  })

  it('handles empty subject line validation', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    // Enter spaces only
    await user.type(subjectInput, '   ')
    await user.click(submitButton)
    
    expect(screen.getByText('Please enter a subject line to analyze.')).toBeInTheDocument()
  })

  it('tracks analytics events correctly', async () => {
    const { trackEvent } = await import('../../services/analytics')
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'Weekly Newsletter')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('test_subject_line')
    })
  })

  it('handles large subject lines appropriately', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    // Enter very long subject line
    const longSubject = 'This is a very long email subject line that exceeds typical email client limits and might be truncated in most email applications which could affect the analysis'
    await user.type(subjectInput, longSubject)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    expect(screen.getByTestId('virality-meter')).toBeInTheDocument()
  })

  it('handles special characters in subject lines', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, '🔥 FREE!!! Limited Time Offer - 50% OFF Everything!!!')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    expect(screen.getByTestId('virality-meter')).toBeInTheDocument()
  })

  it('displays different score ranges appropriately', async () => {
    const user = userEvent.setup()
    
    // Mock different scores
    const { GoogleGenAI } = await import('@google/genai')
    const mockAI = GoogleGenAI as any
    mockAI.mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            score: 25,
            analysis: {
              clarity: "Poor clarity - subject line is vague and unclear.",
              urgency: "No urgency detected.",
              curiosity: "Fails to generate curiosity.",
              spamRisk: "High spam risk due to excessive punctuation and trigger words."
            },
            suggestions: [
              "Better Subject Line 1",
              "Better Subject Line 2", 
              "Better Subject Line 3"
            ]
          })
        })
      }
    }))
    
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'Bad subject')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    expect(screen.getByTestId('virality-meter')).toHaveAttribute('data-score', '25')
  })

  it('implements proper accessibility attributes', () => {
    render(<AIEmailSubjectLineTesterSection />)
    
    // Check for proper form labels
    expect(screen.getByLabelText(/Enter Subject Line/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Audience/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Topic/)).toBeInTheDocument()
    
    // Check required attribute
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    expect(subjectInput).toHaveAttribute('required')
    
    // Check for proper button accessibility
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('handles responsive design elements', () => {
    render(<AIEmailSubjectLineTesterSection />)
    
    // Check for responsive grid classes
    const gridContainer = document.querySelector('.lg\\:grid-cols-2')
    expect(gridContainer).toBeInTheDocument()
    
    // Check for responsive padding
    const section = document.querySelector('.py-16.sm\\:py-20')
    expect(section).toBeInTheDocument()
  })

  it('preserves form state during analysis', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const audienceInput = screen.getByLabelText(/Target Audience/)
    const topicInput = screen.getByLabelText(/Email Topic/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    // Fill out form
    await user.type(subjectInput, 'Test Subject')
    await user.type(audienceInput, 'Test Audience')
    await user.type(topicInput, 'Test Topic')
    
    await user.click(submitButton)
    
    // After submission, form values should be preserved
    expect(subjectInput).toHaveValue('Test Subject')
    expect(audienceInput).toHaveValue('Test Audience')
    expect(topicInput).toHaveValue('Test Topic')
  })

  it('handles multiple consecutive analyses', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    // First analysis
    await user.clear(subjectInput)
    await user.type(subjectInput, 'First Subject')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Second analysis
    await user.clear(subjectInput)
    await user.type(subjectInput, 'Second Subject')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    expect(screen.getByTestId('virality-meter')).toBeInTheDocument()
  })

  it('provides proper error messaging for network issues', async () => {
    const user = userEvent.setup()
    
    // Mock network error
    const { GoogleGenAI } = await import('@google/genai')
    const mockAI = GoogleGenAI as any
    mockAI.mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('Network Error'))
      }
    }))
    
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    const submitButton = screen.getByRole('button', { name: /Analyze Subject Line/ })
    
    await user.type(subjectInput, 'Test Subject')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, we couldn't analyze the subject line/)).toBeInTheDocument()
    })
  })

  it('handles form submission with enter key', async () => {
    const user = userEvent.setup()
    render(<AIEmailSubjectLineTesterSection />)
    
    const subjectInput = screen.getByLabelText(/Enter Subject Line/)
    
    await user.type(subjectInput, 'Weekly Newsletter')
    await user.keyboard('{Enter}')
    
    // Should show loading state
    expect(screen.getByTestId('dynamic-loader')).toBeInTheDocument()
  })
})