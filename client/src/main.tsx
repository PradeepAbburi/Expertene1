import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// highlight.js theme for code syntax coloring
import 'highlight.js/styles/github-dark.css';

createRoot(document.getElementById("root")!).render(<App />);
