export type Segment = { text: string; href?: string };

export type Role = {
  org: string;
  role: string;
};

export type Project = {
  name: string;
  desc: string;
  href: string;
};

export const profile = {
  name: "Ark Bunyan",
  subtitle: "Computer science, Princeton \u201928",
  location: "Los Angeles & Princeton.",
  intro: [
    { text: "I\u2019m an undergraduate researcher at the " },
    { text: "Vision & Learning Lab", href: "https://pvl.cs.princeton.edu/" },
    {
      text:
        ", where I work on synthetic data generation. " +
        "I\u2019m also a teaching assistant for COS 226 (Data Structures and Algorithms) " +
        "and COS 217 (Programming Systems). This past summer, I interned at ",
    },
    { text: "CMCC", href: "https://www.cmcc.it/" },
    { text: ", where I worked on benchmarking ensemble forecasting algorithms." },
  ] as Segment[],
};

export const experience: Role[] = [
  { org: "Vision & Learning Lab", role: "Undergraduate Researcher" },
  { org: "Princeton University", role: "Teaching Assistant" },
  { org: "CMCC Foundation", role: "Scientific Computing Intern" },
  { org: "Bioness", role: "Software Engineer Intern" },
];

export const projects: Project[] = [
  {
    name: "Eat Princeton",
    desc: "downtown restaurant guide",
    href: "https://eatprinceton.com",
  },
];

export const stack =
  "C++, Python, Java, Go, PyTorch, React, Flask, PostgreSQL, Slurm";

export const elsewhere: Segment[] = [
  { text: "GitHub", href: "https://github.com/arkbunyan" },
  { text: "LinkedIn", href: "https://www.linkedin.com/in/arkbunyan" },
  { text: "email", href: "mailto:arkbunyan@princeton.edu" },
];
