
import Footer from "@/components/layout/Footer";
import { BackButton } from "@/components/BackButton";

export default function About() {
  return (
    <div className="about-page">
      <div className="mb-8">
        <BackButton />
      </div>
      <h1>About Expertene</h1>
      <p>Expertene is a platform for sharing knowledge, building streaks, and connecting with a community of experts.</p>
      <Footer />
    </div>
  );
}
