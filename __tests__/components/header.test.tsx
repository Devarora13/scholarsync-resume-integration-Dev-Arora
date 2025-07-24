import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '@/lib/store'
import { Header } from '@/components/header'

// Mock Redux Provider wrapper
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('Header Component', () => {
  it('renders the header with logo and title', () => {
    renderWithProvider(<Header />)
    
    expect(screen.getByText('ScholarSync')).toBeInTheDocument()
    expect(screen.getByText('SS')).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    renderWithProvider(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('border-b', 'bg-white/80', 'backdrop-blur-sm', 'sticky', 'top-0', 'z-50')
  })

  it('displays the logo with gradient background', () => {
    renderWithProvider(<Header />)
    
    const logo = screen.getByText('SS')
    expect(logo.parentElement).toHaveClass('bg-gradient-to-br', 'from-blue-600', 'to-purple-600')
  })
})
