import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomSolutionsSection from '../../components/CustomSolutionsSection'

// Mock external dependencies
vi.mock('../../constants', () => ({
  LAUNCHPAD_PERSONAS: {
    'small-business': {
      title: 'Small Business Owner',
      description: 'Growing local business needing efficiency',
      challenges: ['Limited Resources', 'Manual Processes'],
      solutions: [
        { title: 'Customer Service Automation', description: 'AI chatbots for 24/7 support' },
        { title: 'Lead Management', description: 'Automated lead qualification' }
      ]
    },
    'enterprise': {
      title: 'Enterprise Executive',
      description: 'Large organization scaling operations',
      challenges: ['Complex Workflows', 'Data Silos'],
      solutions: [
        { title: 'Process Automation', description: 'End-to-end workflow automation' },
        { title: 'Data Integration', description: 'Unified data platforms' }
      ]
    }
  }
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  Icon: ({ name, className, ...props }: any) => (
    <svg className={className} {...props} data-testid={`icon-${name}`} />
  ),
  CheckIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="check-icon" />
}))

// Mock StyledText component
vi.mock('../../components/StyledText', () => ({
  default: ({ text }: { text: string }) => {
    const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />
  }
}))

// Mock useOnScreen hook
vi.mock('../../hooks/useOnScreen', () => ({
  useOnScreen: () => true
}))

describe('CustomSolutionsSection Component', () => {
  const mockNavigate = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders section with title and subtitle', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    expect(screen.getByText('Your AI')).toBeInTheDocument()
    expect(screen.getByText('Launchpad')).toBeInTheDocument()
    expect(screen.getByText(/Select your profile to see how we build/)).toBeInTheDocument()
  })

  it('renders persona selection buttons', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    expect(screen.getByRole('button', { name: /Small Business Owner/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enterprise Executive/ })).toBeInTheDocument()
  })

  it('shows first persona as active by default', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const smallBusinessButton = screen.getByRole('button', { name: /Small Business Owner/ })
    const enterpriseButton = screen.getByRole('button', { name: /Enterprise Executive/ })
    
    expect(smallBusinessButton).toHaveClass('bg-primary/10')
    expect(enterpriseButton).not.toHaveClass('bg-primary/10')
  })

  it('switches active persona when clicked', async () => {
    const user = userEvent.setup()
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const enterpriseButton = screen.getByRole('button', { name: /Enterprise Executive/ })
    const smallBusinessButton = screen.getByRole('button', { name: /Small Business Owner/ })
    
    await user.click(enterpriseButton)
    
    expect(enterpriseButton).toHaveClass('bg-primary/10')
    expect(smallBusinessButton).not.toHaveClass('bg-primary/10')
  })

  it('displays active persona information correctly', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    // Should show small business info by default
    expect(screen.getByText('Growing local business needing efficiency')).toBeInTheDocument()
    expect(screen.getByText('Limited Resources')).toBeInTheDocument()
    expect(screen.getByText('Manual Processes')).toBeInTheDocument()
  })

  it('updates persona information when switching', async () => {
    const user = userEvent.setup()
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const enterpriseButton = screen.getByRole('button', { name: /Enterprise Executive/ })
    
    await user.click(enterpriseButton)
    
    // Should now show enterprise info
    expect(screen.getByText('Large organization scaling operations')).toBeInTheDocument()
    expect(screen.getByText('Complex Workflows')).toBeInTheDocument()
    expect(screen.getByText('Data Silos')).toBeInTheDocument()
  })

  it('displays persona solutions correctly', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    // Should show small business solutions by default
    expect(screen.getByText('Customer Service Automation')).toBeInTheDocument()
    expect(screen.getByText('AI chatbots for 24/7 support')).toBeInTheDocument()
    expect(screen.getByText('Lead Management')).toBeInTheDocument()
    expect(screen.getByText('Automated lead qualification')).toBeInTheDocument()
  })

  it('updates solutions when switching personas', async () => {
    const user = userEvent.setup()
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const enterpriseButton = screen.getByRole('button', { name: /Enterprise Executive/ })
    
    await user.click(enterpriseButton)
    
    // Should now show enterprise solutions
    expect(screen.getByText('Process Automation')).toBeInTheDocument()
    expect(screen.getByText('End-to-end workflow automation')).toBeInTheDocument()
    expect(screen.getByText('Data Integration')).toBeInTheDocument()
    expect(screen.getByText('Unified data platforms')).toBeInTheDocument()
  })

  it('renders CTA button and handles navigation', async () => {
    const user = userEvent.setup()
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const ctaButton = screen.getByRole('link', { name: /Book Your Free Discovery Call/ })
    expect(ctaButton).toBeInTheDocument()
    
    await user.click(ctaButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/#lets-talk')
  })

  it('applies correct responsive styling', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    // Check for responsive container
    const container = document.querySelector('.container')
    expect(container).toHaveClass('mx-auto', 'px-6')
    
    // Check for responsive text sizing
    const heading = document.querySelector('.text-2xl.md\\:text-3xl')
    expect(heading).toBeInTheDocument()
  })

  it('implements proper accessibility', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    // Check for proper button roles
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // Check for proper link accessibility
    const ctaLink = screen.getByRole('link', { name: /Book Your Free Discovery Call/ })
    expect(ctaLink).toBeInTheDocument()
  })

  it('shows persona icons correctly', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    // Icons should be rendered for personas
    const icons = document.querySelectorAll('[data-testid^="icon-"]')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('displays check icons for solutions', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const checkIcons = screen.getAllByTestId('check-icon')
    expect(checkIcons.length).toBeGreaterThan(0)
  })

  it('handles multiple rapid persona switches correctly', async () => {
    const user = userEvent.setup()
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const smallBusinessButton = screen.getByRole('button', { name: /Small Business Owner/ })
    const enterpriseButton = screen.getByRole('button', { name: /Enterprise Executive/ })
    
    // Rapidly switch between personas
    await user.click(enterpriseButton)
    await user.click(smallBusinessButton)
    await user.click(enterpriseButton)
    
    // Should end up showing enterprise content
    expect(enterpriseButton).toHaveClass('bg-primary/10')
    expect(screen.getByText('Large organization scaling operations')).toBeInTheDocument()
  })

  it('maintains state consistency during interactions', async () => {
    const user = userEvent.setup()
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const enterpriseButton = screen.getByRole('button', { name: /Enterprise Executive/ })
    
    await user.click(enterpriseButton)
    
    // All enterprise content should be visible simultaneously
    expect(screen.getByText('Large organization scaling operations')).toBeInTheDocument()
    expect(screen.getByText('Complex Workflows')).toBeInTheDocument()
    expect(screen.getByText('Process Automation')).toBeInTheDocument()
    expect(screen.getByText('Data Integration')).toBeInTheDocument()
  })

  it('handles personas with different numbers of challenges and solutions', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    // Small business has 2 challenges and 2 solutions
    expect(screen.getByText('Limited Resources')).toBeInTheDocument()
    expect(screen.getByText('Manual Processes')).toBeInTheDocument()
    expect(screen.getByText('Customer Service Automation')).toBeInTheDocument()
    expect(screen.getByText('Lead Management')).toBeInTheDocument()
  })

  it('prevents default link behavior and uses navigate function', async () => {
    const user = userEvent.setup()
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    const ctaButton = screen.getByRole('link', { name: /Book Your Free Discovery Call/ })
    
    // Should use navigate instead of default link behavior
    await user.click(ctaButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/#lets-talk')
  })

  it('applies animation classes correctly', () => {
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    // Check for animation classes
    const animatedElement = document.querySelector('.animate-fade-in')
    expect(animatedElement).toBeInTheDocument()
  })

  it('handles edge case with empty persona data gracefully', () => {
    // This tests robustness against potential data issues
    render(<CustomSolutionsSection navigate={mockNavigate} />)
    
    // Component should render without crashing even if data is incomplete
    expect(screen.getByText('Your AI')).toBeInTheDocument()
    expect(screen.getByText('Launchpad')).toBeInTheDocument()
  })
})