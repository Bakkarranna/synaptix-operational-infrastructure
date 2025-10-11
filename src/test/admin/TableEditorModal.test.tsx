import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import TableEditorModal from '../../../components/admin/TableEditorModal'

const sampleMarkdown = `| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |`

describe('TableEditorModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onUpdateTable: vi.fn(),
    initialMarkdown: sampleMarkdown
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    render(<TableEditorModal {...mockProps} />)
    
    expect(screen.getByText('Visual Table Editor')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<TableEditorModal {...mockProps} isOpen={false} />)
    
    expect(screen.queryByText('Visual Table Editor')).not.toBeInTheDocument()
  })

  it('parses initial markdown correctly', () => {
    render(<TableEditorModal {...mockProps} />)
    
    expect(screen.getByDisplayValue('Header 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Header 2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Header 3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Row 1 Col 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Row 2 Col 2')).toBeInTheDocument()
  })

  it('handles empty markdown input', () => {
    render(<TableEditorModal {...mockProps} initialMarkdown="" />)
    
    // Should not crash and should show some default state
    expect(screen.getByText('Visual Table Editor')).toBeInTheDocument()
  })

  it('handles malformed markdown input', () => {
    const malformedMarkdown = `| Header 1 | Header 2
Row without pipes
| Another row |`
    
    render(<TableEditorModal {...mockProps} initialMarkdown={malformedMarkdown} />)
    
    // Should handle gracefully and not crash
    expect(screen.getByText('Visual Table Editor')).toBeInTheDocument()
  })

  it('updates header text correctly', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const headerInput = screen.getByDisplayValue('Header 1')
    fireEvent.change(headerInput, { target: { value: 'Updated Header' } })
    
    expect(headerInput).toHaveValue('Updated Header')
  })

  it('updates cell content correctly', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const cellInput = screen.getByDisplayValue('Row 1 Col 1')
    fireEvent.change(cellInput, { target: { value: 'Updated Cell' } })
    
    expect(cellInput).toHaveValue('Updated Cell')
  })

  it('adds new row', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const addRowButton = screen.getByText('+ Add Row')
    fireEvent.click(addRowButton)
    
    // Should have additional empty cells for the new row
    const emptyCells = screen.getAllByDisplayValue('')
    expect(emptyCells.length).toBeGreaterThan(0)
  })

  it('removes row correctly', () => {
    render(<TableEditorModal {...mockProps} />)
    
    // Get initial row count by counting "Row 1" and "Row 2" cells
    const initialRow1Cells = screen.getAllByDisplayValue(/Row 1/)
    expect(initialRow1Cells.length).toBe(3)
    
    // Find and click the first row's delete button
    const deleteButtons = screen.getAllByText('×')
    const rowDeleteButton = deleteButtons.find(btn => 
      btn.closest('tr')?.textContent?.includes('Row 1 Col 1')
    )
    
    if (rowDeleteButton) {
      fireEvent.click(rowDeleteButton)
    }
    
    // Row should be removed
    expect(screen.queryByDisplayValue('Row 1 Col 1')).not.toBeInTheDocument()
  })

  it('adds new column', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const addColumnButton = screen.getByText('+')
    fireEvent.click(addColumnButton)
    
    // Should have a new column header
    expect(screen.getByDisplayValue('New Column')).toBeInTheDocument()
  })

  it('removes column correctly', () => {
    render(<TableEditorModal {...mockProps} />)
    
    // Find delete button for Header 1 column
    const deleteButtons = screen.getAllByText('×')
    const columnDeleteButton = deleteButtons.find(btn => {
      const parentTh = btn.closest('th')
      return parentTh?.querySelector('input')?.value === 'Header 1'
    })
    
    if (columnDeleteButton) {
      fireEvent.click(columnDeleteButton)
    }
    
    // Header and its column data should be removed
    expect(screen.queryByDisplayValue('Header 1')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('Row 1 Col 1')).not.toBeInTheDocument()
  })

  it('updates table and calls onUpdateTable', () => {
    render(<TableEditorModal {...mockProps} />)
    
    // Modify a cell
    const cellInput = screen.getByDisplayValue('Row 1 Col 1')
    fireEvent.change(cellInput, { target: { value: 'Modified Cell' } })
    
    // Click update button
    const updateButton = screen.getByText('Update Table')
    fireEvent.click(updateButton)
    
    expect(mockProps.onUpdateTable).toHaveBeenCalled()
    
    // Check that the markdown includes the modified content
    const callArgs = mockProps.onUpdateTable.mock.calls[0][0]
    expect(callArgs).toContain('Modified Cell')
  })

  it('closes modal when cancel is clicked', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('closes modal when close button is clicked', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const closeButton = screen.getByRole('button', { name: /close table editor/i })
    fireEvent.click(closeButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('closes modal when clicking outside', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const modalBackdrop = screen.getByText('Visual Table Editor').closest('.fixed')
    if (modalBackdrop) {
      fireEvent.click(modalBackdrop)
    }
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('does not close when clicking inside modal content', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const modalContent = screen.getByText('Visual Table Editor').closest('.relative')
    if (modalContent) {
      fireEvent.click(modalContent)
    }
    
    expect(mockProps.onClose).not.toHaveBeenCalled()
  })

  it('maintains equal column count when adding rows', () => {
    render(<TableEditorModal {...mockProps} />)
    
    // Add a new row
    const addRowButton = screen.getByText('+ Add Row')
    fireEvent.click(addRowButton)
    
    // Count columns in header and new row
    const headerInputs = screen.getAllByDisplayValue(/Header/)
    const headerCount = headerInputs.length
    
    // New row should have same number of columns (empty cells)
    const allRows = screen.getAllByRole('row')
    const dataRows = allRows.slice(1) // Exclude header row
    
    dataRows.forEach(row => {
      const cells = row.querySelectorAll('td input')
      expect(cells.length).toBe(headerCount)
    })
  })

  it('generates correct markdown format', () => {
    render(<TableEditorModal {...mockProps} />)
    
    // Update a cell
    const cellInput = screen.getByDisplayValue('Row 1 Col 1')
    fireEvent.change(cellInput, { target: { value: 'Updated' } })
    
    const updateButton = screen.getByText('Update Table')
    fireEvent.click(updateButton)
    
    const generatedMarkdown = mockProps.onUpdateTable.mock.calls[0][0]
    
    // Check markdown format
    expect(generatedMarkdown).toMatch(/\|.*\|/)  // Contains pipes
    expect(generatedMarkdown).toMatch(/---/)     // Contains separator
    expect(generatedMarkdown).toContain('Updated')
  })

  it('handles table with single column', () => {
    const singleColumnMarkdown = `| Single Header |
| --- |
| Single Cell |`
    
    render(<TableEditorModal {...mockProps} initialMarkdown={singleColumnMarkdown} />)
    
    expect(screen.getByDisplayValue('Single Header')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Single Cell')).toBeInTheDocument()
  })

  it('handles empty cells correctly', () => {
    const markdownWithEmptyCells = `| Header 1 | Header 2 |
| --- | --- |
| Content |  |
|  | More Content |`
    
    render(<TableEditorModal {...mockProps} initialMarkdown={markdownWithEmptyCells} />)
    
    expect(screen.getByDisplayValue('Content')).toBeInTheDocument()
    expect(screen.getByDisplayValue('More Content')).toBeInTheDocument()
  })

  it('preserves table structure after multiple operations', () => {
    render(<TableEditorModal {...mockProps} />)
    
    // Add a row
    fireEvent.click(screen.getByText('+ Add Row'))
    
    // Add a column
    fireEvent.click(screen.getByText('+'))
    
    // Remove a row
    const deleteButtons = screen.getAllByText('×')
    const rowDeleteButton = deleteButtons.find(btn => 
      btn.closest('tr')?.querySelector('input')?.value === 'Row 1 Col 1'
    )
    if (rowDeleteButton) {
      fireEvent.click(rowDeleteButton)
    }
    
    // Update table
    fireEvent.click(screen.getByText('Update Table'))
    
    // Should still generate valid markdown
    expect(mockProps.onUpdateTable).toHaveBeenCalled()
    const markdown = mockProps.onUpdateTable.mock.calls[0][0]
    expect(markdown).toMatch(/\|.*\|/)
  })

  it('handles focus and blur events on inputs', () => {
    render(<TableEditorModal {...mockProps} />)
    
    const cellInput = screen.getByDisplayValue('Row 1 Col 1')
    
    fireEvent.focus(cellInput)
    fireEvent.change(cellInput, { target: { value: 'Focused Content' } })
    fireEvent.blur(cellInput)
    
    expect(cellInput).toHaveValue('Focused Content')
  })
})