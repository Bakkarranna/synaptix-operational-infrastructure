import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PasswordModal from '../../../components/admin/PasswordModal'

describe('PasswordModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    render(<PasswordModal {...mockProps} />)
    
    expect(screen.getByText('Admin Access')).toBeInTheDocument()
    expect(screen.getByText('Enter the password to manage blog content.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unlock' })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<PasswordModal {...mockProps} isOpen={false} />)
    
    expect(screen.queryByText('Admin Access')).not.toBeInTheDocument()
  })

  it('handles password input', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    fireEvent.change(passwordInput, { target: { value: 'test123' } })
    
    expect(passwordInput).toHaveValue('test123')
  })

  it('handles correct password submission', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Unlock' })
    
    fireEvent.change(passwordInput, { target: { value: 'Synaptix@0' } })
    fireEvent.click(submitButton)
    
    expect(mockProps.onSuccess).toHaveBeenCalled()
    expect(passwordInput).toHaveValue('')
  })

  it('handles incorrect password submission', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Unlock' })
    
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument()
    expect(mockProps.onSuccess).not.toHaveBeenCalled()
  })

  it('clears error when typing new password', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Unlock' })
    
    // Enter wrong password first
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument()
    
    // Start typing new password
    fireEvent.change(passwordInput, { target: { value: 'new' } })
    
    expect(screen.queryByText('Incorrect password. Please try again.')).not.toBeInTheDocument()
  })

  it('handles form submission via Enter key', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    
    fireEvent.change(passwordInput, { target: { value: 'Synaptix@0' } })
    fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter', charCode: 13 })
    
    expect(mockProps.onSuccess).toHaveBeenCalled()
  })

  it('closes modal when clicking outside', () => {
    render(<PasswordModal {...mockProps} />)
    
    const modalBackdrop = screen.getByRole('dialog')
    fireEvent.click(modalBackdrop)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('does not close modal when clicking inside modal content', () => {
    render(<PasswordModal {...mockProps} />)
    
    const modalContent = screen.getByText('Admin Access').closest('div')
    if (modalContent) {
      fireEvent.click(modalContent)
    }
    
    expect(mockProps.onClose).not.toHaveBeenCalled()
  })

  it('displays icon correctly', () => {
    render(<PasswordModal {...mockProps} />)
    
    // Check for the zap icon (represented by the Icon component)
    const iconElement = screen.getByText('Admin Access').parentElement?.querySelector('svg')
    expect(iconElement).toBeInTheDocument()
  })

  it('auto-focuses password input when modal opens', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    expect(passwordInput).toHaveFocus()
  })

  it('has correct input type for password field', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('maintains password visibility as hidden', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    fireEvent.change(passwordInput, { target: { value: 'secretpassword' } })
    
    // Password should be hidden (type="password")
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveValue('secretpassword')
  })

  it('handles multiple incorrect attempts', () => {
    render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Unlock' })
    
    // First incorrect attempt
    fireEvent.change(passwordInput, { target: { value: 'wrong1' } })
    fireEvent.click(submitButton)
    expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument()
    
    // Second incorrect attempt
    fireEvent.change(passwordInput, { target: { value: 'wrong2' } })
    fireEvent.click(submitButton)
    expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument()
    
    // Correct password should still work
    fireEvent.change(passwordInput, { target: { value: 'Synaptix@0' } })
    fireEvent.click(submitButton)
    expect(mockProps.onSuccess).toHaveBeenCalled()
  })

  it('resets state when modal reopens', async () => {
    const { rerender } = render(<PasswordModal {...mockProps} />)
    
    const passwordInput = screen.getByPlaceholderText('Password')
    
    // Enter wrong password to trigger error
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(screen.getByRole('button', { name: 'Unlock' }))
    
    expect(screen.getByText('Incorrect password. Please try again.')).toBeInTheDocument()
    
    // Close modal
    rerender(<PasswordModal {...mockProps} isOpen={false} />)
    
    // Reopen modal - this should reset the component state
    rerender(<PasswordModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)
    
    // Wait for useEffect to run and clear state
    await waitFor(() => {
      expect(screen.queryByText('Incorrect password. Please try again.')).not.toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText('Password')).toHaveValue('')
  })

  it('has proper accessibility attributes', () => {
    render(<PasswordModal {...mockProps} />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    
    const passwordInput = screen.getByPlaceholderText('Password')
    expect(passwordInput).toBeInTheDocument()
  })
})