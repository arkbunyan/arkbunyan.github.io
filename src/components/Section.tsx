import type { ReactNode } from "react";
import SplitText from "./SplitText";

export default function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="block">
      <h2 aria-label={title}>
        <SplitText>{title}</SplitText>
      </h2>
      {children}
    </section>
  );
}
