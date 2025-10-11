import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../../components/Header'

// Mock external dependencies
vi.mock('../../constants', () => ({
  NAV_LINKS: [
    { href: '/#services', label: 'Services', icon: 'gear' },
    { href: '/#custom-solutions', label: 'Industries', icon: 'building' },
    { href: '/#about', label: 'About', icon: 'users' },
    { href: '/#launchpad', label: 'Launchpad', icon: 'rocket' },
    { href: '/#pricing', label: 'Pricing', icon: 'calculator' },
    { href: '/#lets-talk', label: 'Contact', icon: 'email' },
  ],
  AI_TOOLS_NAV_LINKS: [
    { href: '/ai-tools', label: 'AI Tools', icon: 'gear' },
  ],
  RESOURCES_LINKS: [
    { href: '/blog', label: 'Blog', icon: 'pencil' },
    { href: '/careers', label: 'Careers', icon: 'rocket' },
    { href: '/partner', label: 'Partners', icon: 'users' },
  ],
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  Icon: ({ name, className, ...props }: any) => (
    <svg className={className} {...props} data-testid={`icon-${name}`} />
  ),
  SunIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="sun-icon" />,
  MoonIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="moon-icon" />,
  MenuIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="menu-icon" />,
  XIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="x-icon" />,
}))

describe('Header Component', () => {
  const mockNavigate = vi.fn()
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header with logo', async () => {
    await act(async () => {
      render(<Header navigate={mockNavigate} theme="light" toggleTheme={mockToggleTheme} />)
    })
    
    expect(screen.getByAltText(/synaptix studio logo/i)).toBeInTheDocument()
  })

  it('displays navigation menu items', async () => {
    await act(async () => {
      render(<Header navigate={mockNavigate} theme="light" toggleTheme={mockToggleTheme} />)
    })
    
    // Check for main navigation items (these are present in desktop view)
    expect(screen.getByText(/resources/i)).toBeInTheDocument()
    
    // Check for individual nav links - using the actual link text from NAV_LINKS
    expect(screen.getByText(/services/i)).toBeInTheDocument()
    expect(screen.getByText(/industries/i)).toBeInTheDocument()
    expect(screen.getByText(/about/i)).toBeInTheDocument()
    expect(screen.getByText(/pricing/i)).toBeInTheDocument()
  })

  it('has working theme toggle button', async () => {
    const user = userEvent.setup()
    render(<Header navigate={mockNavigate} theme="light" toggleTheme={mockToggleTheme} />)
    
    const themeToggle = screen.getByLabelText(/switch to dark mode/i)
    await user.click(themeToggle)
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('displays mobile menu toggle', () => {
    render(<Header navigate={mockNavigate} theme="light" toggleTheme={mockToggleTheme} />)
    
    const mobileMenuToggle = screen.getByRole('button', { name: /open navigation menu/i })
    expect(mobileMenuToggle).toBeInTheDocument()
  })

  it('handles navigation clicks', async () => {
    const user = userEvent.setup()
    render(<Header navigate={mockNavigate} theme="light" toggleTheme={mockToggleTheme} />)
    
    // Click on Services link
    const servicesLink = screen.getByText(/services/i)
    await user.click(servicesLink)
    
    expect(mockNavigate).toHaveBeenCalledWith('/#services')
  })

  it('shows correct theme indicator', () => {
    const { rerender } = render(<Header navigate={mockNavigate} theme="light" toggleTheme={mockToggleTheme} />)
    
    // Check light theme indicator
    expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument()
    
    // Re-render with dark theme
    rerender(<Header navigate={mockNavigate} theme="dark" toggleTheme={mockToggleTheme} />)
    
    // Check dark theme indicator
    expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument()
  })

  it('is responsive and works on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(<Header navigate={mockNavigate} theme="light" toggleTheme={mockToggleTheme} />)
    
    // Mobile menu should be present
    const mobileMenuToggle = screen.getByRole('button', { name: /open navigation menu/i })
    expect(mobileMenuToggle).toBeInTheDocument()
  })
})