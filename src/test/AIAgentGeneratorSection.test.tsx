import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIAgentGeneratorSection from '../../components/AIAgentGeneratorSection'

// Mock analytics
vi.mock('../../services/analytics', () => ({
  trackEvent: vi.fn()
}))

// Mock environment variables
vi.mock('../../constants', () => ({
  BRAND_NAME: 'Test Brand'
}))

// Mock speech APIs
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue([])
}

const mockSpeechRecognition = vi.fn(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}))

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true
})

Object.defineProperty(window, 'SpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true
})

// Add webkitSpeechRecognition for better browser compatibility
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: mockSpeechRecognition,
  writable: true
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GEMINI_API_KEY: 'test-api-key'
  },
  writable: true
})

// Mock File API - simplified
const mockFileReader: any = {
  result: null,
  error: null,
  readyState: 0,
  onload: null,
  onerror: null,
  readAsDataURL: vi.fn().mockImplementation(function(this: any) {
    setTimeout(() => {
      this.result = 'data:text/plain;base64,dGVzdCBmaWxlIGNvbnRlbnQ='
      if (this.onload) this.onload({})
    }, 100)
  }),
  readAsText: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  readAsBinaryString: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}

// @ts-ignore
global.FileReader = function() { return mockFileReader }

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
})

describe('AIAgentGeneratorSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders section with title and description', () => {
    render(<AIAgentGeneratorSection />)
    
    expect(screen.getByText('AI Agent')).toBeInTheDocument()
    expect(screen.getByText('Generator')).toBeInTheDocument()
    expect(screen.getByText(/Experience a live demo of a bespoke/)).toBeInTheDocument()
  })

  it('renders form with all required input fields', () => {
    render(<AIAgentGeneratorSection />)
    
    // Agent type buttons
    expect(screen.getByRole('button', { name: 'Chatbot' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voice Agent' })).toBeInTheDocument()
    
    // Form inputs
    expect(screen.getByLabelText(/Business Details & Knowledge Base/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Website URL/)).toBeInTheDocument()
    expect(screen.getByText(/Upload a Document/)).toBeInTheDocument()
    
    // Submit button
    expect(screen.getByRole('button', { name: /Generate Demo Agent/ })).toBeInTheDocument()
  })

  it('renders all agent tone options', () => {
    render(<AIAgentGeneratorSection />)
    
    const expectedTones = ['Friendly', 'Professional', 'Empathetic', 'Sales-Driven', 'Concise', 'Witty', 'Calm']
    
    expectedTones.forEach(tone => {
      expect(screen.getByRole('button', { name: tone })).toBeInTheDocument()
    })
  })

  it('renders all agent purpose options', () => {
    render(<AIAgentGeneratorSection />)
    
    const expectedPurposes = ['Sales', 'Lead Qualification', 'Receptionist', 'Customer Support', 'FAQ Answering', 'Appointment Booking']
    
    expectedPurposes.forEach(purpose => {
      expect(screen.getByRole('button', { name: purpose })).toBeInTheDocument()
    })
  })

  it('handles agent type selection correctly', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const chatbotButton = screen.getByRole('button', { name: 'Chatbot' })
    const voiceButton = screen.getByRole('button', { name: 'Voice Agent' })
    
    // Initially chatbot should be selected (default)
    expect(chatbotButton).toHaveClass('bg-primary/20')
    expect(voiceButton).not.toHaveClass('bg-primary/20')
    
    // Click voice agent
    await user.click(voiceButton)
    
    expect(voiceButton).toHaveClass('bg-primary/20')
    expect(chatbotButton).not.toHaveClass('bg-primary/20')
  })

  it('handles business details input correctly', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const textarea = screen.getByLabelText(/Business Details & Knowledge Base/)
    
    await user.type(textarea, 'We are a software consulting company')
    
    expect(textarea).toHaveValue('We are a software consulting company')
  })

  it('handles website URL input correctly', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const urlInput = screen.getByLabelText(/Website URL/)
    
    await user.type(urlInput, 'https://example.com')
    
    expect(urlInput).toHaveValue('https://example.com')
  })

  it('handles tone selection and deselection', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const friendlyButton = screen.getByRole('button', { name: 'Friendly' })
    const professionalButton = screen.getByRole('button', { name: 'Professional' })
    
    // Initially no tones selected
    expect(friendlyButton).not.toHaveClass('bg-primary/20')
    
    // Select friendly tone
    await user.click(friendlyButton)
    expect(friendlyButton).toHaveClass('bg-primary/20')
    
    // Select professional tone (multiple selection)
    await user.click(professionalButton)
    expect(professionalButton).toHaveClass('bg-primary/20')
    expect(friendlyButton).toHaveClass('bg-primary/20')
    
    // Deselect friendly tone
    await user.click(friendlyButton)
    expect(friendlyButton).not.toHaveClass('bg-primary/20')
    expect(professionalButton).toHaveClass('bg-primary/20')
  })

  it('handles purpose selection and deselection', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const salesButton = screen.getByRole('button', { name: 'Sales' })
    const supportButton = screen.getByRole('button', { name: 'Customer Support' })
    
    // Select sales purpose
    await user.click(salesButton)
    expect(salesButton).toHaveClass('bg-primary/20')
    
    // Select customer support (multiple selection)
    await user.click(supportButton)
    expect(supportButton).toHaveClass('bg-primary/20')
    expect(salesButton).toHaveClass('bg-primary/20')
    
    // Deselect sales
    await user.click(salesButton)
    expect(salesButton).not.toHaveClass('bg-primary/20')
    expect(supportButton).toHaveClass('bg-primary/20')
  })

  it('handles file upload correctly', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    await user.upload(fileInput, file)
    
    // File name should appear
    expect(screen.getByText('test.txt')).toBeInTheDocument()
    
    // Remove file button should appear
    expect(screen.getByRole('button', { name: /Remove file/ })).toBeInTheDocument()
  })

  it('handles file removal correctly', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    await user.upload(fileInput, file)
    expect(screen.getByText('test.txt')).toBeInTheDocument()
    
    const removeButton = screen.getByRole('button', { name: /Remove file/ })
    await user.click(removeButton)
    
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove file/ })).not.toBeInTheDocument()
  })

  it('validates form submission with empty inputs', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const submitButton = screen.getByRole('button', { name: /Generate Demo Agent/ })
    
    await user.click(submitButton)
    
    expect(screen.getByText(/Please provide your business details or upload a document/)).toBeInTheDocument()
  })

  it('detects voice API support correctly', () => {
    render(<AIAgentGeneratorSection />)
    
    // Should detect that speechSynthesis and SpeechRecognition are available
    expect(window.speechSynthesis).toBeDefined()
    expect((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition).toBeDefined()
  })

  it('handles scroll position restoration', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const textarea = screen.getByLabelText(/Business Details & Knowledge Base/)
    const submitButton = screen.getByRole('button', { name: /Generate Demo Agent/ })
    
    // Mock scroll position
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true })
    
    await user.type(textarea, 'We are a software consulting company')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should call scrollTo to restore position
    expect(window.scrollTo).toHaveBeenCalled()
  })

  it('tracks analytics events correctly', async () => {
    const user = userEvent.setup()
    const { trackEvent } = await import('../../services/analytics')
    
    render(<AIAgentGeneratorSection />)
    
    const textarea = screen.getByLabelText(/Business Details & Knowledge Base/)
    const submitButton = screen.getByRole('button', { name: /Generate Demo Agent/ })
    
    await user.type(textarea, 'We are a software consulting company')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('generate_ai_agent', { agent_type: 'chatbot' })
    })
  })

  it('applies correct responsive styling', () => {
    render(<AIAgentGeneratorSection />)
    
    // Check for grid layout
    const gridContainer = document.querySelector('.grid.lg\\:grid-cols-2')
    expect(gridContainer).toBeInTheDocument()
    
    // Check for responsive padding
    const section = document.querySelector('.py-20')
    expect(section).toBeInTheDocument()
    
    // Check for responsive text sizing
    const heading = document.querySelector('.text-2xl.md\\:text-3xl')
    expect(heading).toBeInTheDocument()
  })

  it('implements proper accessibility attributes', () => {
    render(<AIAgentGeneratorSection />)
    
    // Check for proper form labels
    expect(screen.getByLabelText(/Business Details & Knowledge Base/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Website URL/)).toBeInTheDocument()
    
    // Check for proper button accessibility
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('handles large file uploads appropriately', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    // Create a large file (simulated)
    const largeFile = new File(['a'.repeat(10000)], 'large-file.txt', { type: 'text/plain' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    await user.upload(fileInput, largeFile)
    
    expect(screen.getByText('large-file.txt')).toBeInTheDocument()
  })

  it('preserves form state during interactions', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    // Fill out form
    const textarea = screen.getByLabelText(/Business Details & Knowledge Base/)
    const urlInput = screen.getByLabelText(/Website URL/)
    const friendlyButton = screen.getByRole('button', { name: 'Friendly' })
    
    await user.type(textarea, 'Test business')
    await user.type(urlInput, 'https://test.com')
    await user.click(friendlyButton)
    
    // Switch agent type
    const voiceButton = screen.getByRole('button', { name: 'Voice Agent' })
    await user.click(voiceButton)
    
    // Form state should be preserved
    expect(textarea).toHaveValue('Test business')
    expect(urlInput).toHaveValue('https://test.com')
    expect(friendlyButton).toHaveClass('bg-primary/20')
  })
})
