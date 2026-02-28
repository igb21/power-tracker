import { Mail, Linkedin, Github, Presentation } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-top mt-4 py-3">
      <div className="d-flex justify-content-center gap-4 text-muted small">
        <a href="mailto:example@email.com" className="d-flex align-items-center gap-1 text-muted text-decoration-none">
          <Mail size={15} /> Email
        </a>
        <a href="https://www.linkedin.com/in/iangbrown/" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-muted text-decoration-none">
          <Linkedin size={15} /> LinkedIn
        </a>
        <a href="https://github.com/igb21/power-tracker" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-muted text-decoration-none">
          <Github size={15} /> GitHub
        </a>
        <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-muted text-decoration-none">
          <img src="/next.svg" alt="Next.js" style={{ height: '14px', opacity: 0.5 }} />
        </a>
        <a href="/app-presentation.pdf" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-muted text-decoration-none">
          <Presentation size={15} /> Presentation
        </a>
      </div>
    </footer>
  );
}
