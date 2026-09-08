import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { hydrateStore } from './data/persistence';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './routes/RootLayout';
import { TasksView } from './routes/TasksView';
import { MapView } from './routes/MapView';
import { TopicView } from './routes/TopicView';
import './index.css';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <TasksView /> },
      { path: 'map', element: <MapView /> },
      { path: 'topic/:id', element: <TopicView /> },
    ],
  },
]);

void hydrateStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
