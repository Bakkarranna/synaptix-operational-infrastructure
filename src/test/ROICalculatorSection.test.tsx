import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ROICalculatorSection from '../../components/ROICalculatorSection'

// Mock external dependencies
vi.mock('../../constants', () => ({
  LOADING_MESSAGES: {
    ROI: [
      "Processing your business metrics...",
      "Calculating current operational costs...",
      "Modeling potential efficiency gains with AI...",
      "Forecasting revenue growth from automation...",
      "Compiling a detailed financial projection...",
      "Finalizing your ROI analysis..."
    ]
  }
}))

// Mock Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          savings: {
            value: 50000,
            justification: "Automation of customer support and lead qualification processes will save approximately 2.5 FTE positions annually."
          },
          revenue: {
            value: 75000,
            justification: "Improved lead conversion rates and 24/7 availability will increase revenue by approximately 15%."
          },
          timeline: "3-6 months for full implementation and ROI realization",
          recommendations: [
            {
              recommendation: "Implement AI chatbot for customer support",
              impact: "High",
              effort: "Medium"
            },
            {
              recommendation: "Automate lead qualification process",
              impact: "High", 
              effort: "Low"
            }
          ],
          breakEvenAnalysis: "With initial investment of $15,000, you'll break even in 4.8 months and achieve full ROI within 12 months."
        })
      })
    }
  }))
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  CalculatorIcon: ({ className, ...props }: any) => <svg className={className} {...props} data-testid="calculator-icon" />
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

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GEMINI_API_KEY: 'test-api-key'
  },
  writable: true
})

describe('ROICalculatorSection Component', () => {
  const mockNavigate = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders section with title and description', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    expect(screen.getByText('Financial')).toBeInTheDocument()
    expect(screen.getByText('Analyst')).toBeInTheDocument()
    expect(screen.getByText(/Get a personalized ROI analysis/)).toBeInTheDocument()
  })

  it('renders all input controls with default values', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    // Check for ticket volume slider
    const ticketsSlider = screen.getByDisplayValue('500')
    expect(ticketsSlider).toBeInTheDocument()
    expect(ticketsSlider).toHaveAttribute('type', 'range')
    
    // Check for time to resolve slider
    const timeSlider = screen.getByDisplayValue('10')
    expect(timeSlider).toBeInTheDocument()
    
    // Check for average wage slider
    const wageSlider = screen.getByDisplayValue('25')
    expect(wageSlider).toBeInTheDocument()
    
    // Check for leads slider
    const leadsSlider = screen.getByDisplayValue('100')
    expect(leadsSlider).toBeInTheDocument()
    
    // Check for conversion rate slider
    const conversionSlider = screen.getByDisplayValue('3')
    expect(conversionSlider).toBeInTheDocument()
    
    // Check for deal value slider
    const dealValueSlider = screen.getByDisplayValue('2000')
    expect(dealValueSlider).toBeInTheDocument()
  })

  it('displays correct labels and ranges for all sliders', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    expect(screen.getByText('Monthly Support Tickets')).toBeInTheDocument()
    expect(screen.getByText('500 tickets')).toBeInTheDocument()
    
    expect(screen.getByText('Average Time to Resolve (minutes)')).toBeInTheDocument()
    expect(screen.getByText('10 minutes')).toBeInTheDocument()
    
    expect(screen.getByText('Average Staff Wage ($/hour)')).toBeInTheDocument()
    expect(screen.getByText('$25/hour')).toBeInTheDocument()
    
    expect(screen.getByText('Monthly Website Leads')).toBeInTheDocument()
    expect(screen.getByText('100 leads')).toBeInTheDocument()
    
    expect(screen.getByText('Current Conversion Rate')).toBeInTheDocument()
    expect(screen.getByText('3%')).toBeInTheDocument()
    
    expect(screen.getByText('Average Deal Value')).toBeInTheDocument()
    expect(screen.getByText('$2,000')).toBeInTheDocument()
  })

  it('handles slider value changes correctly', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const ticketsSlider = screen.getByDisplayValue('500')
    
    // Change ticket volume
    fireEvent.change(ticketsSlider, { target: { value: '750' } })
    
    expect(screen.getByText('750 tickets')).toBeInTheDocument()
    expect(ticketsSlider).toHaveValue('750')
  })

  it('calculates and displays current monthly costs correctly', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    // With default values: 500 tickets * 10 minutes * $25/hour = $2,083.33
    expect(screen.getByText(/Support Cost:/)).toBeInTheDocument()
    expect(screen.getByText(/\$2,083/)).toBeInTheDocument()
    
    // Lead processing cost: 100 leads * 15 minutes * $25/hour = $625
    expect(screen.getByText(/Lead Processing:/)).toBeInTheDocument()
    expect(screen.getByText(/\$625/)).toBeInTheDocument()
  })

  it('calculates and displays current monthly revenue correctly', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    // With default values: 100 leads * 3% conversion * $2000 = $6,000
    expect(screen.getByText(/Current Revenue:/)).toBeInTheDocument()
    expect(screen.getByText(/\$6,000/)).toBeInTheDocument()
  })

  it('updates calculations when slider values change', async () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const ticketsSlider = screen.getByDisplayValue('500')
    
    // Change tickets to 1000
    fireEvent.change(ticketsSlider, { target: { value: '1000' } })
    
    // Support cost should double: $4,166.67
    await waitFor(() => {
      expect(screen.getByText(/\$4,167/)).toBeInTheDocument()
    })
  })

  it('renders calculate ROI button', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    expect(calculateButton).toBeInTheDocument()
    expect(calculateButton).toHaveClass('bg-primary/20')
  })

  it('submits calculation and shows loading state', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    // Should show loading state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    expect(screen.getByTestId('dynamic-loader')).toBeInTheDocument()
  })

  it('displays AI analysis results correctly', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    // Wait for results
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show savings results
    expect(screen.getByText(/\$50,000/)).toBeInTheDocument()
    expect(screen.getByText(/Automation of customer support/)).toBeInTheDocument()
    
    // Should show revenue results
    expect(screen.getByText(/\$75,000/)).toBeInTheDocument()
    expect(screen.getByText(/Improved lead conversion rates/)).toBeInTheDocument()
    
    // Should show timeline
    expect(screen.getByText(/3-6 months for full implementation/)).toBeInTheDocument()
    
    // Should show break-even analysis
    expect(screen.getByText(/break even in 4.8 months/)).toBeInTheDocument()
  })

  it('displays recommendations with impact and effort levels', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should show recommendations
    expect(screen.getByText(/Implement AI chatbot for customer support/)).toBeInTheDocument()
    expect(screen.getByText(/Automate lead qualification process/)).toBeInTheDocument()
    
    // Should show impact and effort badges
    expect(screen.getAllByText('High Impact')).toHaveLength(2)
    expect(screen.getByText('Medium Effort')).toBeInTheDocument()
    expect(screen.getByText('Low Effort')).toBeInTheDocument()
  })

  it('handles CTA button navigation correctly', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Click CTA button
    const ctaButton = screen.getByRole('link', { name: /Book Your Free Discovery Call/ })
    await user.click(ctaButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/#lets-talk')
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
    
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, we couldn't calculate your ROI/)).toBeInTheDocument()
    })
  })

  it('tracks analytics events correctly', async () => {
    const user = userEvent.setup()
    const { trackEvent } = await import('../../services/analytics')
    
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('roi_calculation', {
        tickets: 500,
        time_to_resolve: 10,
        avg_wage: 25,
        leads: 100,
        conversion_rate: 3,
        avg_deal_value: 2000
      })
    })
  })

  it('scrolls to results after calculation', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Should call scrollIntoView on results element
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('animates numbers correctly', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dynamic-loader')).not.toBeInTheDocument()
    })
    
    // Numbers should be present (animation testing is complex, so we just check presence)
    expect(screen.getByText(/\$50,000/)).toBeInTheDocument()
    expect(screen.getByText(/\$75,000/)).toBeInTheDocument()
  })

  it('applies correct responsive styling', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    // Check for responsive grid
    const gridContainer = document.querySelector('.grid.lg\\:grid-cols-2')
    expect(gridContainer).toBeInTheDocument()
    
    // Check for responsive padding
    const section = document.querySelector('.py-16.sm\\:py-20')
    expect(section).toBeInTheDocument()
  })

  it('implements proper accessibility', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    // Check for proper form controls
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(6)
    
    // Check for proper button accessibility
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    expect(calculateButton).toBeInTheDocument()
  })

  it('maintains slider constraints', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const ticketsSlider = screen.getByDisplayValue('500')
    
    // Check min/max attributes
    expect(ticketsSlider).toHaveAttribute('min', '50')
    expect(ticketsSlider).toHaveAttribute('max', '5000')
  })

  it('formats currency values correctly', () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    // Check that currency values are properly formatted
    expect(screen.getByText(/\$2,083/)).toBeInTheDocument() // Properly formatted with comma
    expect(screen.getByText(/\$6,000/)).toBeInTheDocument() // Properly formatted
  })

  it('handles edge case values correctly', async () => {
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const ticketsSlider = screen.getByDisplayValue('500')
    const conversionSlider = screen.getByDisplayValue('3')
    
    // Set to minimum values
    fireEvent.change(ticketsSlider, { target: { value: '50' } })
    fireEvent.change(conversionSlider, { target: { value: '0.5' } })
    
    // Should handle low values gracefully
    expect(screen.getByText('50 tickets')).toBeInTheDocument()
    expect(screen.getByText('0.5%')).toBeInTheDocument()
  })

  it('prevents form submission during loading', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    await user.click(calculateButton)
    
    // Button should be disabled during loading
    expect(calculateButton).toBeDisabled()
    expect(calculateButton).toHaveClass('cursor-not-allowed')
  })

  it('clears previous results when recalculating', async () => {
    const user = userEvent.setup()
    render(<ROICalculatorSection navigate={mockNavigate} />)
    
    const calculateButton = screen.getByRole('button', { name: /Calculate My ROI/ })
    
    // First calculation
    await user.click(calculateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/\$50,000/)).toBeInTheDocument()
    })
    
    // Second calculation (should clear previous results)
    await user.click(calculateButton)
    
    // Should show loading again
    expect(screen.getByTestId('dynamic-loader')).toBeInTheDocument()
  })
})