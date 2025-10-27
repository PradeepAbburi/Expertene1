
import "../styles/landing.css";
import { BackButton } from "@/components/BackButton";

export default function APIPage() {
  return (
    <div className="page-root">
      <div className="site-inner page-inner">
        <div className="mb-8">
          <BackButton />
        </div>
        <h2>API & Docs</h2>
        <p>Public API endpoints and developer docs will be available here.</p>
        <div className="coming-soon">Coming soon  API docs and examples</div>
      </div>
    </div>
  );
}
