import { Mail, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-6 py-4 border-t border-blue-900">
      <div className="flex justify-center space-x-6 text-sm text-gray-600 items-center">
        <a
          href="mailto:example@email.com"
          className="flex items-center gap-1 hover:text-blue-600 transition"
        >
          <Mail size={16} />
          Email
        </a>
        <a
          href="https://www.linkedin.com/in/iangbrown/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-blue-600 transition"
        >
          <Linkedin size={16} />
          LinkedIn
        </a>
        <a
          href="https://github.com/igb21/power-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-blue-600 transition"
        >
          <Github size={16} />
          GitHub
        </a>
         <a
          href="https://nextjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-blue-600 transition"
        >
            <img src="/next.svg" alt="Inlaid Logo" className="h-3 w-auto opacity-50" />
        </a>
      </div>
    </footer>
  );
}