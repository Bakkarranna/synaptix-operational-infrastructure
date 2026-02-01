import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIToolsPage from '../../components/AIToolsPage'

// Mock external dependencies
vi.mock('../../constants', () => ({
  AI_TOOLS_NAV_LINKS: [
    { href: '#ai-agent-generator', label: 'Agent Generator', icon: 'users' },
    { href: '#viral-content-strategist', label: 'Content Strategist', icon: 'sparkles' },
    { href: '#ai-idea-generator', label: 'Business Strategist', icon: 'lightbulb' },
    { href: '#custom-solutions', label: 'Custom Solutions', icon: 'cube' },
    { href: '#roi-calculator', label: 'Financial Analyst', icon: 'calculator' },
    { href: '#ai-ad-copy-generator', label: 'Ad Copy Generator', icon: 'megaphone' },
    { href: '#ai-subject-line-tester', label: 'Subject Line Tester', icon: 'inbox' },
    { href: '#ai-website-auditor', label: 'Website Auditor', icon: 'file-search' },
    { href: '#ai-knowledge-base-generator', label: 'Knowledge Base Gen', icon: 'book-open' }
  ]
}))

// Mock StyledText component
vi.mock('../../components/StyledText', () => ({
  default: ({ text }: { text: string }) => {
    const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />
  }
}))

// Mock ToolsNavBar component
vi.mock('../../components/ToolsNavBar', () => ({
  default: ({ activeTool, onToolSelect }: { activeTool: string; onToolSelect: (tool: string) => void }) => (
    <div data-testid="tools-navbar">
      <div data-testid="active-tool">{activeTool}</div>
      <button onClick={() => onToolSelect('#ai-agent-generator')} data-testid="nav-agent-generator">
        Agent Generator
      </button>
      <button onClick={() => onToolSelect('#viral-content-strategist')} data-testid="nav-content-strategist">
        Content Strategist
      </button>
      <button onClick={() => onToolSelect('#roi-calculator')} data-testid="nav-roi-calculator">
        ROI Calculator
      </button>
    </div>
  )
}))

// Mock AI tool section components
vi.mock('../../components/AIAgentGeneratorSection', () => ({
  default: () => <div data-testid="ai-agent-generator-section">AI Agent Generator Section</div>
}))

vi.mock('../../components/AIContentSparkSection', () => ({
  default: () => <div data-testid="ai-content-spark-section">AI Content Spark Section</div>
}))

vi.mock('../../components/AIIdeaGeneratorSection', () => ({
  default: ({ navigate }: { navigate: (path: string) => void }) => (
    <div data-testid="ai-idea-generator-section">
      AI Idea Generator Section
      <button onClick={() => navigate('/test-navigate')} data-testid="idea-generator-navigate">
        Test Navigate
      </button>
    </div>
  )
}))

vi.mock('../../components/CustomSolutionsSection', () => ({
  default: ({ navigate }: { navigate: (path: string) => void }) => (
    <div data-testid="custom-solutions-section">
      Custom Solutions Section
      <button onClick={() => navigate('/test-custom-navigate')} data-testid="custom-solutions-navigate">
        Test Navigate
      </button>
    </div>
  )
}))

vi.mock('../../components/ROICalculatorSection', () => ({
  default: ({ navigate }: { navigate: (path: string) => void }) => (
    <div data-testid="roi-calculator-section">
      ROI Calculator Section
      <button onClick={() => navigate('/test-roi-navigate')} data-testid="roi-calculator-navigate">
        Test Navigate
      </button>
    </div>
  )
}))

vi.mock('../../components/AIAdCopyGeneratorSection', () => ({
  default: () => <div data-testid="ai-ad-copy-generator-section">AI Ad Copy Generator Section</div>
}))

vi.mock('../../components/AIEmailSubjectLineTesterSection', () => ({
  default: () => <div data-testid="ai-email-subject-line-tester-section">AI Email Subject Line Tester Section</div>
}))

vi.mock('../../components/AIWebsiteAuditorSection', () => ({
  default: ({ navigate }: { navigate: (path: string) => void }) => (
    <div data-testid="ai-website-auditor-section">
      AI Website Auditor Section
      <button onClick={() => navigate('/test-auditor-navigate')} data-testid="website-auditor-navigate">
        Test Navigate
      </button>
    </div>
  )
}))

vi.mock('../../components/AIKnowledgeBaseGeneratorSection', () => ({
  default: ({ navigate }: { navigate: (path: string) => void }) => (
    <div data-testid="ai-knowledge-base-generator-section">
      AI Knowledge Base Generator Section
      <button onClick={() => navigate('/test-kb-navigate')} data-testid="kb-generator-navigate">
        Test Navigate
      </button>
    </div>
  )
}))

// Mock window.location for hash-based routing
const mockLocation = {
  hash: '#/ai-tools#ai-agent-generator'
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('AIToolsPage Component', () => {
  const mockNavigate = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window location hash
    window.location.hash = '#/ai-tools#ai-agent-generator'
  })

  afterEach(() => {
    cleanup()
  })

  it('renders AI tools page with title and description', () => {
    render(<AIToolsPage navigate={mockNavigate} />)
    
    expect(screen.getByText('Synaptix Studio')).toBeInTheDocument()
    expect(screen.getByText('AI Toolkit')).toBeInTheDocument()
    expect(screen.getByText(/Experience the power of our AI firsthand/)).toBeInTheDocument()
  })

  it('renders back to home button and handles navigation', async () => {
    const user = userEvent.setup()
    render(<AIToolsPage navigate={mockNavigate} />)
    
    const backButton = screen.getByRole('button', { name: /back to home/i })
    expect(backButton).toBeInTheDocument()
    
    await user.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders ToolsNavBar component', () => {
    render(<AIToolsPage navigate={mockNavigate} />)
    
    expect(screen.getByTestId('tools-navbar')).toBeInTheDocument()
  })

  it('initializes with correct default tool from URL hash', () => {
    window.location.hash = '#/ai-tools#viral-content-strategist'
    
    render(<AIToolsPage navigate={mockNavigate} />)
    
    // Should render the content strategist section
    expect(screen.getByTestId('ai-content-spark-section')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-agent-generator-section')).not.toBeInTheDocument()
  })

  it('defaults to first tool when URL hash is invalid', () => {
    window.location.hash = '#/ai-tools#invalid-tool'
    
    render(<AIToolsPage navigate={mockNavigate} />)
    
    // Should default to AI Agent Generator (first tool)
    expect(screen.getByTestId('ai-agent-generator-section')).toBeInTheDocument()
  })

  it('handles tool selection from navbar correctly', async () => {
    const user = userEvent.setup()
    render(<AIToolsPage navigate={mockNavigate} />)
    
    // Initially should show agent generator
    expect(screen.getByTestId('ai-agent-generator-section')).toBeInTheDocument()
    
    // Click on ROI Calculator in navbar
    const roiButton = screen.getByTestId('nav-roi-calculator')
    await user.click(roiButton)
    
    // Should navigate and update active tool
    expect(mockNavigate).toHaveBeenCalledWith('/ai-tools#roi-calculator')
  })

  it('renders all AI tool sections correctly based on selection', () => {
    const testCases = [
      { hash: '#ai-agent-generator', testId: 'ai-agent-generator-section' },
      { hash: '#viral-content-strategist', testId: 'ai-content-spark-section' },
      { hash: '#ai-idea-generator', testId: 'ai-idea-generator-section' },
      { hash: '#custom-solutions', testId: 'custom-solutions-section' },
      { hash: '#roi-calculator', testId: 'roi-calculator-section' },
      { hash: '#ai-ad-copy-generator', testId: 'ai-ad-copy-generator-section' },
      { hash: '#ai-subject-line-tester', testId: 'ai-email-subject-line-tester-section' },
      { hash: '#ai-website-auditor', testId: 'ai-website-auditor-section' },
      { hash: '#ai-knowledge-base-generator', testId: 'ai-knowledge-base-generator-section' }
    ]
    
    testCases.forEach(({ hash, testId }) => {
      window.location.hash = `#/ai-tools${hash}`
      const { unmount } = render(<AIToolsPage navigate={mockNavigate} />)
      
      expect(screen.getByTestId(testId)).toBeInTheDocument()
      
      unmount()
    })
  })

  it('passes navigate prop to components that require it', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/ai-tools#ai-idea-generator'
    
    render(<AIToolsPage navigate={mockNavigate} />)
    
    const navigateButton = screen.getByTestId('idea-generator-navigate')
    await user.click(navigateButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/test-navigate')
  })

  it('handles hashchange event correctly', () => {
    render(<AIToolsPage navigate={mockNavigate} />)
    
    // Initially shows agent generator
    expect(screen.getByTestId('ai-agent-generator-section')).toBeInTheDocument()
    
    // Simulate hash change
    window.location.hash = '#/ai-tools#roi-calculator'
    fireEvent(window, new HashChangeEvent('hashchange'))
    
    // Should update to show ROI calculator
    expect(screen.getByTestId('roi-calculator-section')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-agent-generator-section')).not.toBeInTheDocument()
  })

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    const { unmount } = render(<AIToolsPage navigate={mockNavigate} />)
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function))
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function))
  })

  it('applies correct CSS classes for responsive design', () => {
    render(<AIToolsPage navigate={mockNavigate} />)
    
    // Check for main container classes
    const mainContainer = screen.getByRole('main')?.closest('div')
    expect(mainContainer).toHaveClass('relative', 'z-10', 'animate-fade-in')
    
    // Check for responsive padding classes
    const container = document.querySelector('.container')
    expect(container).toHaveClass('mx-auto', 'px-6', 'pt-24', 'sm:pt-32', 'pb-20')
  })

  it('renders with proper accessibility attributes', () => {
    render(<AIToolsPage navigate={mockNavigate} />)
    
    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    
    // Check for back button accessibility
    const backButton = screen.getByRole('button', { name: /back to home/i })
    expect(backButton).toBeInTheDocument()
  })

  it('handles multiple tool sections with navigate props correctly', async () => {
    const user = userEvent.setup()
    
    // Test different sections that use navigate prop
    const sectionsWithNavigate = [
      { hash: '#ai-idea-generator', buttonId: 'idea-generator-navigate', expectedCall: '/test-navigate' },
      { hash: '#custom-solutions', buttonId: 'custom-solutions-navigate', expectedCall: '/test-custom-navigate' },
      { hash: '#roi-calculator', buttonId: 'roi-calculator-navigate', expectedCall: '/test-roi-navigate' },
      { hash: '#ai-website-auditor', buttonId: 'website-auditor-navigate', expectedCall: '/test-auditor-navigate' },
      { hash: '#ai-knowledge-base-generator', buttonId: 'kb-generator-navigate', expectedCall: '/test-kb-navigate' }
    ]
    
    for (const section of sectionsWithNavigate) {
      vi.clearAllMocks()
      window.location.hash = `#/ai-tools${section.hash}`
      
      const { unmount } = render(<AIToolsPage navigate={mockNavigate} />)
      
      const navigateButton = screen.getByTestId(section.buttonId)
      await user.click(navigateButton)
      
      expect(mockNavigate).toHaveBeenCalledWith(section.expectedCall)
      
      unmount()
    }
  })

  it('maintains tool state during navigation', () => {
    const { rerender } = render(<AIToolsPage navigate={mockNavigate} />)
    
    // Start with agent generator
    expect(screen.getByTestId('ai-agent-generator-section')).toBeInTheDocument()
    
    // Change hash
    window.location.hash = '#/ai-tools#viral-content-strategist'
    rerender(<AIToolsPage navigate={mockNavigate} />)
    
    // Should now show content strategist
    expect(screen.getByTestId('ai-content-spark-section')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-agent-generator-section')).not.toBeInTheDocument()
  })

  it('handles edge cases in URL parsing correctly', () => {
    const edgeCases = [
      { hash: '', expectedSection: 'ai-agent-generator-section' },
      { hash: '#', expectedSection: 'ai-agent-generator-section' },
      { hash: '#/ai-tools', expectedSection: 'ai-agent-generator-section' },
      { hash: '#/ai-tools#', expectedSection: 'ai-agent-generator-section' },
      { hash: '#/other-page#ai-agent-generator', expectedSection: 'ai-agent-generator-section' }
    ]
    
    edgeCases.forEach(({ hash, expectedSection }) => {
      window.location.hash = hash
      const { unmount } = render(<AIToolsPage navigate={mockNavigate} />)
      
      expect(screen.getByTestId(expectedSection)).toBeInTheDocument()
      
      unmount()
    })
  })
})
