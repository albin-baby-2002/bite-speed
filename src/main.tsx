import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './index.css';
import App from './App.tsx';
import { ReactFlowProvider } from '@xyflow/react';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
      <DndProvider backend={HTML5Backend}>
        <Toaster position='top-center'/>
        <App />
      </DndProvider>
    </ReactFlowProvider>
  </StrictMode>
);
