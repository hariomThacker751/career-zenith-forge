import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedResume {
  text: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
}

// Common tech skills to detect
const TECH_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby",
  "React", "Vue", "Angular", "Next.js", "Node.js", "Express", "Django", "Flask",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST API",
  "Git", "CI/CD", "Jenkins", "GitHub Actions",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "LangChain",
  "HTML", "CSS", "Tailwind", "SASS", "Figma",
  "Agile", "Scrum", "JIRA", "Linux", "Bash",
  "Swift", "Kotlin", "React Native", "Flutter",
  "Blockchain", "Solidity", "Web3",
];

// Extract sections from resume text
function extractSections(text: string): ParsedResume {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);
  
  // Detect skills from text
  const detectedSkills: string[] = [];
  const lowerText = text.toLowerCase();
  
  TECH_SKILLS.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      detectedSkills.push(skill);
    }
  });

  // Simple section detection
  const experience: string[] = [];
  const education: string[] = [];
  const projects: string[] = [];
  
  let currentSection = "";
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Detect section headers
    if (lowerLine.includes("experience") || lowerLine.includes("work history") || lowerLine.includes("employment")) {
      currentSection = "experience";
      return;
    }
    if (lowerLine.includes("education") || lowerLine.includes("academic")) {
      currentSection = "education";
      return;
    }
    if (lowerLine.includes("project") || lowerLine.includes("portfolio")) {
      currentSection = "projects";
      return;
    }
    if (lowerLine.includes("skill") || lowerLine.includes("technical") || lowerLine.includes("certification")) {
      currentSection = "skills";
      return;
    }
    
    // Add content to appropriate section
    if (line.length > 10) {
      switch (currentSection) {
        case "experience":
          experience.push(line);
          break;
        case "education":
          education.push(line);
          break;
        case "projects":
          projects.push(line);
          break;
      }
    }
  });

  return {
    text,
    skills: detectedSkills,
    experience: experience.slice(0, 10), // Limit entries
    education: education.slice(0, 5),
    projects: projects.slice(0, 5),
  };
}

export async function parsePDF(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }
  
  return extractSections(fullText);
}

export async function parseDOCX(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return extractSections(result.value);
}

export async function parseResume(file: File): Promise<ParsedResume> {
  const fileType = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";
  
  if (fileType === "pdf") {
    return parsePDF(file);
  } else {
    return parseDOCX(file);
  }
}
