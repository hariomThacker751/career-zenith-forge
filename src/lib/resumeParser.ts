import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Configure PDF.js worker with multiple fallback strategies
const configurePdfWorker = () => {
  try {
    // Primary: Use bundled worker via ESM import
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback: Use CDN worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
};

configurePdfWorker();

export interface ParsedResume {
  text: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
}

// Comprehensive tech skills database
const TECH_SKILLS = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Lua", "Dart", "Elixir", "Clojure", "Haskell", "SQL", "NoSQL",
  // Frontend
  "React", "Vue", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte", "SolidJS", "Astro", "Gatsby", "Remix", "jQuery", "Redux", "Zustand", "MobX", "Recoil", "Jotai",
  // Backend
  "Node.js", "Express", "Express.js", "Fastify", "NestJS", "Django", "Flask", "FastAPI", "Spring", "Spring Boot", "Rails", "Ruby on Rails", "Laravel", "ASP.NET", "Gin", "Echo", "Fiber",
  // Cloud & DevOps
  "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "K8s", "Terraform", "Ansible", "Jenkins", "CircleCI", "GitHub Actions", "GitLab CI", "Vercel", "Netlify", "Heroku", "Railway", "DigitalOcean", "Cloudflare",
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB", "Cassandra", "SQLite", "Firebase", "Supabase", "Prisma", "Drizzle", "TypeORM", "Sequelize", "Mongoose",
  // AI/ML
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "OpenAI", "LangChain", "Hugging Face", "NLP", "Computer Vision", "Neural Networks", "RAG", "LLM", "GPT", "Transformers", "BERT", "Stable Diffusion", "Vector Database", "Pinecone", "Weaviate", "ChromaDB",
  // Web Technologies
  "HTML", "HTML5", "CSS", "CSS3", "Tailwind", "Tailwind CSS", "SASS", "SCSS", "Less", "Bootstrap", "Material UI", "MUI", "Chakra UI", "Styled Components", "Emotion", "Framer Motion",
  // Tools & Practices
  "Git", "GitHub", "GitLab", "Bitbucket", "CI/CD", "Agile", "Scrum", "Kanban", "JIRA", "Confluence", "Linux", "Bash", "Shell", "REST API", "RESTful", "GraphQL", "gRPC", "WebSocket", "OAuth", "JWT", "Figma", "Sketch", "Adobe XD",
  // Mobile
  "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Expo", "Ionic", "Capacitor", "PWA",
  // Web3 & Blockchain
  "Blockchain", "Solidity", "Web3", "Web3.js", "Ethers.js", "Smart Contracts", "Ethereum", "Solana", "DeFi", "NFT",
  // Testing
  "Jest", "Vitest", "Cypress", "Playwright", "Selenium", "Testing Library", "Mocha", "Chai", "pytest", "JUnit",
  // Data
  "Pandas", "NumPy", "Matplotlib", "Seaborn", "Apache Spark", "Kafka", "Airflow", "dbt", "Tableau", "Power BI", "Looker",
];

// Soft skills to detect
const SOFT_SKILLS = [
  "Leadership", "Communication", "Problem Solving", "Teamwork", "Project Management", "Critical Thinking", "Time Management", "Adaptability", "Collaboration", "Mentoring",
];

// Extract contact information
function extractContactInfo(text: string): ParsedResume["contactInfo"] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin:?\s*)([a-zA-Z0-9-]+)/gi;
  const githubRegex = /(?:github\.com\/|github:?\s*)([a-zA-Z0-9-]+)/gi;

  const emails = text.match(emailRegex);
  const phones = text.match(phoneRegex);
  const linkedinMatches = text.match(linkedinRegex);
  const githubMatches = text.match(githubRegex);

  return {
    email: emails?.[0],
    phone: phones?.[0],
    linkedin: linkedinMatches?.[0]?.replace(/linkedin\.com\/in\/|linkedin:?\s*/gi, ''),
    github: githubMatches?.[0]?.replace(/github\.com\/|github:?\s*/gi, ''),
  };
}

// Improved section extraction with better pattern matching
function extractSections(text: string): ParsedResume {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const lowerText = text.toLowerCase();

  // Detect skills with word boundary matching
  const detectedSkills: string[] = [];
  
  TECH_SKILLS.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    // Use word boundary regex for more accurate matching
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      detectedSkills.push(skill);
    }
  });

  // Also detect soft skills
  SOFT_SKILLS.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      detectedSkills.push(skill);
    }
  });

  // Section headers patterns
  const sectionPatterns = {
    experience: /^(?:work\s*)?experience|employment|work\s*history|professional\s*experience|career/i,
    education: /^education|academic|qualifications|degrees?|university|college/i,
    projects: /^projects?|portfolio|personal\s*projects|side\s*projects|notable\s*work/i,
    skills: /^skills?|technical\s*skills?|technologies|competenc|expertise|proficienc/i,
    summary: /^summary|objective|profile|about|introduction/i,
  };

  const experience: string[] = [];
  const education: string[] = [];
  const projects: string[] = [];
  let summary = "";
  let currentSection = "";
  let sectionContent: string[] = [];

  const flushSection = () => {
    const content = sectionContent.filter(l => l.length > 15).slice(0, 15);
    switch (currentSection) {
      case "experience":
        experience.push(...content);
        break;
      case "education":
        education.push(...content);
        break;
      case "projects":
        projects.push(...content);
        break;
      case "summary":
        summary = content.join(" ").slice(0, 500);
        break;
    }
    sectionContent = [];
  };

  for (const line of lines) {
    // Check if this line is a section header
    let foundSection = false;
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line) && line.length < 50) {
        flushSection();
        currentSection = section;
        foundSection = true;
        break;
      }
    }

    if (!foundSection && currentSection) {
      sectionContent.push(line);
    }
  }
  
  // Flush the last section
  flushSection();

  // Extract contact info
  const contactInfo = extractContactInfo(text);

  return {
    text,
    skills: [...new Set(detectedSkills)], // Remove duplicates
    experience: experience.slice(0, 10),
    education: education.slice(0, 5),
    projects: projects.slice(0, 5),
    contactInfo,
    summary,
  };
}

// Robust PDF parsing with multiple fallback strategies
export async function parsePDF(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    // Try standard PDF parsing
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Better text extraction with positioning
      const items = textContent.items as Array<{ str: string; transform?: number[] }>;
      let lastY: number | null = null;
      
      for (const item of items) {
        const y = item.transform?.[5] ?? 0;
        // Add newline when Y position changes significantly
        if (lastY !== null && Math.abs(y - lastY) > 10) {
          fullText += "\n";
        }
        fullText += item.str + " ";
        lastY = y;
      }
      fullText += "\n\n";
    }

    const parsed = extractSections(fullText);
    
    // Validate we got meaningful content
    if (parsed.text.length < 50 || (parsed.skills.length === 0 && parsed.experience.length === 0)) {
      throw new Error("PDF parsing yielded insufficient content");
    }

    return parsed;
  } catch (error) {
    console.error("PDF parsing error:", error);
    
    // Try without worker as fallback
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
      });
      
      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      // Restore worker config
      configurePdfWorker();
      
      const parsed = extractSections(fullText);
      if (parsed.text.length < 50) {
        throw new Error("Fallback parsing also failed");
      }
      return parsed;
    } catch (fallbackError) {
      // Restore worker config
      configurePdfWorker();
      console.error("Fallback PDF parsing error:", fallbackError);
      throw new Error("Unable to parse PDF. The file may be image-based or corrupted.");
    }
  }
}

export async function parseDOCX(file: File): Promise<ParsedResume> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length < 50) {
      throw new Error("DOCX parsing yielded insufficient content");
    }
    
    return extractSections(result.value);
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Unable to parse DOCX. The file may be corrupted or password-protected.");
  }
}

export async function parseResume(file: File): Promise<ParsedResume> {
  const fileName = file.name.toLowerCase();
  
  if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx")) {
    throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
  }

  const fileType = fileName.endsWith(".pdf") ? "pdf" : "docx";

  if (fileType === "pdf") {
    return parsePDF(file);
  } else {
    return parseDOCX(file);
  }
}

// Helper to create mock resume data from manual input
export function createResumeFromManualInput(data: {
  skills: string[];
  yearOfStudy: string;
  interests: string[];
  projects: string[];
}): ParsedResume {
  return {
    text: `Manual entry - Year: ${data.yearOfStudy}, Skills: ${data.skills.join(", ")}, Interests: ${data.interests.join(", ")}`,
    skills: data.skills,
    experience: [],
    education: [data.yearOfStudy],
    projects: data.projects,
  };
}
