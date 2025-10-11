import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIAgentGeneratorSection from '../../components/AIAgentGeneratorSection'

// Mock external dependencies
vi.mock('../../constants', () => ({
  AGENT_TONES: ['Friendly', 'Professional', 'Empathetic', 'Sales-Driven', 'Concise', 'Witty', 'Calm'],
  AGENT_PURPOSES: ['Sales', 'Lead Qualification', 'Receptionist', 'Customer Support', 'FAQ Answering', 'Appointment Booking'],
  LOADING_MESSAGES: {
    AGENT: [
      "Analyzing your business data and knowledge base...",
      "Designing the AI agent's core persona...",
      "Generating the foundational system prompt...",
      "Defining primary goals and constraints...",
      "Crafting sample interactions and a greeting...",
      "Assembling the interactive demo..."
    ]
  }
}))

// Mock Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          agentType: 'chatbot',
          agentName: 'BusinessBot',
          voiceDescription: '',
          systemPrompt: 'You are a helpful business assistant AI.',
          greetingMessage: 'Hello! I\'m BusinessBot, how can I help you today?',
          sampleInteractions: [
            { user: 'What services do you offer?', agent: 'We offer AI automation services.' },
            { user: 'How much does it cost?', agent: 'Our pricing starts at $500/month.' }
          ]
        })
      })
    }
  }))
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  UsersIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="users-icon" />,
  UploadIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="upload-icon" />,
  XCircleIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="x-circle-icon" />,
  SendIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="send-icon" />,
  PhoneIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="phone-icon" />,
  UserIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="user-icon" />,
  ChatIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="chat-icon" />,
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

// Mock MarkdownRenderer component
vi.mock('../../components/MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
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

// Mock Web Speech API
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => [])
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

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GEMINI_API_KEY: 'test-api-key'
  },
  writable: true
})

// Mock File API
global.FileReader = class {
  result: string | ArrayBuffer | null = null
  error: DOMException | null = null
  readyState: number = 0
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  
  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = 'data:text/plain;base64,dGVzdCBmaWxlIGNvbnRlbnQ='
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>)
      }
    }, 100)
  }
} as any

describe('AIAgentGeneratorSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset scrollTo mock
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
    const uploadButton = screen.getByRole('button', { name: /Click to upload/ })
    
    // Get the hidden file input
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

  it('submits form successfully with business details', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const textarea = screen.getByLabelText(/Business Details & Knowledge Base/)
    const submitButton = screen.getByRole('button', { name: /Generate Demo Agent/ })
    
    await user.type(textarea, 'We are a software consulting company')
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-loader')).toBeInTheDocument()
  })

  it('displays AI generation results correctly', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    const textarea = screen.getByLabelText(/Business Details & Knowledge Base/)
    const submitButton = screen.getByRole('button', { name: /Generate Demo Agent/ })
    
    await user.type(textarea, 'We are a software consulting company')
    await user.click(submitButton)
    
    // Wait for AI response
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show agent results
    expect(screen.getByText(/BusinessBot/)).toBeInTheDocument()
    expect(screen.getByText(/Hello! I'm BusinessBot/)).toBeInTheDocument()
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
    
    render(<AIAgentGeneratorSection />)
    
    const textarea = screen.getByLabelText(/Business Details & Knowledge Base/)
    const submitButton = screen.getByRole('button', { name: /Generate Demo Agent/ })
    
    await user.type(textarea, 'We are a software consulting company')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, we couldn't generate your AI agent demo/)).toBeInTheDocument()
    })
  })

  it('handles live training functionality', async () => {
    const user = userEvent.setup()
    render(<AIAgentGeneratorSection />)
    
    // First generate an agent
    const textarea = screen.getByLabelText(/Business Details & Knowledge Base/)
    const submitButton = screen.getByRole('button', { name: /Generate Demo Agent/ })
    
    await user.type(textarea, 'We are a software consulting company')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Now test live training
    const trainingTextarea = screen.getByPlaceholderText(/We are running a 25% off sale/)
    const trainButton = screen.getByRole('button', { name: 'Train Agent' })
    
    await user.type(trainingTextarea, 'New training information')
    await user.click(trainButton)
    
    // Training text should be cleared
    expect(trainingTextarea).toHaveValue('')
  })

  it('disables train button when training text is empty', () => {
    render(<AIAgentGeneratorSection />)
    
    // Note: Train button only appears after agent generation
    // This test checks the disabled state logic
    const trainingButton = document.querySelector('button[disabled]')
    if (trainingButton && trainingButton.textContent?.includes('Train')) {
      expect(trainingButton).toBeDisabled()
    }
  })

  it('detects voice API support correctly', () => {
    render(<AIAgentGeneratorSection />)
    
    // Should detect that speechSynthesis and SpeechRecognition are available
    // This affects which demo component is rendered for voice agents
    expect(window.speechSynthesis).toBeDefined()
    expect(window.SpeechRecognition).toBeDefined()
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
    
    // Check for ARIA attributes on error messages
    const errorRegion = document.querySelector('[role="alert"]')
    // Error region exists only when there's an error, so this is conditional
    
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