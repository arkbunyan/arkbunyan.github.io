export type Segment = { text: string; href?: string };

export type Role = {
  org: string;
  role: string;
};

export const profile = {
  name: "Ark Bunyan",
  subtitle: "Computer science, Princeton \u201928",
  location: "Los Angeles & Princeton.",
  intro: [
    { text: "I\u2019m an undergraduate researcher at the " },
    { text: "Princeton Vision & Learning Lab", href: "https://pvl.cs.princeton.edu/" },
    {
      text:
        ", working on rendering for camera simulation, and a teaching assistant for COS 226 (Data Structures and Algorithms) and COS 217 (Programming Systems). This past summer, I interned at ",
    },
    { text: "CMCC", href: "https://www.cmcc.it/" },
    { text: ", working on large-scale ensemble forecasting." },
  ] as Segment[],
};

export const experience: Role[] = [
  { org: "Princeton Vision & Learning Lab", role: "Undergraduate Researcher" },
  { org: "Princeton University", role: "Teaching Assistant, COS 226 & COS 217" },
  { org: "CMCC Foundation", role: "Scientific Computing Intern" },
  { org: "Bioness", role: "Software Engineer Intern" },
];

export const stack =
  "C++, Python, Java, Go, PyTorch, React, Flask, PostgreSQL, Slurm";

export const elsewhere: Segment[] = [
  { text: "GitHub", href: "https://github.com/arkbunyan" },
  { text: "LinkedIn", href: "https://www.linkedin.com/in/arkbunyan" },
  { text: "email", href: "mailto:arkbunyan@princeton.edu" },
];
