import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ReactNode, FC, ReactElement } from 'react'
import { ThemeProvider } from '../styles/theme'

type AllTheProvidersProps = {
  children: ReactNode
}

const AllTheProviders: FC<AllTheProvidersProps> = ({ children }) => {
  return <ThemeProvider>{children}</ThemeProvider>
}

type CustomRender = (ui: ReactElement, options?: RenderOptions) => RenderResult

export const customRender: CustomRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options })
