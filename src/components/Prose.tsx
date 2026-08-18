import type { Segment } from "../content";
import SplitText from "./SplitText";

export default function Prose({ segments }: { segments: Segment[] }) {
  const label = segments.map((segment) => segment.text).join("");

  return (
    <p className="prose" aria-label={label}>
      {segments.map((segment, i) =>
        segment.href ? (
          <a key={i} href={segment.href} target="_blank" rel="noreferrer" aria-label={segment.text}>
            <SplitText>{segment.text}</SplitText>
          </a>
        ) : (
          <SplitText key={i}>{segment.text}</SplitText>
        ),
      )}
    </p>
  );
}
