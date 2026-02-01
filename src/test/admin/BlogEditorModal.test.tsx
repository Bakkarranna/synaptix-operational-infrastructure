import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import BlogEditorModal from '../../../components/admin/BlogEditorModal'
import type { BlogPost } from '../../types'

// Mock the Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockImplementation(({ config }) => {
        // Return different responses based on responseMimeType
        if (config?.responseMimeType === 'application/json') {
          return Promise.resolve({
            text: JSON.stringify({
              readabilityScore: 85,
              seoScore: 78,
              keywordDensity: "1.2%",
              blueprintCompliance: [
                { item: "Contains 1+ Table", compliant: true },
                { item: "Has 5 FAQs", compliant: true }
              ],
              actionableFeedback: ["Improve keyword density", "Add more internal links"]
            })
          })
        }
        
        // Default response for content generation
        return Promise.resolve({
          text: `---
title: "AI-Generated Test Article"
slug: "ai-generated-test-article"
metaDescription: "This is a test meta description for the AI-generated article."
keywords: "AI, test, article, automation"
---

# AI-Generated Test Article

This is the content of the AI-generated test article.`
        })
      })
    }
  }))
}))

// Mock the services
vi.mock('../../types', () => ({
  saveBlogPost: vi.fn().mockResolvedValue({ id: 1 })
}))

// Mock the constants
vi.mock('../../../constants', () => ({
  RESOURCE_CATEGORIES: ['AI Strategy', 'Process Optimization', 'Technology Stack'],
  LOADING_MESSAGES: {
    PUBLISHING_PIPELINE: ['Generating content...', 'Optimizing SEO...'],
    QA_CHECK: ['Analyzing content...', 'Checking compliance...'],
    HEADLINE_ANALYZER: ['Analyzing headline...', 'Scoring virality...'],
    CONTENT_IMPROVER: ['Improving content...', 'Applying feedback...'],
    KEYWORD_SUGGESTER: ['Generating keywords...', 'Analyzing search trends...'],
    KEYWORD_INSERTER: ['Inserting keywords...', 'Optimizing content...'],
    AUDIENCE_SUGGESTER: ['Analyzing audience...', 'Creating persona...']
  },
  CONTENT_WRITER_TYPES: ['Blog Post', 'Case Study', 'Guide'],
  CONTENT_WRITER_TONES: ['Professional', 'Conversational', 'Technical'],
  CONTENT_LENGTHS: ['Short', 'Medium', 'Long'],
  CALENDLY_LINK: 'https://calendly.com/test'
}))

const mockPost: BlogPost = {
  id: 1,
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  description: 'A test blog post description',
  content: `# Test Blog Post

This is test content for the blog post.

## Section 1

Some content here.

## FAQ Section

**Q:** What is this test about?
**A:** This is a test of the blog editor functionality.`,
  category: 'AI Strategy',
  image: 'https://example.com/image.png',
  keywords: 'test, blog, post',
  created_at: '2024-01-01T00:00:00Z',
  externalLinks: []
}

describe('BlogEditorModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    post: mockPost,
    onOpenLinkManager: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key'
  })

  it('renders when open with existing post', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    expect(screen.getByText('Edit Post')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Blog Post')).toBeInTheDocument()
  })

  it('renders for new post creation', () => {
    render(<BlogEditorModal {...mockProps} post={null} />)
    
    expect(screen.getByText('Create New Post')).toBeInTheDocument()
    expect(screen.getByText('AI Content Writer')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<BlogEditorModal {...mockProps} isOpen={false} />)
    
    expect(screen.queryByText('Edit Post')).not.toBeInTheDocument()
  })

  it('displays form fields correctly', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    expect(screen.getByDisplayValue('Test Blog Post')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test-blog-post')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A test blog post description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test, blog, post')).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const titleInput = screen.getByDisplayValue('Test Blog Post')
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } })
    
    expect(titleInput).toHaveValue('Updated Title')
  })

  it('switches between editor and preview modes', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const previewButton = screen.getByText('Preview')
    fireEvent.click(previewButton)
    
    expect(screen.getByText('# Test Blog Post')).toBeInTheDocument()
    
    const toolkitButton = screen.getByText('AI Toolkit')
    fireEvent.click(toolkitButton)
    
    expect(screen.getByText('AI QA Report')).toBeInTheDocument()
  })

  it('handles link embedding functionality', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const contentTextarea = screen.getByDisplayValue(/This is test content/)
    
    // Select some text
    fireEvent.select(contentTextarea, { target: { selectionStart: 0, selectionEnd: 4 } })
    
    // Mock window.prompt
    window.prompt = vi.fn().mockReturnValue('https://example.com')
    
    const embedButton = screen.getByText('Embed Link')
    fireEvent.click(embedButton)
    
    expect(window.prompt).toHaveBeenCalledWith('Enter the URL to link to:', 'https://')
  })

  it('handles AI content generation', async () => {
    render(<BlogEditorModal {...mockProps} post={null} />)
    
    // Fill in the topic
    const topicInput = screen.getByPlaceholderText(/Primary Topic/)
    fireEvent.change(topicInput, { target: { value: 'AI Automation Guide' } })
    
    const generateButton = screen.getByText('Generate Draft')
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Content Editor')).toBeInTheDocument()
    })
  })

  it('runs QA check functionality', async () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const qaButton = screen.getByText('Run QA Check')
    fireEvent.click(qaButton)
    
    expect(screen.getByText('Checking...')).toBeInTheDocument()
  })

  it('handles headline analysis', async () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const headlineButton = screen.getByText('Analyze Headline')
    fireEvent.click(headlineButton)
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('opens link manager', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const linkManagerButton = screen.getByText('Open Link Manager')
    fireEvent.click(linkManagerButton)
    
    expect(mockProps.onOpenLinkManager).toHaveBeenCalled()
  })

  it('handles keyword generation', async () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const keywordButton = screen.getByText('Generate Keywords')
    fireEvent.click(keywordButton)
    
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('handles audience suggestion', async () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const audienceButton = screen.getByText('Suggest Audience')
    fireEvent.click(audienceButton)
    
    expect(screen.getByText('Suggesting...')).toBeInTheDocument()
  })

  it('handles form validation on publish', async () => {
    render(<BlogEditorModal {...mockProps} />)
    
    // Clear the title
    const titleInput = screen.getByDisplayValue('Test Blog Post')
    fireEvent.change(titleInput, { target: { value: '' } })
    
    // Mock window.alert
    window.alert = vi.fn()
    
    const publishButton = screen.getByText('Publish')
    fireEvent.click(publishButton)
    
    expect(window.alert).toHaveBeenCalledWith('Title and Slug are required.')
  })

  it('successfully publishes post', async () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const publishButton = screen.getByText('Publish')
    fireEvent.click(publishButton)
    
    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalled()
    })
  })

  it('handles cancel action', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('switches to AI writer view', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const regenerateButton = screen.getByText('Regenerate with AI')
    fireEvent.click(regenerateButton)
    
    expect(screen.getByText('AI Content Writer')).toBeInTheDocument()
  })

  it('handles AI writer form fields', () => {
    render(<BlogEditorModal {...mockProps} post={null} />)
    
    const topicInput = screen.getByPlaceholderText(/Primary Topic/)
    const audienceInput = screen.getByPlaceholderText(/Target Audience/)
    const keywordsInput = screen.getByPlaceholderText(/keywords/)
    
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } })
    fireEvent.change(audienceInput, { target: { value: 'Test Audience' } })
    fireEvent.change(keywordsInput, { target: { value: 'test, keywords' } })
    
    expect(topicInput).toHaveValue('Test Topic')
    expect(audienceInput).toHaveValue('Test Audience')
    expect(keywordsInput).toHaveValue('test, keywords')
  })

  it('shows loading states correctly', () => {
    render(<BlogEditorModal {...mockProps} post={null} />)
    
    const topicInput = screen.getByPlaceholderText(/Primary Topic/)
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } })
    
    const generateButton = screen.getByText('Generate Draft')
    fireEvent.click(generateButton)
    
    // Should show loading state
    expect(screen.getByText('Generating content...')).toBeInTheDocument()
  })

  it('handles table editor integration', () => {
    render(<BlogEditorModal {...mockProps} />)
    
    const contentTextarea = screen.getByDisplayValue(/This is test content/)
    
    // Add table markdown to content
    const tableContent = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`
    
    fireEvent.change(contentTextarea, { 
      target: { value: mockPost.content + '\n\n' + tableContent } 
    })
    
    // Select the table content
    fireEvent.select(contentTextarea, { 
      target: { 
        selectionStart: mockPost.content.length + 2, 
        selectionEnd: mockPost.content.length + 2 + tableContent.length 
      } 
    })
    
    // Should show table edit button when table is selected
    expect(screen.getByText('Edit Table')).toBeInTheDocument()
  })
})
