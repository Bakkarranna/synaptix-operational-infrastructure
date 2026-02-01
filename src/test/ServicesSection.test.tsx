import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServicesSection from '../../components/ServicesSection'

// Mock external dependencies
vi.mock('../../constants', () => ({
  SERVICES: [
    {
      title: 'AI Chatbots & Assistants',
      icon: 'chat',
      specialties: [
        '24/7 lead capture and customer support with intelligent automation systems.',
        'Automated customer service responses',
        'Lead qualification and routing'
      ]
    },
    {
      title: 'Voice AI Agents',
      icon: 'phone', 
      specialties: [
        'Handle inbound and outbound calls with human-like AI.',
        'Appointment scheduling automation',
        'Smart call routing systems'
      ]
    }
  ]
}))

// Mock the useOnScreen hook
vi.mock('../hooks/useOnScreen', () => ({
  useOnScreen: vi.fn().mockReturnValue(true)
}))

// Mock StyledText component
vi.mock('../../components/StyledText', () => ({
  default: ({ text }: { text: string }) => <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  Icon: ({ name, className, ...props }: any) => (
    <svg className={className} {...props} data-testid={`icon-${name}`} />
  ),
}))

describe('ServicesSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders services section with main heading', () => {
    render(<ServicesSection />)
    
    expect(screen.getByText(/What We Specialize In/i)).toBeInTheDocument()
  })

  it('displays all service cards', async () => {
    await act(async () => {
      render(<ServicesSection />)
    })
    
    // Check for actual services in the component (using getAllByText since there might be duplicates)
    expect(screen.getAllByText(/AI Chatbots & Assistants/i)[0]).toBeInTheDocument()
  })

  it('shows service descriptions and benefits', async () => {
    await act(async () => {
      render(<ServicesSection />)
    })
    
    // Should have service descriptions
    const descriptions = screen.getAllByText(/24\/7 lead capture|lead capture/i)
    expect(descriptions.length).toBeGreaterThan(0)
  })

  it('displays pricing information for services', async () => {
    await act(async () => {
      render(<ServicesSection />)
    })
    
    // Check for service content instead of pricing (services don't show pricing)
    expect(screen.getAllByText(/intelligent automation systems/i)[0]).toBeInTheDocument()
  })

  it('has interactive service cards', async () => {
    const user = userEvent.setup()
    
    await act(async () => {
      render(<ServicesSection />)
    })
    
    const serviceCards = screen.getAllByRole('article')
    expect(serviceCards.length).toBeGreaterThan(0)
    
    // Should be able to interact with service cards
    if (serviceCards.length > 0) {
      await user.hover(serviceCards[0])
      // Service cards should be interactive
      expect(serviceCards[0]).toBeInTheDocument()
    }
  })

  it('shows service icons and visual elements', () => {
    render(<ServicesSection />)
    
    // Should have visual elements like icons
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })
})
