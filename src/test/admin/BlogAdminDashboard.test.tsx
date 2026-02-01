import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import BlogAdminDashboard from '../../../components/admin/BlogAdminDashboard'
import type { BlogPost } from '../../types'

// Mock the Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          suggestions: [
            {
              title: "Test Article Title",
              rationale: "High potential topic for SMBs",
              keywords: "AI, automation, business"
            }
          ]
        })
      })
    }
  }))
}))

// Mock the services
vi.mock('../../types', () => ({
  deleteBlogPost: vi.fn(),
  updatePostPerformanceData: vi.fn(),
  saveBlogPost: vi.fn()
}))

// Mock the constants
vi.mock('../../../constants', () => ({
  LOADING_MESSAGES: {
    PUBLISHING_PIPELINE: ['Generating content...', 'Optimizing SEO...'],
    CONTENT_STRATEGY: ['Analyzing existing content...', 'Finding opportunities...'],
    PERFORMANCE_ANALYSIS: ['Analyzing performance...', 'Generating insights...']
  },
  RESOURCE_CATEGORIES: ['AI Strategy', 'Process Optimization', 'Technology Stack'],
  CALENDLY_LINK: 'https://calendly.com/test',
  CONTENT_WRITER_TYPES: ['Blog Post', 'Case Study', 'Guide'],
  CONTENT_WRITER_TONES: ['Professional', 'Conversational', 'Technical']
}))

const mockPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    description: 'A test blog post',
    content: '# Test Content\n\nThis is test content.',
    category: 'AI Strategy',
    image: 'https://example.com/image.png',
    keywords: 'test, blog, post',
    created_at: '2024-01-01T00:00:00Z',
    externalLinks: []
  },
  {
    id: 2,
    title: 'Another Test Post',
    slug: 'another-test-post',
    description: 'Another test blog post',
    content: '# Another Test\n\nMore test content.',
    category: 'Process Optimization',
    image: 'https://example.com/image2.png',
    keywords: 'test, automation',
    created_at: '2024-01-02T00:00:00Z',
    externalLinks: []
  }
]

describe('BlogAdminDashboard', () => {
  const mockProps = {
    initialPosts: mockPosts,
    onRefreshPosts: vi.fn(),
    onLogout: vi.fn(),
    theme: 'light' as const,
    toggleTheme: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock environment variable
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key'
  })

  it('renders the dashboard with initial posts', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Blog Posts (2)')).toBeInTheDocument()
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument()
    expect(screen.getByText('Another Test Post')).toBeInTheDocument()
  })

  it('displays navigation tabs correctly', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    expect(screen.getByText('All Posts')).toBeInTheDocument()
    expect(screen.getByText('Create New Post')).toBeInTheDocument()
    expect(screen.getByText('AI Content Strategist')).toBeInTheDocument()
    expect(screen.getByText('Performance Optimizer')).toBeInTheDocument()
  })

  it('switches to pipeline view when Create New Post is clicked', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    fireEvent.click(screen.getByText('Create New Post'))
    
    expect(screen.getByText('AI Publishing Pipeline')).toBeInTheDocument()
  })

  it('switches to strategist view', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    fireEvent.click(screen.getByText('AI Content Strategist'))
    
    expect(screen.getByText('AI Content Strategist')).toBeInTheDocument()
    expect(screen.getByText('Generate New Strategy')).toBeInTheDocument()
  })

  it('switches to optimizer view', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    fireEvent.click(screen.getByText('Performance Optimizer'))
    
    expect(screen.getByText('Performance Optimizer')).toBeInTheDocument()
  })

  it('handles theme toggle', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    const themeButton = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(themeButton)
    
    expect(mockProps.toggleTheme).toHaveBeenCalled()
  })

  it('handles logout', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    fireEvent.click(screen.getByText('Logout'))
    
    expect(mockProps.onLogout).toHaveBeenCalled()
  })

  it('displays post actions (View, Edit, Copy, Delete)', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    // Check for action buttons in the table
    expect(screen.getAllByText('View')).toHaveLength(2)
    expect(screen.getAllByText('Edit')).toHaveLength(2)
    expect(screen.getAllByText('Copy')).toHaveLength(2)
    expect(screen.getAllByText('Delete')).toHaveLength(2)
  })

  it('opens preview modal when View is clicked', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    const viewButtons = screen.getAllByText('View')
    fireEvent.click(viewButtons[0])
    
    // Modal should open with post content
    expect(screen.getByText('# Test Content')).toBeInTheDocument()
  })

  it('generates content strategy suggestions', async () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    fireEvent.click(screen.getByText('AI Content Strategist'))
    fireEvent.click(screen.getByText('Generate New Strategy'))
    
    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    })
  })

  it('shows performance optimization for selected post', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    fireEvent.click(screen.getByText('Performance Optimizer'))
    
    // Click on first post to select it
    const postTitle = screen.getByText('Test Blog Post')
    fireEvent.click(postTitle)
    
    expect(screen.getByText('Re-Analyze')).toBeInTheDocument()
  })

  it('handles AI pipeline form submission', async () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    fireEvent.click(screen.getByText('Create New Post'))
    
    // Fill in the topic field
    const topicInput = screen.getByPlaceholderText(/primary topic/i)
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } })
    
    expect(topicInput).toHaveValue('Test Topic')
  })

  it('shows loading states correctly', () => {
    render(<BlogAdminDashboard {...mockProps} />)
    
    fireEvent.click(screen.getByText('AI Content Strategist'))
    fireEvent.click(screen.getByText('Generate New Strategy'))
    
    // Should show analyzing state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('handles copy content functionality', () => {
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn() },
      writable: true
    })

    render(<BlogAdminDashboard {...mockProps} />)
    
    const copyButtons = screen.getAllByText('Copy')
    fireEvent.click(copyButtons[0])
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# Test Content\n\nThis is test content.')
  })
})
