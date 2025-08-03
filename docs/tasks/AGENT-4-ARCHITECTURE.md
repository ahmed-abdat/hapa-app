# Agent 4: Architecture Specialist Tasks 🏗️

**Agent**: Architecture Specialist  
**Focus**: Testing infrastructure and documentation  
**Estimated Time**: 8-10 hours  
**Priority**: Medium-High

---

## 📊 Current Status

### ✅ Foundation Ready
- TypeScript compilation clean
- Modern Next.js 15.3.3 architecture
- Well-structured component hierarchy
- Payload CMS 3.44.0 integration

### 🎯 Missing Infrastructure
- **Testing Framework**: No test infrastructure
- **API Documentation**: No formal API docs
- **Component Documentation**: No component library docs
- **Development Guidelines**: Minimal documentation

---

## 📋 Task List

### Task 1: Testing Framework Setup (3-4 hours)

#### 1.1 Install Testing Dependencies
```bash
# Core testing framework
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Next.js testing utilities
npm install --save-dev jest-environment-jsdom @next/env

# Additional testing utilities
npm install --save-dev msw @types/jest
```

#### 1.2 Configure Jest
**File**: `jest.config.js` (create)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@payload-config$': '<rootDir>/src/payload.config.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.config.{js,ts}',
    '!src/**/index.{js,ts}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

#### 1.3 Setup Test Environment
**File**: `jest.setup.js` (create)

```javascript
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
  useParams() {
    return { locale: 'fr' }
  },
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'fr',
  getTranslations: () => Promise.resolve((key) => key),
}))

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: () => Promise.resolve((key) => key),
  setRequestLocale: jest.fn(),
  getMessages: () => Promise.resolve({}),
}))

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock file APIs
Object.defineProperty(global, 'File', {
  value: class MockFile {
    constructor(parts, filename, properties) {
      this.parts = parts
      this.name = filename
      this.size = properties?.size || 0
      this.type = properties?.type || ''
      this.lastModified = properties?.lastModified || Date.now()
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(this.size))
    }
  }
})

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn(),
  }
})
```

#### 1.4 Add Test Scripts
**File**: `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

#### 1.5 Create Initial Tests

**File**: `src/lib/__tests__/file-upload.test.ts`

```typescript
import { 
  sanitizeFilename, 
  validateFileSignature, 
  formatFileSize,
  calculateSavings,
  isImageFile,
  categorizeError,
  isRetryableError
} from '../file-upload'

describe('File Upload Utilities', () => {
  describe('sanitizeFilename', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('file<>name.txt')).toBe('file__name.txt')
      expect(sanitizeFilename('file|name.txt')).toBe('file_name.txt')
    })
    
    it('should remove leading/trailing dots', () => {
      expect(sanitizeFilename('.hidden.txt.')).toBe('hidden.txt')
    })
    
    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt'
      expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })
  })

  describe('calculateSavings', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateSavings(1000, 500)).toBe(50)
      expect(calculateSavings(1000, 750)).toBe(25)
      expect(calculateSavings(0, 0)).toBe(0)
    })
  })

  describe('isImageFile', () => {
    it('should identify image files correctly', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      
      expect(isImageFile(imageFile)).toBe(true)
      expect(isImageFile(textFile)).toBe(false)
    })
  })

  describe('categorizeError', () => {
    it('should categorize network errors', () => {
      const networkError = new Error('Network request failed')
      expect(categorizeError(networkError)).toBe('network')
    })
    
    it('should categorize validation errors', () => {
      const validationError = new Error('File too large')
      expect(categorizeError(validationError)).toBe('validation')
    })
  })

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      expect(isRetryableError('network')).toBe(true)
      expect(isRetryableError('server')).toBe(true)
      expect(isRetryableError('security')).toBe(false)
      expect(isRetryableError('validation')).toBe(false)
    })
  })
})
```

**File**: `src/components/ui/__tests__/button.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="outline">Outline Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-input')
  })

  it('disables when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
```

**File**: `src/components/CustomForms/FormFields/__tests__/FormFileUpload.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { FormFileUpload } from '../FormFileUpload'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'fr',
}))

// Wrapper component for react-hook-form
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('FormFileUpload Component', () => {
  it('renders file upload area', () => {
    render(
      <TestWrapper>
        <FormFileUpload name="test" label="Upload File" />
      </TestWrapper>
    )
    
    expect(screen.getByRole('button', { name: /fileUploadArea/i })).toBeInTheDocument()
    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })

  it('shows compression toggle when enabled', () => {
    render(
      <TestWrapper>
        <FormFileUpload 
          name="test" 
          label="Upload File" 
          enableCompression={true}
        />
      </TestWrapper>
    )
    
    expect(screen.getByText(/compressionToggleLabel/i)).toBeInTheDocument()
  })

  it('handles file selection', async () => {
    render(
      <TestWrapper>
        <FormFileUpload name="test" label="Upload File" />
      </TestWrapper>
    )
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByRole('button', { name: /fileUploadArea/i })
    
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })
  })

  it('validates file size', async () => {
    render(
      <TestWrapper>
        <FormFileUpload name="test" label="Upload File" maxSize={1} />
      </TestWrapper>
    )
    
    // Create file larger than 1MB
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.txt', { 
      type: 'text/plain' 
    })
    
    const input = screen.getByRole('button', { name: /fileUploadArea/i })
    fireEvent.change(input, { target: { files: [largeFile] } })
    
    await waitFor(() => {
      expect(screen.getByText(/fileTooLarge/i)).toBeInTheDocument()
    })
  })
})
```

---

### Task 2: API Documentation (2-3 hours)

#### 2.1 Install OpenAPI Dependencies
```bash
npm install --save-dev swagger-jsdoc swagger-ui-express
npm install --save-dev @apidevtools/swagger-parser
```

#### 2.2 Create OpenAPI Specification
**File**: `docs/api/openapi.yaml` (create)

```yaml
openapi: 3.0.3
info:
  title: HAPA API
  description: API for Haute Autorité de la Presse et de l'Audiovisuel
  version: 1.0.0
  contact:
    name: HAPA Technical Team
    url: https://hapa.mr
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://hapa.mr/api
    description: Production server
  - url: http://localhost:3000/api
    description: Development server

security:
  - csrfToken: []

paths:
  /media-forms/submit:
    post:
      summary: Submit media content form
      description: Submit a media content report or complaint
      tags:
        - Media Forms
      security:
        - csrfToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              oneOf:
                - $ref: '#/components/schemas/MediaContentReport'
                - $ref: '#/components/schemas/MediaContentComplaint'
      responses:
        '201':
          description: Form submitted successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SubmissionResponse'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: Rate limit exceeded
          headers:
            X-RateLimit-Limit:
              schema:
                type: integer
              description: Number of requests allowed per hour
            X-RateLimit-Remaining:
              schema:
                type: integer
              description: Number of requests remaining
            X-RateLimit-Reset:
              schema:
                type: string
                format: date-time
              description: Time when rate limit resets
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /media/upload:
    post:
      summary: Upload media file
      description: Upload a media file for form submissions
      tags:
        - Media Upload
      security:
        - csrfToken: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                  description: Media file to upload
      responses:
        '200':
          description: File uploaded successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UploadResponse'
        '400':
          description: Invalid file or validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  securitySchemes:
    csrfToken:
      type: apiKey
      in: header
      name: x-csrf-token
      description: CSRF token for form protection

  schemas:
    MediaContentReport:
      type: object
      required:
        - formType
        - mediaType
        - reasons
        - description
        - submittedAt
        - locale
      properties:
        formType:
          type: string
          enum: [report]
        mediaType:
          type: string
          enum: [television, radio, website, youtube, facebook, other]
        mediaTypeOther:
          type: string
          description: Required when mediaType is 'other'
        tvChannel:
          type: string
          description: Required when mediaType is 'television'
        radioStation:
          type: string
          description: Required when mediaType is 'radio'
        programName:
          type: string
        broadcastDateTime:
          type: string
          format: date-time
        linkScreenshot:
          type: string
          format: uri
        screenshotFiles:
          type: array
          items:
            type: string
        reasons:
          type: array
          items:
            type: string
            enum: [hateSpeech, misinformation, fakeNews, privacyViolation, shockingContent, pluralismViolation, falseAdvertising, other]
        reasonOther:
          type: string
        description:
          type: string
          minLength: 10
          maxLength: 2000
        attachmentTypes:
          type: array
          items:
            type: string
            enum: [screenshot, videoLink, writtenStatement, audioRecording, other]
        attachmentOther:
          type: string
        attachmentFiles:
          type: array
          items:
            type: string
        submittedAt:
          type: string
          format: date-time
        locale:
          type: string
          enum: [fr, ar]

    MediaContentComplaint:
      allOf:
        - $ref: '#/components/schemas/MediaContentReport'
        - type: object
          required:
            - fullName
            - gender
            - country
            - emailAddress
            - relationshipToContent
          properties:
            formType:
              type: string
              enum: [complaint]
            fullName:
              type: string
              minLength: 2
              maxLength: 100
            gender:
              type: string
              enum: [male, female]
            country:
              type: string
            emailAddress:
              type: string
              format: email
            phoneNumber:
              type: string
            whatsappNumber:
              type: string
            profession:
              type: string
            relationshipToContent:
              type: string
              enum: [viewer, directlyConcerned, journalist, other]
            relationshipOther:
              type: string

    SubmissionResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string
        submissionId:
          type: string

    UploadResponse:
      type: object
      properties:
        success:
          type: boolean
        url:
          type: string
          format: uri
        filename:
          type: string
        size:
          type: integer

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          default: false
        message:
          type: string
        error:
          type: string
        debug:
          type: object
          description: Debug information (development only)

tags:
  - name: Media Forms
    description: Media content reporting and complaint forms
  - name: Media Upload
    description: File upload for media submissions
```

#### 2.3 Create API Documentation Endpoint
**File**: `src/app/api/docs/route.ts` (create)

```typescript
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

export async function GET() {
  try {
    const docsPath = path.join(process.cwd(), 'docs/api/openapi.yaml')
    const yamlContent = fs.readFileSync(docsPath, 'utf8')
    const spec = yaml.parse(yamlContent)
    
    // Generate HTML with Swagger UI
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>HAPA API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
        <script>
          window.onload = function() {
            SwaggerUIBundle({
              url: '/api/docs/spec',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
    </html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load API documentation' },
      { status: 500 }
    )
  }
}
```

#### 2.4 Create API Spec Endpoint
**File**: `src/app/api/docs/spec/route.ts` (create)

```typescript
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

export async function GET() {
  try {
    const docsPath = path.join(process.cwd(), 'docs/api/openapi.yaml')
    const yamlContent = fs.readFileSync(docsPath, 'utf8')
    const spec = yaml.parse(yamlContent)
    
    return NextResponse.json(spec)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load API specification' },
      { status: 500 }
    )
  }
}
```

---

### Task 3: Component Documentation (2 hours)

#### 3.1 Install Storybook
```bash
npx storybook@latest init
```

#### 3.2 Configure Storybook for Next.js
**File**: `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
}

export default config
```

#### 3.3 Create Component Stories

**File**: `src/components/ui/button.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable button component with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}
```

**File**: `src/components/CustomForms/FormFields/FormFileUpload.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { useForm, FormProvider } from 'react-hook-form'
import { FormFileUpload } from './FormFileUpload'

// Mock next-intl
const mockUseTranslations = () => (key: string) => {
  const translations: Record<string, string> = {
    dragDropText: 'Glissez et déposez vos fichiers ici, ou cliquez pour sélectionner',
    chooseFile: 'Choisir un fichier',
    maxSizeText: 'Taille maximale: {{maxSize}}MB',
    filesValidatedSecurity: 'Tous les fichiers sont validés pour la sécurité',
    fileUploadArea: 'Zone de téléchargement de fichiers',
    compressionToggleLabel: 'Compression automatique',
    compressionToggleDesc: 'Réduit automatiquement la taille des images',
    compressionEnabled: 'Activée',
    compressionDisabled: 'Désactivée',
  }
  return translations[key] || key
}

jest.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
  useLocale: () => 'fr',
}))

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

const meta: Meta<typeof FormFileUpload> = {
  title: 'Forms/FormFileUpload',
  component: FormFileUpload,
  decorators: [
    (Story) => (
      <FormWrapper>
        <div className="max-w-md">
          <Story />
        </div>
      </FormWrapper>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A file upload component with validation, compression, and retry capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    accept: {
      control: { type: 'text' },
      description: 'Accepted file types',
    },
    maxSize: {
      control: { type: 'number' },
      description: 'Maximum file size in MB',
    },
    multiple: {
      control: { type: 'boolean' },
      description: 'Allow multiple file selection',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Required field',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    enableCompression: {
      control: { type: 'boolean' },
      description: 'Enable image compression',
    },
    compressionThreshold: {
      control: { type: 'number' },
      description: 'Compression threshold in MB',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'file',
    label: 'Upload File',
  },
}

export const MultipleFiles: Story = {
  args: {
    name: 'files',
    label: 'Upload Multiple Files',
    multiple: true,
  },
}

export const ImagesOnly: Story = {
  args: {
    name: 'images',
    label: 'Upload Images',
    accept: 'image/*',
    maxSize: 5,
  },
}

export const WithCompression: Story = {
  args: {
    name: 'images',
    label: 'Upload Images (with compression)',
    accept: 'image/*',
    enableCompression: true,
    compressionThreshold: 2,
  },
}

export const Required: Story = {
  args: {
    name: 'requiredFile',
    label: 'Required File Upload',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    name: 'disabledFile',
    label: 'Disabled File Upload',
    disabled: true,
  },
}
```

---

### Task 4: Development Guidelines (1 hour)

#### 4.1 Create Development Guide
**File**: `docs/DEVELOPMENT.md` (create)

```markdown
# HAPA Development Guide

## Getting Started

### Prerequisites
- Node.js 18.19.0 or higher
- pnpm 10.12.4
- PostgreSQL database

### Setup
\`\`\`bash
# Clone repository
git clone <repository-url>
cd hapa-website

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
pnpm dev
\`\`\`

## Project Structure

\`\`\`
src/
├── app/                 # Next.js App Router
│   ├── (frontend)/     # Public frontend
│   └── (payload)/      # CMS admin
├── blocks/             # Payload CMS blocks
├── collections/        # Payload CMS collections
├── components/         # React components
│   ├── ui/            # Base UI components
│   └── CustomForms/   # Form components
├── lib/               # Utilities and libraries
├── utilities/         # Helper functions
└── i18n/              # Internationalization
\`\`\`

## Development Workflow

### 1. Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

### 2. Component Development
- Create components in appropriate directories
- Write stories for Storybook
- Include unit tests
- Use TypeScript interfaces for props

### 3. Form Development
- Use React Hook Form with Zod validation
- Support RTL (Arabic) layout
- Include accessibility features
- Add proper error handling

### 4. Testing
\`\`\`bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
\`\`\`

### 5. Storybook
\`\`\`bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
\`\`\`

## Best Practices

### TypeScript
- Use strict mode
- Define interfaces for all props
- Avoid `any` type
- Use type guards for runtime validation

### Internationalization
- Import Link from `@/i18n/navigation`, not `next/link`
- Use `getTranslation()` for UI strings
- Support both French and Arabic
- Test RTL layout

### Performance
- Use dynamic imports for heavy components
- Optimize images with Next.js Image
- Implement proper caching
- Monitor bundle size

### Security
- Validate all inputs
- Use CSRF protection
- Implement rate limiting
- Follow security best practices

## Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Performance optimized

### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] ESLint warnings resolved
- [ ] Unit tests written
- [ ] Documentation updated

### Security
- [ ] Input validation implemented
- [ ] No security vulnerabilities
- [ ] Proper authentication/authorization
- [ ] Sensitive data protected

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast adequate
- [ ] ARIA labels added

### Internationalization
- [ ] RTL layout support
- [ ] Text externalized to translation files
- [ ] Both locales tested
- [ ] Cultural appropriateness verified

## Deployment

### Staging
\`\`\`bash
# Build for staging
pnpm build

# Deploy to staging
vercel --prod
\`\`\`

### Production
\`\`\`bash
# Run pre-deployment checks
pnpm lint
pnpm test:ci
pnpm build

# Deploy to production
# (Automated via GitHub Actions)
\`\`\`
```

#### 4.2 Create Code Review Checklist
**File**: `docs/CODE_REVIEW_CHECKLIST.md` (create)

```markdown
# Code Review Checklist

## Before Review
- [ ] PR has clear title and description
- [ ] All CI checks pass
- [ ] Self-review completed
- [ ] Documentation updated

## Functionality Review
- [ ] Code accomplishes stated requirements
- [ ] Edge cases and error conditions handled
- [ ] User experience is intuitive
- [ ] Performance is acceptable

## Code Quality
- [ ] Code is readable and well-organized
- [ ] TypeScript types are accurate and helpful
- [ ] No unnecessary complexity
- [ ] Consistent with project conventions

## Testing
- [ ] Unit tests cover new functionality
- [ ] Tests are meaningful and robust
- [ ] Test coverage is adequate
- [ ] No broken tests

## Security
- [ ] Input validation is present
- [ ] No hardcoded secrets or credentials
- [ ] Authentication/authorization is correct
- [ ] Security best practices followed

## Performance
- [ ] No unnecessary re-renders
- [ ] Efficient data structures and algorithms
- [ ] Proper caching where appropriate
- [ ] Bundle size impact considered

## Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast is adequate
- [ ] ARIA labels where needed

## Internationalization
- [ ] RTL layout support
- [ ] No hardcoded text strings
- [ ] Cultural appropriateness
- [ ] Both locales work correctly

## Documentation
- [ ] Code is self-documenting
- [ ] Complex logic is explained
- [ ] API documentation updated
- [ ] README updated if needed
```

---

## 🎯 Acceptance Criteria

### Must Complete:
- [ ] Jest testing framework configured and working
- [ ] 5+ unit tests written and passing
- [ ] OpenAPI documentation complete for all endpoints
- [ ] Storybook configured with 3+ component stories
- [ ] Development guidelines documented
- [ ] Code review checklist created

### Nice to Have:
- [ ] Integration tests for API endpoints
- [ ] Visual regression testing setup
- [ ] Test coverage >80%
- [ ] Automated documentation generation

---

## 📊 Testing & Validation

### Unit Testing:
```bash
# Run all tests
pnpm test

# Check coverage
pnpm test:coverage

# Target: >70% coverage for critical utilities
```

### API Documentation:
```bash
# View API docs
open http://localhost:3000/api/docs

# Validate OpenAPI spec
npx swagger-parser validate docs/api/openapi.yaml
```

### Storybook:
```bash
# Start Storybook
pnpm storybook

# Build and test
pnpm build-storybook
```

---

## 📅 Timeline

**Hour 1-3**: Testing framework setup and initial tests  
**Hour 4-6**: OpenAPI documentation creation  
**Hour 7-8**: Storybook configuration and stories  
**Hour 9**: Development guidelines and checklist  
**Hour 10**: Integration testing and documentation  

---

**Estimated Completion**: 10 hours  
**Dependencies**: All other agents for complete testing  
**Coordination**: Testing other agents' components  
**Output**: Complete testing and documentation infrastructure