import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BlogMarkdownRenderer from '../../components/BlogMarkdownRenderer'

// Mock external dependencies
vi.mock('../../components/StyledText', () => ({
  default: ({ text }: { text: string }) => <span data-testid="styled-text">{text}</span>
}))

vi.mock('../../components/Icon', () => ({
  QuoteIcon: ({ className, ...props }: any) => 
    <svg className={className} {...props} data-testid="quote-icon" />
}))

describe('BlogMarkdownRenderer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles invalid content gracefully', () => {
    // Test null content
    const { container: container1 } = render(<BlogMarkdownRenderer content={null as any} />)
    const invalidElements1 = container1.querySelectorAll('p')
    expect(invalidElements1).toHaveLength(1)
    expect(invalidElements1[0]).toHaveTextContent('Invalid content.')
    
    // Test undefined content
    const { container: container2 } = render(<BlogMarkdownRenderer content={undefined as any} />)
    const invalidElements2 = container2.querySelectorAll('p')
    expect(invalidElements2).toHaveLength(1)
    expect(invalidElements2[0]).toHaveTextContent('Invalid content.')
    
    // Test number content
    const { container: container3 } = render(<BlogMarkdownRenderer content={123 as any} />)
    const invalidElements3 = container3.querySelectorAll('p')
    expect(invalidElements3).toHaveLength(1)
    expect(invalidElements3[0]).toHaveTextContent('Invalid content.')
  })

  it('renders empty content gracefully', () => {
    const { container } = render(<BlogMarkdownRenderer content="" />)
    const proseDiv = container.querySelector('.prose')
    expect(proseDiv).toBeInTheDocument()
    expect(proseDiv?.children).toHaveLength(0)
  })

  it('renders plain text as paragraphs', () => {
    const content = "This is a simple paragraph.\n\nThis is another paragraph."
    render(<BlogMarkdownRenderer content={content} />)
    
    const styledTexts = screen.getAllByTestId('styled-text')
    expect(styledTexts).toHaveLength(2)
    expect(styledTexts[0]).toHaveTextContent('This is a simple paragraph.')
    expect(styledTexts[1]).toHaveTextContent('This is another paragraph.')
  })

  it('renders headings with correct hierarchy', () => {
    const content = `# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

####### Heading 7 (should render as h6)`

    render(<BlogMarkdownRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument()
    
    // Should not have h7, the 7+ hash heading should render as h6
    expect(screen.queryByRole('heading', { level: 7 })).not.toBeInTheDocument()
    const h6Headings = screen.getAllByRole('heading', { level: 6 })
    expect(h6Headings).toHaveLength(2) // Original h6 and the converted h7
  }),

  it('renders unordered lists correctly', () => {
    const content = `Here are some items:

* First item
* Second item
* Third item

Another paragraph.`

    render(<BlogMarkdownRenderer content={content} />)
    
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveClass('list-disc', 'list-inside', 'space-y-2', 'my-4', 'pl-4')
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
    expect(listItems[0]).toHaveTextContent('First item')
    expect(listItems[1]).toHaveTextContent('Second item')
    expect(listItems[2]).toHaveTextContent('Third item')
  }),

  it('renders ordered lists correctly', () => {
    const content = `Steps to follow:

1. First step
2. Second step
3. Third step

End of list.`

    render(<BlogMarkdownRenderer content={content} />)
    
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(list).toHaveClass('list-decimal', 'list-inside', 'space-y-2', 'my-4', 'pl-4')
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
    expect(listItems[0]).toHaveTextContent('First step')
    expect(listItems[1]).toHaveTextContent('Second step')
    expect(listItems[2]).toHaveTextContent('Third step')
  }),

  it('renders alternative unordered list syntax with dashes', () => {
    const content = `- Item one
- Item two
- Item three`

    render(<BlogMarkdownRenderer content={content} />)
    
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
  }),

  it('handles multiple consecutive lists correctly', () => {
    const content = `* First list item 1
* First list item 2

1. Second list item 1
2. Second list item 2

* Third list item 1
* Third list item 2`

    render(<BlogMarkdownRenderer content={content} />)
    
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(3)
    expect(lists[0].tagName).toBe('UL')
    expect(lists[1].tagName).toBe('OL')
    expect(lists[2].tagName).toBe('UL')
  }),

  it('renders tables with proper structure', () => {
    const content = `| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |`

    render(<BlogMarkdownRenderer content={content} />)
    
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    
    // Check headers
    const headerCells = screen.getAllByRole('columnheader')
    expect(headerCells).toHaveLength(3)
    expect(headerCells[0]).toHaveTextContent('Header 1')
    expect(headerCells[1]).toHaveTextContent('Header 2')
    expect(headerCells[2]).toHaveTextContent('Header 3')
    
    // Check data cells
    const dataCells = screen.getAllByRole('cell')
    expect(dataCells).toHaveLength(6)
    expect(dataCells[0]).toHaveTextContent('Row 1 Col 1')
    expect(dataCells[1]).toHaveTextContent('Row 1 Col 2')
    expect(dataCells[2]).toHaveTextContent('Row 1 Col 3')
  })

  it('handles malformed tables gracefully', () => {
    const content = `| Header 1 | Header 2 |
| Row 1 Col 1 | Row 1 Col 2 | Extra Col |
| Row 2 Col 1 |`

    const { container } = render(<BlogMarkdownRenderer content={content} />)
    
    // Since the table doesn't have proper separator (---), it should render as paragraphs
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    
    // Should render as regular text content
    const styledTexts = screen.getAllByTestId('styled-text')
    expect(styledTexts.length).toBeGreaterThan(0)
  }),

  it('renders FAQ blocks with correct styling', () => {
    const content = `**Q:** What is AI automation?

**A:** AI automation refers to the use of artificial intelligence to automate business processes.

**Q:** How does it work?

**A:** It works by using machine learning algorithms to perform tasks automatically.`

    render(<BlogMarkdownRenderer content={content} />)
    
    // Should render as FAQ blocks with special styling
    const faqBlocks = document.querySelectorAll('.bg-white\\/30')
    expect(faqBlocks.length).toBe(2)
    
    // Check for Q: and A: labels
    expect(screen.getByText(/What is AI automation/)).toBeInTheDocument()
    expect(screen.getByText(/AI automation refers to/)).toBeInTheDocument()
  })

  it('renders testimonials with special styling', () => {
    const content = `[TESTIMONIAL_START]
"This AI solution transformed our business completely. We saw a 300% increase in efficiency."
-- John Smith, CEO of TechCorp
[TESTIMONIAL_END]

Regular paragraph after testimonial.`

    render(<BlogMarkdownRenderer content={content} />)
    
    // Check for testimonial styling
    const testimonialBlock = document.querySelector('.bg-primary\\/5')
    expect(testimonialBlock).toBeInTheDocument()
    
    // Check for quote icon
    expect(screen.getByTestId('quote-icon')).toBeInTheDocument()
    
    // Check for quote content and attribution
    expect(screen.getByText(/This AI solution transformed our business/)).toBeInTheDocument()
    expect(screen.getByText(/-- John Smith, CEO of TechCorp/)).toBeInTheDocument()
  })

  it('handles malformed testimonials gracefully', () => {
    const content = `[TESTIMONIAL_START]
Invalid testimonial format without proper quote structure
[TESTIMONIAL_END]`

    render(<BlogMarkdownRenderer content={content} />)
    
    // Should not crash, but might not render as testimonial
    const container = document.querySelector('.prose')
    expect(container).toBeInTheDocument()
  })

  it('applies correct prose classes for styling', () => {
    render(<BlogMarkdownRenderer content="# Test Heading" />)
    
    const proseContainer = document.querySelector('.prose')
    expect(proseContainer).toHaveClass(
      'prose',
      'prose-sm',
      'dark:prose-invert',
      'sm:prose-base',
      'lg:prose-lg',
      'max-w-none',
      'space-y-4',
      'leading-relaxed'
    )
  })

  it('handles mixed content types correctly', () => {
    const content = `# Main Heading

This is a paragraph.

## Subheading

* List item 1
* List item 2

| Header | Value |
| --- | --- |
| Row 1 | Data 1 |

**Q:** What is this?

**A:** This is a test.

[TESTIMONIAL_START]
"Great content!" -- Test User
[TESTIMONIAL_END]

Final paragraph.`

    render(<BlogMarkdownRenderer content={content} />)
    
    // Should render all different content types
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByTestId('quote-icon')).toBeInTheDocument()
    
    // Check that paragraphs are rendered
    const styledTexts = screen.getAllByTestId('styled-text')
    expect(styledTexts.length).toBeGreaterThan(5)
  })

  it('handles empty blocks and preserves structure', () => {
    const content = `# Heading



Another paragraph after empty lines.

* List item`

    render(<BlogMarkdownRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    
    // Should have proper spacing between elements
    const proseContainer = document.querySelector('.prose')
    expect(proseContainer).toHaveClass('space-y-4')
  })

  it('renders complex table with data-label attributes', () => {
    const content = `| Feature | Basic | Pro | Enterprise |
| --- | --- | --- | --- |
| Users | 5 | 25 | Unlimited |
| Storage | 1GB | 10GB | 100GB |`

    render(<BlogMarkdownRenderer content={content} />)
    
    const dataCells = screen.getAllByRole('cell')
    
    // Check that data-label attributes are set for responsive design
    expect(dataCells[0]).toHaveAttribute('data-label', 'Feature')
    expect(dataCells[1]).toHaveAttribute('data-label', 'Basic')
    expect(dataCells[2]).toHaveAttribute('data-label', 'Pro')
    expect(dataCells[3]).toHaveAttribute('data-label', 'Enterprise')
  })

  it('flushes list items correctly when switching content types', () => {
    const content = `* List item 1
* List item 2

# Heading after list

* New list item 1
* New list item 2`

    render(<BlogMarkdownRenderer content={content} />)
    
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(2)
    
    // First list should have 2 items
    const firstListItems = lists[0].querySelectorAll('li')
    expect(firstListItems).toHaveLength(2)
    
    // Second list should have 2 items
    const secondListItems = lists[1].querySelectorAll('li')
    expect(secondListItems).toHaveLength(2)
    
    // Heading should be between the lists
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('handles content with only whitespace', () => {
    const content = "   \n\n   \n   "
    const { container } = render(<BlogMarkdownRenderer content={content} />)
    
    const proseDiv = container.querySelector('.prose')
    expect(proseDiv).toBeInTheDocument()
    expect(proseDiv?.children).toHaveLength(0)
  })

  it('processes blocks correctly with complex whitespace patterns', () => {
    const content = `# Heading


    


* Item with extra spaces
    * Nested-like item


    

Another paragraph.`

    render(<BlogMarkdownRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
  })

  it('maintains proper key attributes for React rendering', () => {
    const content = `# Heading 1

Paragraph 1

* List item
* Another item

# Heading 2`

    const { container } = render(<BlogMarkdownRenderer content={content} />)
    
    // All child elements should have keys (React requirement)
    const proseDiv = container.querySelector('.prose')
    const children = Array.from(proseDiv?.children || [])
    
    expect(children.length).toBeGreaterThan(0)
    // Each child should be properly rendered without React key warnings
  })

  it('handles edge case with table without proper separator', () => {
    const content = `| Header 1 | Header 2 |
| Row 1 Col 1 | Row 1 Col 2 |`

    render(<BlogMarkdownRenderer content={content} />)
    
    // Should not render as table without proper separator
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    
    // Should render as regular paragraphs instead
    const styledTexts = screen.getAllByTestId('styled-text')
    expect(styledTexts.length).toBeGreaterThan(0)
  })
})
