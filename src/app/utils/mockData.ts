import { FileNode } from '../types';

export const mockFileTree: FileNode[] = [
  {
    name: 'src',
    path: '/src',
    type: 'directory',
    status: 'modified',
    children: [
      {
        name: 'components',
        path: '/src/components',
        type: 'directory',
        status: 'modified',
        children: [
          {
            name: 'Button.tsx',
            path: '/src/components/Button.tsx',
            type: 'file',
            status: 'modified',
            isText: true,
            size: 2048,
            modifiedDate: '2026-05-19 14:30:22',
            hash: 'a3f5c9e2d1b8f047',
            leftContent: `import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}`,
            rightContent: `import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
    >
      {label}
    </button>
  );
}`,
          },
          {
            name: 'Header.tsx',
            path: '/src/components/Header.tsx',
            type: 'file',
            status: 'identical',
            isText: true,
            size: 1536,
            modifiedDate: '2026-05-18 10:15:00',
            hash: 'b7d2e1f8c3a09456',
            leftContent: `export function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}`,
            rightContent: `export function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}`,
          },
          {
            name: 'Modal.tsx',
            path: '/src/components/Modal.tsx',
            type: 'file',
            status: 'added',
            isText: true,
            size: 3072,
            modifiedDate: '2026-05-19 16:45:10',
            hash: 'c9a1f3d7e2b08512',
            leftContent: '',
            rightContent: `import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}`,
          },
        ],
      },
      {
        name: 'utils',
        path: '/src/utils',
        type: 'directory',
        status: 'modified',
        children: [
          {
            name: 'helpers.ts',
            path: '/src/utils/helpers.ts',
            type: 'file',
            status: 'deleted',
            isText: true,
            size: 1024,
            modifiedDate: '2026-05-15 09:20:30',
            hash: 'd4e8b2c1f0a73691',
            leftContent: `export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}`,
            rightContent: '',
          },
          {
            name: 'format.ts',
            path: '/src/utils/format.ts',
            type: 'file',
            status: 'added',
            isText: true,
            size: 1280,
            modifiedDate: '2026-05-19 11:00:00',
            hash: 'e1c7f9a3b2d04857',
            leftContent: '',
            rightContent: `import { format } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm:ss');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}`,
          },
        ],
      },
      {
        name: 'App.tsx',
        path: '/src/App.tsx',
        type: 'file',
        status: 'modified',
        isText: true,
        size: 4096,
        modifiedDate: '2026-05-19 15:20:45',
        hash: 'f2d9a4e6c1b73820',
        leftContent: `import { Header } from './components/Header';
import { Button } from './components/Button';

function App() {
  return (
    <div>
      <Header />
      <main>
        <Button label="Click me" onClick={() => console.log('clicked')} />
      </main>
    </div>
  );
}

export default App;`,
        rightContent: `import { Header } from './components/Header';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { useState } from 'react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Header />
      <main>
        <Button
          label="Click me"
          onClick={() => setIsModalOpen(true)}
          variant="primary"
        />
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>Welcome!</h2>
        </Modal>
      </main>
    </div>
  );
}

export default App;`,
      },
    ],
  },
  {
    name: 'public',
    path: '/public',
    type: 'directory',
    status: 'identical',
    children: [
      {
        name: 'logo.png',
        path: '/public/logo.png',
        type: 'file',
        status: 'identical',
        isText: false,
        size: 15360,
        modifiedDate: '2026-05-10 08:00:00',
        hash: '8a7c4f1e2d093b56',
      },
      {
        name: 'favicon.ico',
        path: '/public/favicon.ico',
        type: 'file',
        status: 'modified',
        isText: false,
        size: 2048,
        modifiedDate: '2026-05-19 12:30:00',
        hash: '9b8d5e2f1c047a63',
      },
    ],
  },
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    status: 'modified',
    isText: true,
    size: 1792,
    modifiedDate: '2026-05-19 09:45:15',
    hash: '7f3e9c4a0b158d72',
    leftContent: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
    rightContent: `{
  "name": "my-app",
  "version": "1.1.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "date-fns": "^2.30.0"
  }
}`,
  },
  {
    name: '.env.example',
    path: '/.env.example',
    type: 'file',
    status: 'deleted',
    isText: true,
    size: 256,
    modifiedDate: '2026-05-01 10:00:00',
    hash: '1a2b3c4d5e6f7890',
    leftContent: `VITE_API_URL=http://localhost:3000
VITE_APP_NAME=MyApp`,
    rightContent: '',
  },
];
