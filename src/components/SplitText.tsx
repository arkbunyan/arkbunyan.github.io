export default function SplitText({ children }: { children: string }) {
  const parts = children.split(/(\s+)/).filter(Boolean);

  return (
    <>
      {parts.map((part, i) =>
        /^\s+$/.test(part) ? (
          part
        ) : (
          <span className="w" key={i} aria-hidden="true">
            {Array.from(part).map((char, j) => (
              <span className="ch" key={j}>
                {char}
              </span>
            ))}
          </span>
        ),
      )}
    </>
  );
}
