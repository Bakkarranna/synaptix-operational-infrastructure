import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Footer from '../../components/Footer'

// Mock external dependencies
vi.mock('../../constants', () => ({
  NAV_LINKS: [
    { href: '/#services', label: 'Services', icon: 'gear' },
    { href: '/#about', label: 'About', icon: 'users' },
  ],
  RESOURCES_LINKS: [
    { href: '/blog', label: 'Blog', icon: 'pencil' },
  ],
  SOCIAL_LINKS: [
    { name: 'LinkedIn', href: 'https://linkedin.com/company/synaptix-studio', icon: 'linkedin' },
  ],
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  Icon: ({ name, className, ...props }: any) => (
    <svg className={className} {...props} data-testid={`icon-${name}`} />
  ),
  SendIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="send-icon" />,
}))

describe('Footer Component', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders footer with company information', () => {
    render(<Footer navigate={mockNavigate} theme="light" />)
    
    expect(screen.getByText(/synaptix studio/i)).toBeInTheDocument()
    expect(screen.getByText(/© \d{4}/)).toBeInTheDocument()
  })

  it('displays contact information', () => {
    render(<Footer navigate={mockNavigate} theme="light" />)
    
    expect(screen.getByText(/info@synaptixstudio\.com/i)).toBeInTheDocument()
  })

  it('shows social media links', () => {
    render(<Footer navigate={mockNavigate} theme="light" />)
    
    // Check for social media links
    const socialLinks = screen.getAllByRole('link')
    expect(socialLinks.length).toBeGreaterThan(0)
  })

  it('has working navigation links', async () => {
    const user = userEvent.setup()
    render(<Footer navigate={mockNavigate} theme="light" />)
    
    const links = screen.getAllByRole('link')
    const internalLink = links.find(link => 
      link.getAttribute('href')?.startsWith('#') || 
      link.getAttribute('href')?.startsWith('/')
    )
    
    if (internalLink) {
      await user.click(internalLink)
      expect(mockNavigate).toHaveBeenCalled()
    }
  })

  it('displays legal links', () => {
    render(<Footer navigate={mockNavigate} theme="light" />)
    
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
  })

  it('shows service categories', () => {
    render(<Footer navigate={mockNavigate} theme="light" />)
    
    // Should show service links or categories
    const serviceLinks = screen.queryAllByText(/ai|automation|consulting/i)
    expect(serviceLinks.length).toBeGreaterThan(0)
  })

  it('has proper link accessibility', () => {
    render(<Footer navigate={mockNavigate} theme="light" />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      // Links should have accessible names
      expect(link).toHaveAccessibleName()
    })
  })

  it('displays current year in copyright', () => {
    render(<Footer navigate={mockNavigate} theme="light" />)
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
  })
})
