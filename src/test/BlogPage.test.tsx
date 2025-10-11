import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogPage from '../../components/BlogPage'
import type { BlogPost } from '../../services/supabase'

// Mock external dependencies
vi.mock('../../constants', () => ({
  RESOURCE_CATEGORIES: ['Featured', 'Latest', 'AI Strategy', 'Automation', 'Case Studies', 'Business Growth']
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  ArrowRightIcon: ({ className, ...props }: any) => 
    <svg className={className} {...props} data-testid="arrow-right-icon" />,
  SearchIcon: ({ className, ...props }: any) => 
    <svg className={className} {...props} data-testid="search-icon" />
}))

// Mock StyledText component
vi.mock('../../components/StyledText', () => ({
  default: ({ text }: { text: string }) => {
    // Process the markdown formatting to match actual component behavior
    const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>');
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  }
}))

describe('BlogPage Component', () => {
  const mockNavigate = vi.fn()
  
  const mockBlogPosts: BlogPost[] = [
    {
      id: 1,
      slug: 'ai-strategy-guide-2024',
      title: 'Complete AI Strategy Guide for 2024',
      description: 'A comprehensive guide to developing an AI strategy for your business in 2024.',
      category: 'AI Strategy',
      image: 'https://example.com/ai-strategy.jpg',
      content: '# AI Strategy Guide\n\nThis is the complete guide...',
      keywords: 'AI, strategy, business, 2024',
      created_at: '2024-01-15T10:00:00Z',
      externalLinks: [
        { platform: 'Medium', url: 'https://medium.com/article', text: 'Read on Medium' }
      ]
    },
    {
      id: 2,
      slug: 'automation-workflow-optimization',
      title: 'Optimizing Business Workflows with Automation',
      description: 'Learn how to streamline your business processes using automation tools.',
      category: 'Automation',
      image: 'https://example.com/automation.jpg',
      content: '# Automation Workflows\n\nAutomation can transform...',
      keywords: 'automation, workflow, optimization, business',
      created_at: '2024-01-10T09:00:00Z',
      externalLinks: []
    },
    {
      id: 3,
      slug: 'successful-ai-implementation-case-study',
      title: 'Successful AI Implementation Case Study',
      description: 'A real-world case study of successful AI implementation in a Fortune 500 company.',
      category: 'Case Studies',
      image: 'https://example.com/case-study.jpg',
      content: '# Case Study\n\nThis company implemented AI...',
      keywords: 'AI, case study, implementation, success',
      created_at: '2024-01-05T08:00:00Z',
      externalLinks: []
    },
    {
      id: 4,
      slug: 'business-growth-ai-tools',
      title: 'Top AI Tools for Business Growth in 2024',
      description: 'Discover the best AI tools that can accelerate your business growth.',
      category: 'Business Growth',
      image: 'https://example.com/growth-tools.jpg',
      content: '# Business Growth Tools\n\nThese AI tools can help...',
      keywords: 'AI tools, business growth, productivity, 2024',
      created_at: '2024-01-20T11:00:00Z',
      externalLinks: []
    },
    {
      id: 5,
      slug: 'older-ai-strategy-post',
      title: 'Older AI Strategy Post',
      description: 'An older post about AI strategy from last year.',
      category: 'AI Strategy',
      image: 'https://example.com/old-strategy.jpg',
      content: '# Old Strategy\n\nThis is an older post...',
      keywords: 'AI, strategy, old',
      created_at: '2023-12-01T07:00:00Z',
      externalLinks: []
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders blog page with title and description', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // The title is rendered through StyledText component, so check for the actual content
    expect(screen.getByText('Synaptix Studio')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText(/Your central hub for AI strategy/)).toBeInTheDocument()
  })

  it('renders back to home button and handles navigation', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const backButton = screen.getByRole('button', { name: /back to home/i })
    expect(backButton).toBeInTheDocument()
    
    await user.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders search input with proper placeholder and icon', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const searchInput = screen.getByPlaceholderText(/search articles by title, category, or keyword/i)
    expect(searchInput).toBeInTheDocument()
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('renders category filter buttons', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const categoryButtons = [
      'Featured', 'Latest', 'AI Strategy', 'Automation', 'Case Studies', 'Business Growth'
    ]
    
    categoryButtons.forEach(category => {
      expect(screen.getByRole('button', { name: category })).toBeInTheDocument()
    })
    
    // Featured should be active by default
    const featuredButton = screen.getByRole('button', { name: 'Featured' })
    expect(featuredButton).toHaveClass('bg-primary/10')
  })

  it('filters articles by category correctly', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Click on AI Strategy category
    const aiStrategyButton = screen.getByRole('button', { name: 'AI Strategy' })
    await user.click(aiStrategyButton)
    
    // Should show AI Strategy posts
    expect(screen.getByText('Complete AI Strategy Guide for 2024')).toBeInTheDocument()
    expect(screen.getByText('Older AI Strategy Post')).toBeInTheDocument()
    
    // Should not show other category posts
    expect(screen.queryByText('Optimizing Business Workflows with Automation')).not.toBeInTheDocument()
  })

  it('filters articles by search query correctly', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const searchInput = screen.getByPlaceholderText(/search articles by title, category, or keyword/i)
    
    // Search by title
    await user.type(searchInput, 'automation')
    
    await waitFor(() => {
      expect(screen.getByText('Optimizing Business Workflows with Automation')).toBeInTheDocument()
      expect(screen.queryByText('Complete AI Strategy Guide for 2024')).not.toBeInTheDocument()
    })
  })

  it('searches by keywords correctly', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const searchInput = screen.getByPlaceholderText(/search articles by title, category, or keyword/i)
    
    // Search by keyword
    await user.type(searchInput, '2024')
    
    await waitFor(() => {
      expect(screen.getByText('Complete AI Strategy Guide for 2024')).toBeInTheDocument()
      expect(screen.getByText('Top AI Tools for Business Growth in 2024')).toBeInTheDocument()
      expect(screen.queryByText('Successful AI Implementation Case Study')).not.toBeInTheDocument()
    })
  })

  it('combines category filter with search query', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // First filter by AI Strategy category
    const aiStrategyButton = screen.getByRole('button', { name: 'AI Strategy' })
    await user.click(aiStrategyButton)
    
    // Then search within that category
    const searchInput = screen.getByPlaceholderText(/search articles by title, category, or keyword/i)
    await user.type(searchInput, '2024')
    
    await waitFor(() => {
      expect(screen.getByText('Complete AI Strategy Guide for 2024')).toBeInTheDocument()
      expect(screen.queryByText('Older AI Strategy Post')).not.toBeInTheDocument()
      expect(screen.queryByText('Top AI Tools for Business Growth in 2024')).not.toBeInTheDocument()
    })
  })

  it('displays no results message when search returns empty', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const searchInput = screen.getByPlaceholderText(/search articles by title, category, or keyword/i)
    await user.type(searchInput, 'nonexistent-keyword')
    
    await waitFor(() => {
      expect(screen.getByText(/No articles found for "nonexistent-keyword"/)).toBeInTheDocument()
      expect(screen.getByText(/Try a different search term or clear the search/)).toBeInTheDocument()
    })
  })

  it('displays no results message for empty category', async () => {
    const user = userEvent.setup()
    // Render with posts that don't have certain categories
    const limitedPosts = mockBlogPosts.filter(post => post.category !== 'Business Growth')
    render(<BlogPage blogPosts={limitedPosts} navigate={mockNavigate} />)
    
    const businessGrowthButton = screen.getByRole('button', { name: 'Business Growth' })
    await user.click(businessGrowthButton)
    
    await waitFor(() => {
      expect(screen.getByText(/No articles found in this category/)).toBeInTheDocument()
      expect(screen.getByText(/Try selecting another category to explore more content/)).toBeInTheDocument()
    })
  })

  it('renders featured articles with correct layout and styling', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Featured category should be active by default
    const featuredArticles = screen.getAllByText('Featured Article')
    expect(featuredArticles.length).toBeGreaterThan(0)
    
    // Check that articles have proper structure
    expect(screen.getByText('Top AI Tools for Business Growth in 2024')).toBeInTheDocument()
    expect(screen.getByText('Complete AI Strategy Guide for 2024')).toBeInTheDocument()
  })

  it('renders regular blog cards for non-featured categories', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Switch to Latest category
    const latestButton = screen.getByRole('button', { name: 'Latest' })
    await user.click(latestButton)
    
    // Should not show "Featured Article" labels
    expect(screen.queryByText('Featured Article')).not.toBeInTheDocument()
    
    // Should show all articles
    expect(screen.getByText('Top AI Tools for Business Growth in 2024')).toBeInTheDocument()
    expect(screen.getByText('Complete AI Strategy Guide for 2024')).toBeInTheDocument()
  })

  it('handles article navigation correctly', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Find and click an article card (they use role="button")
    const articleCard = document.querySelector('[role="button"][href*="ai-strategy-guide-2024"]')
    expect(articleCard).toBeInTheDocument()
    
    await user.click(articleCard!)
    expect(mockNavigate).toHaveBeenCalledWith('/blog/ai-strategy-guide-2024')
  })

  it('prevents default link behavior and uses navigate function', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const articleCard = document.querySelector('[role="button"][href*="ai-strategy-guide-2024"]')
    expect(articleCard).toBeInTheDocument()
    
    // Simulate click event
    fireEvent.click(articleCard!)
    
    expect(mockNavigate).toHaveBeenCalledWith('/blog/ai-strategy-guide-2024')
  })

  it('implements featured articles algorithm correctly', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Featured should show diverse categories with newest first
    // Should prioritize category diversity and recent posts
    const featuredCards = document.querySelectorAll('[role="button"]')
    
    // Verify featured articles are displayed
    expect(featuredCards.length).toBeGreaterThan(0)
    expect(featuredCards.length).toBeLessThanOrEqual(4) // MAX_FEATURED = 4
  })

  it('handles empty blog posts array gracefully', () => {
    render(<BlogPage blogPosts={[]} navigate={mockNavigate} />)
    
    expect(screen.getByText(/No articles found in this category/)).toBeInTheDocument()
  })

  it('displays correct image alt text and loading attributes', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const images = screen.getAllByRole('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).toHaveAttribute('decoding', 'async')
      expect(img).toHaveAttribute('alt')
    })
  })

  it('applies correct CSS classes for responsive design', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Check for responsive grid classes
    const gridElements = document.querySelectorAll('[class*="grid-cols"], [class*="md:"], [class*="sm:"]')
    
    // Verify responsive classes are present in the DOM
    expect(gridElements.length).toBeGreaterThan(0)
  })

  it('clears search results when search input is cleared', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    const searchInput = screen.getByPlaceholderText(/search articles by title, category, or keyword/i)
    
    // First search for something
    await user.type(searchInput, 'automation')
    await waitFor(() => {
      expect(screen.getByText('Optimizing Business Workflows with Automation')).toBeInTheDocument()
    })
    
    // Clear the search
    await user.clear(searchInput)
    
    await waitFor(() => {
      // Should show featured articles again (default state)
      expect(screen.getAllByText('Featured Article').length).toBeGreaterThan(0)
    })
  })

  it('maintains accessibility with proper ARIA attributes', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Check for proper button roles
    const categoryButtons = screen.getAllByRole('button')
    expect(categoryButtons.length).toBeGreaterThan(0)
    
    // Check for proper link roles (article cards use role="button")
    const articleCards = document.querySelectorAll('[role="button"]')
    expect(articleCards.length).toBeGreaterThan(0)
  })

  it('handles category switching correctly and updates active state', async () => {
    const user = userEvent.setup()
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Initially Featured should be active
    const featuredButton = screen.getByRole('button', { name: 'Featured' })
    expect(featuredButton).toHaveClass('bg-primary/10')
    
    // Click on Automation category
    const automationButton = screen.getByRole('button', { name: 'Automation' })
    await user.click(automationButton)
    
    // Automation should now be active, Featured should not
    expect(automationButton).toHaveClass('bg-primary/10')
    expect(featuredButton).not.toHaveClass('bg-primary/10')
  })

  it('renders articles with correct category badges', () => {
    render(<BlogPage blogPosts={mockBlogPosts} navigate={mockNavigate} />)
    
    // Check that category badges are displayed
    mockBlogPosts.forEach(post => {
      if (post.category) {
        const categoryElements = screen.getAllByText(post.category)
        expect(categoryElements.length).toBeGreaterThan(0)
      }
    })
  })
})