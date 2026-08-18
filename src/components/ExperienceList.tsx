import type { Role } from "../content";
import SplitText from "./SplitText";

export default function ExperienceList({ roles }: { roles: Role[] }) {
  return (
    <ul className="list">
      {roles.map((role) => (
        <li key={role.org}>
          <span className="row" aria-label={`${role.org}, ${role.role}`}>
            <span className="what">
              <b>
                <SplitText>{role.org}</SplitText>
              </b>{" "}
              <SplitText>{`\u2014 ${role.role}`}</SplitText>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
