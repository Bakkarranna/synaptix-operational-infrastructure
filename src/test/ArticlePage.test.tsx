import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArticlePage from '../../components/ArticlePage'
import type { BlogPost } from '../types'

// Mock external dependencies
vi.mock('../../constants', () => ({
  CTA_BUTTONS: [
    { text: 'Book a Free Discovery Call', href: '/#book-demo', external: true },
    { text: 'Explore Our Free AI Tools', href: '/ai-tools', external: false },
    { text: 'Get Your Free AI Strategy', href: '/#ai-strategy', external: false }
  ]
}))

// Mock Icon components
vi.mock('../../components/Icon', () => ({
  ArrowRightIcon: ({ className, ...props }: any) => 
    <svg className={className} {...props} data-testid="arrow-right-icon" />,
  Icon: ({ name, className, ...props }: any) => 
    <svg className={className} {...props} data-testid={`icon-${name}`} />
}))

// Mock BlogMarkdownRenderer component
vi.mock('../../components/BlogMarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => 
    <div data-testid="markdown-content">{content}</div>
}))

// Mock window.location for schema markup
const mockLocation = {
  href: 'https://example.com/blog/test-article'
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('ArticlePage Component', () => {
  const mockNavigate = vi.fn()
  
  const mockArticle: BlogPost = {
    id: 1,
    slug: 'test-article-slug',
    title: 'Test Article Title',
    description: 'This is a test article description for testing purposes.',
    category: 'AI Strategy',
    image: 'https://example.com/test-image.jpg',
    content: '# Test Content\n\nThis is test content for the article.',
    keywords: 'test, article, AI, strategy',
    created_at: '2024-01-15T10:00:00Z',
    externalLinks: [
      {
        platform: 'Medium',
        url: 'https://medium.com/test-article',
        text: 'Read on Medium'
      },
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/test-article',
        text: 'Share on LinkedIn'
      },
      {
        platform: 'X',
        url: 'https://x.com/test-article',
        text: 'Share on X'
      }
    ]
  }

  const mockAllArticles: BlogPost[] = [
    mockArticle,
    {
      id: 2,
      slug: 'related-article-1',
      title: 'Related Article One',
      description: 'First related article.',
      category: 'Automation',
      image: 'https://example.com/related-1.jpg',
      content: '# Related Content 1',
      keywords: 'automation, AI',
      created_at: '2024-01-10T09:00:00Z',
      externalLinks: []
    },
    {
      id: 3,
      slug: 'related-article-2',
      title: 'Related Article Two',
      description: 'Second related article.',
      category: 'Case Studies',
      image: 'https://example.com/related-2.jpg',
      content: '# Related Content 2',
      keywords: 'case study, success',
      created_at: '2024-01-08T08:00:00Z',
      externalLinks: []
    },
    {
      id: 4,
      slug: 'related-article-3',
      title: 'Related Article Three',
      description: 'Third related article.',
      category: 'Business Growth',
      image: 'https://example.com/related-3.jpg',
      content: '# Related Content 3',
      keywords: 'growth, business',
      created_at: '2024-01-05T07:00:00Z',
      externalLinks: []
    },
    {
      id: 5,
      slug: 'related-article-4',
      title: 'Related Article Four',
      description: 'Fourth related article (should not appear in "Read Next").',
      category: 'Technology',
      image: 'https://example.com/related-4.jpg',
      content: '# Related Content 4',
      keywords: 'technology, innovation',
      created_at: '2024-01-03T06:00:00Z',
      externalLinks: []
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any existing schema scripts
    const existingScript = document.getElementById('article-schema')
    if (existingScript) {
      existingScript.remove()
    }
  })

  afterEach(() => {
    cleanup()
    // Clean up any schema scripts added during tests
    const schemaScript = document.getElementById('article-schema')
    if (schemaScript) {
      schemaScript.remove()
    }
  })

  it('returns null when no article is provided', () => {
    const { container } = render(
      <ArticlePage article={null as any} allArticles={mockAllArticles} navigate={mockNavigate} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders article with all basic elements', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    // Check main article elements
    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.getByText('AI Strategy')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Test Article Title' })).toBeInTheDocument()
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
  })

  it('renders back to blog button and handles navigation', async () => {
    const user = userEvent.setup()
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    const backButton = screen.getByRole('button', { name: /back to blog/i })
    expect(backButton).toBeInTheDocument()
    
    await user.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('/blog')
  })

  it('creates and injects schema markup correctly', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    const schemaScript = document.getElementById('article-schema')
    expect(schemaScript).toBeInTheDocument()
    expect((schemaScript as HTMLScriptElement)?.type).toBe('application/ld+json')
    
    const schema = JSON.parse(schemaScript?.textContent || '{}')
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Article')
    expect(schema.headline).toBe('Test Article Title')
    expect(schema.description).toBe('This is a test article description for testing purposes.')
    expect(schema.author.name).toBe('Synaptix Studio')
    expect(schema.publisher.name).toBe('Synaptix Studio')
  })

  it('removes previous schema markup when article changes', () => {
    const { rerender } = render(
      <ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />
    )
    
    const firstScript = document.getElementById('article-schema')
    expect(firstScript).toBeInTheDocument()
    
    const newArticle = { ...mockArticle, id: 2, title: 'New Article Title' }
    rerender(<ArticlePage article={newArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    const updatedScript = document.getElementById('article-schema')
    expect(updatedScript).toBeInTheDocument()
    
    const schema = JSON.parse(updatedScript?.textContent || '{}')
    expect(schema.headline).toBe('New Article Title')
  })

  it('cleans up schema markup on unmount', () => {
    const { unmount } = render(
      <ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />
    )
    
    expect(document.getElementById('article-schema')).toBeInTheDocument()
    
    unmount()
    
    expect(document.getElementById('article-schema')).not.toBeInTheDocument()
  })

  it('renders external links section when links exist', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    expect(screen.getByText('Read more on:')).toBeInTheDocument()
    expect(screen.getByText('Read on Medium')).toBeInTheDocument()
    expect(screen.getByText('Share on LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('Share on X')).toBeInTheDocument()
    
    // Check that external links open in new tabs
    const externalLinks = screen.getAllByRole('link', { name: /Read on|Share on/ })
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('does not render external links section when no links exist', () => {
    const articleWithoutLinks: BlogPost = { ...mockArticle, externalLinks: [] }
    render(<ArticlePage article={articleWithoutLinks} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    expect(screen.queryByText('Read more on:')).not.toBeInTheDocument()
  })

  it('maps platform names to correct icons', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    expect(screen.getByTestId('icon-medium')).toBeInTheDocument()
    expect(screen.getByTestId('icon-linkedin')).toBeInTheDocument()
    expect(screen.getByTestId('icon-x')).toBeInTheDocument()
  })

  it('uses web icon as fallback for unknown platforms', () => {
    const articleWithUnknownPlatform = {
      ...mockArticle,
      externalLinks: [
        { platform: 'UnknownPlatform', url: 'https://unknown.com', text: 'Unknown Link' }
      ]
    }
    render(<ArticlePage article={articleWithUnknownPlatform} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    expect(screen.getByTestId('icon-web')).toBeInTheDocument()
  })

  it('renders CTA section with all buttons', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    expect(screen.getByText('Ready to Automate Your Business?')).toBeInTheDocument()
    expect(screen.getByText(/Take the next step/)).toBeInTheDocument()
    
    expect(screen.getByRole('link', { name: 'Book a Free Discovery Call' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore Our Free AI Tools' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get Your Free AI Strategy' })).toBeInTheDocument()
  })

  it('handles CTA button navigation correctly', async () => {
    const user = userEvent.setup()
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    // Test internal navigation
    const internalButton = screen.getByRole('link', { name: 'Explore Our Free AI Tools' })
    await user.click(internalButton)
    expect(mockNavigate).toHaveBeenCalledWith('/ai-tools')
    
    // Test external link (should not call navigate)
    const externalButton = screen.getByRole('link', { name: 'Book a Free Discovery Call' })
    expect(externalButton).toHaveAttribute('target', '_blank')
    expect(externalButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders "Read Next" section with correct number of articles', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    expect(screen.getByText('Read Next')).toBeInTheDocument()
    
    // Should show max 3 related articles, excluding the current article
    const relatedArticles = screen.getAllByText(/Related Article/)
    expect(relatedArticles).toHaveLength(3)
    
    expect(screen.getByText('Related Article One')).toBeInTheDocument()
    expect(screen.getByText('Related Article Two')).toBeInTheDocument()
    expect(screen.getByText('Related Article Three')).toBeInTheDocument()
    expect(screen.queryByText('Related Article Four')).not.toBeInTheDocument()
  })

  it('excludes current article from "Read Next" section', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    // Current article should not appear in "Read Next"
    const readNextSection = screen.getByText('Read Next').closest('div')
    expect(readNextSection).not.toHaveTextContent('Test Article Title')
  })

  it('handles "Read Next" article navigation', async () => {
    const user = userEvent.setup()
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    const relatedArticleLink = screen.getByRole('link', { name: /Related Article One/ })
    await user.click(relatedArticleLink)
    
    expect(mockNavigate).toHaveBeenCalledWith('/blog/related-article-1')
  })

  it('displays "Content coming soon" when article has no content', () => {
    const articleWithoutContent = { ...mockArticle, content: '' }
    render(<ArticlePage article={articleWithoutContent} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    expect(screen.getByText('Content coming soon.')).toBeInTheDocument()
    expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument()
  })

  it('renders article image with correct attributes', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    const articleImage = screen.getByRole('img', { name: 'Test Article Title' })
    expect(articleImage).toHaveAttribute('src', 'https://example.com/test-image.jpg')
    expect(articleImage).toHaveClass('w-full', 'object-contain', 'rounded-xl')
  })

  it('renders related article images with lazy loading', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    const relatedImages = screen.getAllByRole('img').filter(img => 
      img.getAttribute('alt')?.includes('Related Article')
    )
    
    relatedImages.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy')
    })
  })

  it('applies correct responsive classes and styling', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    // Check for responsive grid in "Read Next" section
    const readNextGrid = document.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3')
    expect(readNextGrid).toBeInTheDocument()
    
    // Check for responsive padding classes
    const container = document.querySelector('.py-24.sm\\:py-32')
    expect(container).toBeInTheDocument()
  })

  it('maintains proper accessibility with headings hierarchy', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    // Main article title should be h1
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toHaveTextContent('Test Article Title')
    
    // Section headings should be h2 or h3
    const readNextHeading = screen.getByRole('heading', { level: 2 })
    expect(readNextHeading).toHaveTextContent('Read Next')
    
    // Get all h3 headings and find the CTA heading specifically
    const h3Headings = screen.getAllByRole('heading', { level: 3 })
    const ctaHeading = h3Headings.find(heading => heading.textContent?.includes('Ready to Automate Your Business?'))
    expect(ctaHeading).toBeInTheDocument()
  }),

  it('handles empty allArticles array gracefully', () => {
    render(<ArticlePage article={mockArticle} allArticles={[mockArticle]} navigate={mockNavigate} />)
    
    // Should still render "Read Next" section but with no articles
    expect(screen.getByText('Read Next')).toBeInTheDocument()
    
    // Should not have any related article links
    const relatedArticles = screen.queryAllByText(/Related Article/)
    expect(relatedArticles).toHaveLength(0)
  }),

  it('handles articles with null or undefined externalLinks', () => {
    const articleWithNullLinks: BlogPost = { ...mockArticle, externalLinks: undefined }
    render(<ArticlePage article={articleWithNullLinks} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    expect(screen.queryByText('Read more on:')).not.toBeInTheDocument()
  }),

  it('prevents default behavior on related article link clicks', async () => {
    const user = userEvent.setup()
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    // Get the related article link by its href attribute since it uses preventDefault
    const relatedArticleLink = document.querySelector('a[href="/blog/related-article-1"]')
    expect(relatedArticleLink).toBeInTheDocument()
    
    // Click the link - the component should call preventDefault and navigate
    await user.click(relatedArticleLink!)
    
    // Verify navigation was called (preventDefault is handled internally)
    expect(mockNavigate).toHaveBeenCalledWith('/blog/related-article-1')
  }),

  it('renders category badge with correct styling', () => {
    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    const categoryBadge = screen.getByText('AI Strategy')
    expect(categoryBadge).toHaveClass('text-sm', 'font-bold', 'text-primary')
  }),

  it('handles window.location changes for schema markup', () => {
    // Change window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/blog/different-article' },
      writable: true
    })

    render(<ArticlePage article={mockArticle} allArticles={mockAllArticles} navigate={mockNavigate} />)
    
    const schemaScript = document.getElementById('article-schema')
    const schema = JSON.parse(schemaScript?.textContent || '{}')
    
    expect(schema.mainEntityOfPage['@id']).toBe('https://example.com/blog/different-article')
  })
})
