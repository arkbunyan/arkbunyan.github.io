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
        ", building synthetic data and rendering pipelines for camera simulation. " +
        "Before that, scientific computing at CMCC and software engineering at Bioness Medical.",
    },
  ] as Segment[],
};

export const experience: Role[] = [
  { org: "Princeton Vision & Learning Lab", role: "Undergraduate Researcher" },
  { org: "CMCC", role: "Scientific Computing Intern, Bologna" },
  { org: "Bioness Medical", role: "Software Engineer Intern" },
];

export const stack =
  "C++, Python, Java, Go, C, JavaScript, SQL, Bash. PyTorch, NumPy, Pandas, React, Flask, Node.js. Git, Linux, PostgreSQL, Slurm/HPC.";

export const elsewhere: Segment[] = [
  { text: "GitHub", href: "https://github.com/arkbunyan" },
  { text: "LinkedIn", href: "https://www.linkedin.com/in/arkbunyan" },
  { text: "email", href: "mailto:arkbunyan@princeton.edu" },
];
