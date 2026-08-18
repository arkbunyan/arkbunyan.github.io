import { useRef } from "react";

import ExperienceList from "./components/ExperienceList";
import Prose from "./components/Prose";
import Section from "./components/Section";
import SplitText from "./components/SplitText";
import ThemeToggle from "./components/ThemeToggle";
import { elsewhere, experience, profile, stack } from "./content";
import useLetterRepel from "./hooks/useLetterRepel";
import useTheme from "./hooks/useTheme";

export default function App() {
  const pageRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const { mode, toggle } = useTheme();

  useLetterRepel(pageRef, nameRef);

  return (
    <>
      <ThemeToggle mode={mode} onToggle={toggle} />

      <main className="page" ref={pageRef}>
        <header className="top">
          <h1 className="name" ref={nameRef} aria-label={profile.name}>
            <SplitText>{profile.name}</SplitText>
          </h1>
          <p className="sub" aria-label={profile.subtitle}>
            <SplitText>{profile.subtitle}</SplitText>
          </p>
        </header>

        <Prose segments={profile.intro} />

        <Section title="Experience">
          <ExperienceList roles={experience} />
        </Section>

        <Section title="Stack">
          <p className="flat" aria-label={stack}>
            <SplitText>{stack}</SplitText>
          </p>
        </Section>

        <Section title="Elsewhere">
          <p className="flat">
            {elsewhere.map((link, i) => (
              <span key={link.text}>
                <a
                  href={link.href}
                  aria-label={link.text}
                  {...(link.href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <SplitText>{link.text}</SplitText>
                </a>
                {i < elsewhere.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
        </Section>

        <footer aria-label={profile.location}>
          <SplitText>{profile.location}</SplitText>
        </footer>
      </main>
    </>
  );
}
