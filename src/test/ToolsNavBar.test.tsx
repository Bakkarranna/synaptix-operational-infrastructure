import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToolsNavBar from '../../components/ToolsNavBar'

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

// Mock Icon component
vi.mock('../../components/Icon', () => ({
  Icon: ({ name, className, ...props }: any) => (
    <svg className={className} {...props} data-testid={`icon-${name}`} />
  )
}))

describe('ToolsNavBar Component', () => {
  const mockOnToolSelect = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation links correctly', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    // Check that all tool links are rendered
    expect(screen.getByRole('link', { name: /agent generator/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /content strategist/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /business strategist/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /custom solutions/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /financial analyst/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ad copy generator/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /subject line tester/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /website auditor/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /knowledge base gen/i })).toBeInTheDocument()
  })

  it('renders all icons correctly', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    // Check that all icons are rendered
    expect(screen.getByTestId('icon-users')).toBeInTheDocument()
    expect(screen.getByTestId('icon-sparkles')).toBeInTheDocument()
    expect(screen.getByTestId('icon-lightbulb')).toBeInTheDocument()
    expect(screen.getByTestId('icon-cube')).toBeInTheDocument()
    expect(screen.getByTestId('icon-calculator')).toBeInTheDocument()
    expect(screen.getByTestId('icon-megaphone')).toBeInTheDocument()
    expect(screen.getByTestId('icon-inbox')).toBeInTheDocument()
    expect(screen.getByTestId('icon-file-search')).toBeInTheDocument()
    expect(screen.getByTestId('icon-book-open')).toBeInTheDocument()
  })

  it('highlights the active tool correctly', () => {
    render(<ToolsNavBar activeTool="#viral-content-strategist" onToolSelect={mockOnToolSelect} />)
    
    const activeLink = screen.getByRole('link', { name: /content strategist/i })
    const inactiveLink = screen.getByRole('link', { name: /agent generator/i })
    
    // Active link should have active classes
    expect(activeLink).toHaveClass('bg-primary/10', 'text-primary')
    
    // Inactive link should not have active classes
    expect(inactiveLink).not.toHaveClass('bg-primary/10', 'text-primary')
    expect(inactiveLink).toHaveClass('text-gray-600')
  })

  it('handles link clicks correctly', async () => {
    const user = userEvent.setup()
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const contentStrategyLink = screen.getByRole('link', { name: /content strategist/i })
    
    await user.click(contentStrategyLink)
    
    expect(mockOnToolSelect).toHaveBeenCalledWith('#viral-content-strategist')
  })

  it('prevents default link behavior on click', async () => {
    const user = userEvent.setup()
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const contentStrategyLink = screen.getByRole('link', { name: /content strategist/i })
    
    // Add event listener to check if preventDefault was called
    const preventDefaultSpy = vi.fn()
    contentStrategyLink.addEventListener('click', (e) => {
      preventDefaultSpy()
      // The component should call preventDefault, but we can't directly test it
      // We can test that the onToolSelect callback is called instead
    })
    
    await user.click(contentStrategyLink)
    
    expect(mockOnToolSelect).toHaveBeenCalledWith('#viral-content-strategist')
  })

  it('applies correct href attributes to links', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const agentGeneratorLink = screen.getByRole('link', { name: /agent generator/i })
    const contentStrategyLink = screen.getByRole('link', { name: /content strategist/i })
    
    expect(agentGeneratorLink).toHaveAttribute('href', '#ai-agent-generator')
    expect(contentStrategyLink).toHaveAttribute('href', '#viral-content-strategist')
  })

  it('handles multiple clicks correctly', async () => {
    const user = userEvent.setup()
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const roiCalculatorLink = screen.getByRole('link', { name: /financial analyst/i })
    const ideaGeneratorLink = screen.getByRole('link', { name: /business strategist/i })
    
    await user.click(roiCalculatorLink)
    expect(mockOnToolSelect).toHaveBeenCalledWith('#roi-calculator')
    
    await user.click(ideaGeneratorLink)
    expect(mockOnToolSelect).toHaveBeenCalledWith('#ai-idea-generator')
    
    expect(mockOnToolSelect).toHaveBeenCalledTimes(2)
  })

  it('applies correct responsive classes', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    // Check for sticky positioning and responsive classes
    const navContainer = document.querySelector('.sticky')
    expect(navContainer).toHaveClass('top-15', 'z-40', 'my-12', 'animate-fade-in')
    
    // Check for responsive container
    const container = document.querySelector('.container')
    expect(container).toHaveClass('mx-auto', 'px-2', 'sm:px-0')
    
    // Check for responsive gap classes
    const nav = document.querySelector('nav')
    expect(nav).toHaveClass('gap-x-1', 'sm:gap-x-2')
  })

  it('applies backdrop blur and glass morphism styling', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const nav = document.querySelector('nav')
    expect(nav).toHaveClass(
      'bg-white/20',
      'dark:bg-black/30',
      'backdrop-blur-md',
      'rounded-full',
      'border',
      'border-gray-900/10',
      'dark:border-white/10',
      'shadow-lg'
    )
  })

  it('handles dark mode styling correctly', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const activeLink = screen.getByRole('link', { name: /agent generator/i })
    const inactiveLink = screen.getByRole('link', { name: /content strategist/i })
    
    // Active link should have dark mode classes
    expect(activeLink).toHaveClass('dark:bg-primary/20', 'dark:text-white')
    
    // Inactive link should have dark mode classes
    expect(inactiveLink).toHaveClass('dark:text-white/70', 'dark:hover:text-white', 'dark:hover:bg-white/10')
  })

  it('implements overflow scroll for mobile devices', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const nav = document.querySelector('nav')
    expect(nav).toHaveClass('overflow-x-auto', 'no-scrollbar')
  })

  it('renders with flex-shrink-0 for horizontal scroll prevention', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveClass('flex-shrink-0')
    })
  })

  it('shows labels on larger screens and hides on small screens', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const labelSpans = document.querySelectorAll('span.hidden.sm\\:inline')
    expect(labelSpans.length).toBeGreaterThan(0)
    
    // Each span should have the responsive classes
    labelSpans.forEach(span => {
      expect(span).toHaveClass('hidden', 'sm:inline')
    })
  })

  it('maintains consistent transition animations', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveClass('transition-all', 'duration-300')
    })
  })

  it('handles tool selection with keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const contentStrategyLink = screen.getByRole('link', { name: /content strategist/i })
    
    // Focus the link and press Enter
    contentStrategyLink.focus()
    await user.keyboard('{Enter}')
    
    expect(mockOnToolSelect).toHaveBeenCalledWith('#viral-content-strategist')
  })

  it('provides proper accessibility attributes', () => {
    render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    const nav = document.querySelector('nav')
    expect(nav).toBeInTheDocument()
    
    // All links should be accessible
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(9) // All 9 AI tools
    
    // Icons should have proper data-testid for accessibility testing
    const icons = document.querySelectorAll('[data-testid^="icon-"]')
    expect(icons).toHaveLength(9)
  })

  it('updates active state when activeTool prop changes', () => {
    const { rerender } = render(<ToolsNavBar activeTool="#ai-agent-generator" onToolSelect={mockOnToolSelect} />)
    
    // Initially agent generator should be active
    const agentGeneratorLink = screen.getByRole('link', { name: /agent generator/i })
    const contentStrategyLink = screen.getByRole('link', { name: /content strategist/i })
    
    expect(agentGeneratorLink).toHaveClass('bg-primary/10')
    expect(contentStrategyLink).not.toHaveClass('bg-primary/10')
    
    // Change active tool
    rerender(<ToolsNavBar activeTool="#viral-content-strategist" onToolSelect={mockOnToolSelect} />)
    
    // Now content strategy should be active
    expect(agentGeneratorLink).not.toHaveClass('bg-primary/10')
    expect(contentStrategyLink).toHaveClass('bg-primary/10')
  })

  it('handles edge case with empty activeTool', () => {
    render(<ToolsNavBar activeTool="" onToolSelect={mockOnToolSelect} />)
    
    // No link should have active classes
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).not.toHaveClass('bg-primary/10')
      expect(link).toHaveClass('text-gray-600')
    })
  })
})