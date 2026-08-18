type Props = {
  mode: "light" | "dark";
  onToggle: () => void;
};

export default function ThemeToggle({ mode, onToggle }: Props) {
  return (
    <button className="mode" onClick={onToggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      {mode === "dark" ? "\u2600" : "\u263E"}
    </button>
  );
}
