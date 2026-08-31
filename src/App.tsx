/**
 * src/App.tsx
 *
 * Main application component
 */

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CompatibilityPage from "./pages/CompatibilityPage";
import PartsPage from "./pages/PartsPage";
import AboutPage from "./pages/AboutPage";
import styles from "./styles/App.module.css";

export default function App() {
  return (
    <Router>
      <header className={styles.header}>
        <h1 className={styles.title}>Shimano Compatibility Checker</h1>
        <nav className={styles.nav}>
          <Link to="/">Compatibility</Link>
          <Link to="/parts">Parts List</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<CompatibilityPage />} />
          <Route path="/parts" element={<PartsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </Router>
  );
}
