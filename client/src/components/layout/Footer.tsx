// ...existing code...

export const Footer = () => (
  <footer className="site-footer">
    <div className="site-inner footer-inner">
      <div>© {new Date().getFullYear()} Expertene</div>
      <nav className="footer-nav">
        <a href="/about">About</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </nav>
    </div>
  </footer>
);

export default Footer;
