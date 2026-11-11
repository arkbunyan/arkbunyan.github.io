import type { Project } from "../content";
import SplitText from "./SplitText";

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="list">
      {projects.map((project) => (
        <li key={project.name}>
          <span className="row" aria-label={`${project.name}, ${project.desc}`}>
            <span className="what">
              <b>
                <a href={project.href} target="_blank" rel="noreferrer">
                  <SplitText>{project.name}</SplitText>
                </a>
              </b>{" "}
              <SplitText>{`— ${project.desc}`}</SplitText>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
