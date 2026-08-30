import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './routes/RootLayout';
import { MapView } from './routes/MapView';
import { TopicView } from './routes/TopicView';

/**
 * Level routing. `/` is the whole map, `/topic/:id` is drilled into one topic.
 * Keeping levels as real routes gives us the Android back button for free.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <MapView /> },
      { path: 'topic/:id', element: <TopicView /> },
    ],
  },
]);
