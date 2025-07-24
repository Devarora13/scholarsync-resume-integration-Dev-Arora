import { type NextRequest, NextResponse } from "next/server"

import { SecurityValidator, EnhancedRateLimit } from "@/lib/security"

interface ProjectSuggestion {
  title: string
  description: string
  skillsRequired: string[]
  researchAreas: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimatedDuration: string
  category: string
  matchScore: number
}

function generateProjectSuggestions(resumeData: any, scholarData: any): ProjectSuggestion[] {
  const suggestions: ProjectSuggestion[] = []

  console.log("Starting project suggestion generation...")
  console.log("Resume data:", resumeData ? "Available" : "Not available")
  console.log("Scholar data:", scholarData ? "Available" : "Not available")

  // Extract and analyze data
  const skills = resumeData?.skills || []
  const experience = resumeData?.experience || []
  const education = resumeData?.education || []
  const researchInterests = scholarData?.researchInterests || []
  const publications = scholarData?.publications || []
  const totalCitations = scholarData?.totalCitations || 0

  console.log("Skills:", skills)
  console.log("Research interests:", researchInterests)
  console.log("Publications count:", publications.length)

  // Skill analysis
  const techSkills = analyzeSkills(skills)
  const academicLevel = determineAcademicLevel(education, experience, publications.length, totalCitations)
  const researchFocus = analyzeResearchFocus(researchInterests, publications)

  console.log("Tech skills analysis:", techSkills)
  console.log("Academic level:", academicLevel)
  console.log("Research focus:", researchFocus)

  // Generate suggestions based on different categories

  // 1. AI/ML Projects
  if (techSkills.hasML || researchFocus.isMLFocused) {
    suggestions.push(...generateMLProjects(techSkills, academicLevel, researchFocus, skills, researchInterests))
  }

  // 2. Web Development Projects
  if (techSkills.hasWeb) {
    suggestions.push(...generateWebProjects(techSkills, academicLevel, researchFocus, skills, researchInterests))
  }

  // 3. Data Science Projects
  if (techSkills.hasDataScience || researchFocus.isDataFocused) {
    suggestions.push(
      ...generateDataScienceProjects(techSkills, academicLevel, researchFocus, skills, researchInterests)
    )
  }

  // 4. Research-specific Projects
  if (scholarData && publications.length > 0) {
    suggestions.push(...generateResearchProjects(scholarData, techSkills, academicLevel, skills, researchInterests))
  }

  // 5. Cross-disciplinary Projects
  suggestions.push(
    ...generateInterdisciplinaryProjects(techSkills, academicLevel, researchFocus, skills, researchInterests)
  )

  // 6. Open Source & Community Projects
  suggestions.push(...generateOpenSourceProjects(techSkills, academicLevel, skills, researchInterests))

  // Calculate match scores and filter
  const scoredSuggestions = suggestions.map((suggestion) => ({
    ...suggestion,
    matchScore: calculateMatchScore(suggestion, techSkills, academicLevel, researchFocus, skills, researchInterests),
  }))

  // Sort by match score and return top suggestions
  const finalSuggestions = scoredSuggestions.sort((a, b) => b.matchScore - a.matchScore).slice(0, 12) // Limit to top 12 suggestions

  console.log("Generated suggestions:", finalSuggestions.length)
  console.log(
    "Top 3 suggestions:",
    finalSuggestions.slice(0, 3).map((s) => ({ title: s.title, score: s.matchScore }))
  )

  return finalSuggestions
}

// Skill analysis functions
function analyzeSkills(skills: string[]) {
  const skillsLower = skills.map((s) => s.toLowerCase())

  return {
    hasML: skillsLower.some(
      (s) =>
        s.includes("machine learning") ||
        s.includes("tensorflow") ||
        s.includes("pytorch") ||
        s.includes("scikit-learn") ||
        s.includes("deep learning") ||
        s.includes("neural")
    ),
    hasWeb: skillsLower.some(
      (s) =>
        s.includes("javascript") ||
        s.includes("react") ||
        s.includes("vue") ||
        s.includes("angular") ||
        s.includes("html") ||
        s.includes("css") ||
        s.includes("web") ||
        s.includes("frontend") ||
        s.includes("backend")
    ),
    hasDataScience: skillsLower.some(
      (s) =>
        s.includes("python") ||
        s.includes("r") ||
        s.includes("pandas") ||
        s.includes("numpy") ||
        s.includes("data analysis") ||
        s.includes("statistics") ||
        s.includes("visualization")
    ),
    hasMobile: skillsLower.some(
      (s) =>
        s.includes("react native") ||
        s.includes("flutter") ||
        s.includes("swift") ||
        s.includes("kotlin") ||
        s.includes("mobile")
    ),
    hasCloud: skillsLower.some(
      (s) =>
        s.includes("aws") ||
        s.includes("azure") ||
        s.includes("gcp") ||
        s.includes("docker") ||
        s.includes("kubernetes")
    ),
    hasDatabase: skillsLower.some(
      (s) => s.includes("sql") || s.includes("mongodb") || s.includes("postgresql") || s.includes("database")
    ),
    programmingLanguages: skills.filter((s) =>
      ["JavaScript", "Python", "Java", "C++", "C#", "Go", "Rust", "TypeScript", "R"].some((lang) =>
        s.toLowerCase().includes(lang.toLowerCase())
      )
    ),
  }
}

function determineAcademicLevel(education: any[], experience: any[], publicationsCount: number, citations: number) {
  const hasPhD = education.some(
    (e) => e.degree?.toLowerCase().includes("phd") || e.degree?.toLowerCase().includes("doctorate")
  )
  const hasMasters = education.some((e) => e.degree?.toLowerCase().includes("master"))
  const experienceYears = experience.length

  if (hasPhD || publicationsCount > 10 || citations > 100) return "Advanced"
  if (hasMasters || experienceYears > 3 || publicationsCount > 3) return "Intermediate"
  return "Beginner"
}

function analyzeResearchFocus(interests: string[], publications: any[]) {
  const interestsLower = interests.map((i) => i.toLowerCase())
  const pubTitles = publications.map((p) => p.title?.toLowerCase() || "")

  const allText = [...interestsLower, ...pubTitles].join(" ")

  return {
    isMLFocused:
      allText.includes("machine learning") ||
      allText.includes("artificial intelligence") ||
      allText.includes("deep learning") ||
      allText.includes("neural network"),
    isDataFocused: allText.includes("data") || allText.includes("analytics") || allText.includes("statistics"),
    isHCIFocused: allText.includes("human") || allText.includes("interface") || allText.includes("interaction"),
    isSecurityFocused: allText.includes("security") || allText.includes("privacy") || allText.includes("cryptography"),
    isBioFocused: allText.includes("bio") || allText.includes("medical") || allText.includes("health"),
    primaryDomains: interests.slice(0, 3), // Top 3 research interests
  }
}

// Project generation functions
function generateMLProjects(
  techSkills: any,
  academicLevel: string,
  researchFocus: any,
  userSkills: string[],
  userInterests: string[]
): ProjectSuggestion[] {
  const projects: ProjectSuggestion[] = []

  // Dynamically generate projects based on user's specific interests and skills
  const primaryInterests = researchFocus.primaryDomains || []
  const _hasDeepLearning =
    techSkills.programmingLanguages.includes("Python") &&
    userSkills.some((s) => s.toLowerCase().includes("deep learning"))
  const hasNLP = userInterests.some((i) => i.toLowerCase().includes("language") || i.toLowerCase().includes("text"))
  const hasCV = userInterests.some((i) => i.toLowerCase().includes("vision") || i.toLowerCase().includes("image"))

  // Generate interest-specific ML projects
  if (hasNLP || userInterests.some((i) => i.toLowerCase().includes("nlp"))) {
    projects.push({
      title: `${primaryInterests[0] ? `${primaryInterests[0]} ` : ""}Natural Language Processing System`,
      description: `Develop an advanced NLP system specifically for ${primaryInterests[0] || "research"} domain that can process, analyze, and extract insights from textual data relevant to your field.`,
      skillsRequired: ["Python", "NLP", "Transformers", "BERT", "spaCy"],
      researchAreas: ["Natural Language Processing", primaryInterests[0] || "Text Analysis"],
      difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: academicLevel === "Advanced" ? "3-4 months" : "2-3 months",
      category: "AI/ML - NLP",
      matchScore: 0,
    })
  }

  if (hasCV || userInterests.some((i) => i.toLowerCase().includes("computer vision"))) {
    projects.push({
      title: `${primaryInterests[0] ? `${primaryInterests[0]} ` : ""}Computer Vision Application`,
      description: `Build a computer vision system tailored for ${primaryInterests[0] || "your research domain"} that can analyze, classify, and extract patterns from visual data.`,
      skillsRequired: ["Python", "Computer Vision", "OpenCV", "CNN", "PyTorch"],
      researchAreas: ["Computer Vision", primaryInterests[0] || "Image Analysis"],
      difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: "2-4 months",
      category: "AI/ML - Computer Vision",
      matchScore: 0,
    })
  }

  // Domain-specific projects based on research interests
  if (researchFocus.isBioFocused) {
    projects.push({
      title: "AI-Powered Biomedical Research Assistant",
      description:
        "Create an intelligent system that assists in biomedical research by analyzing medical literature, predicting drug interactions, and identifying potential research directions.",
      skillsRequired: ["Python", "Bioinformatics", "Machine Learning", "Medical Data", "Research"],
      researchAreas: ["Bioinformatics", "Medical AI", "Healthcare Technology"],
      difficulty: "Advanced",
      estimatedDuration: "4-6 months",
      category: "AI/ML - Biomedical",
      matchScore: 0,
    })
  }

  if (researchFocus.isSecurityFocused) {
    projects.push({
      title: "ML-Based Cybersecurity Threat Detection",
      description:
        "Develop machine learning models for real-time cybersecurity threat detection and response, incorporating privacy-preserving techniques.",
      skillsRequired: ["Python", "Cybersecurity", "Machine Learning", "Anomaly Detection", "Privacy"],
      researchAreas: ["Cybersecurity", "Machine Learning", "Privacy"],
      difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: "3-5 months",
      category: "AI/ML - Security",
      matchScore: 0,
    })
  }

  // Add a general project only if no specific interests match
  if (projects.length === 0) {
    projects.push({
      title: "Personalized Research Recommendation Engine",
      description:
        "Build an AI system that analyzes academic papers, researcher profiles, and citation networks to recommend relevant research directions and collaborations.",
      skillsRequired: ["Python", "Machine Learning", "Graph Neural Networks", "Recommendation Systems"],
      researchAreas: ["Machine Learning", "Information Retrieval", "Academic Analytics"],
      difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: "3-4 months",
      category: "AI/ML",
      matchScore: 0,
    })
  }

  return projects
}

function generateWebProjects(
  techSkills: any,
  academicLevel: string,
  researchFocus: any,
  userSkills: string[],
  userInterests: string[]
): ProjectSuggestion[] {
  const projects: ProjectSuggestion[] = []
  const primaryInterests = researchFocus.primaryDomains || []

  // Generate domain-specific web applications
  const mainDomain = primaryInterests[0] || "research"

  projects.push({
    title: `${mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1)} Collaboration Platform`,
    description: `Create a specialized web platform for ${mainDomain} researchers that facilitates collaboration, project management, and knowledge sharing within your specific field.`,
    skillsRequired: ["React", "Next.js", "Node.js", "Database Design", "API Development"],
    researchAreas: ["Human-Computer Interaction", "Social Computing", mainDomain],
    difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
    estimatedDuration: "2-4 months",
    category: `Web Development - ${mainDomain}`,
    matchScore: 0,
  })

  // Add data visualization if user has data interests
  if (researchFocus.isDataFocused || userInterests.some((i) => i.toLowerCase().includes("data"))) {
    projects.push({
      title: `Interactive ${mainDomain} Data Dashboard`,
      description: `Build a dynamic web application that visualizes ${mainDomain} research data, trends, and patterns with real-time updates and interactive features.`,
      skillsRequired: ["JavaScript", "D3.js", "React", "Data Visualization", "APIs"],
      researchAreas: ["Information Visualization", "Data Science", mainDomain],
      difficulty: "Intermediate",
      estimatedDuration: "2-3 months",
      category: "Data Visualization",
      matchScore: 0,
    })
  }

  // Add education platform if academic level suggests teaching interest
  if (academicLevel === "Advanced") {
    projects.push({
      title: `${mainDomain} Educational Platform`,
      description: `Develop an e-learning platform specifically designed for ${mainDomain} education with adaptive learning paths, assessment tools, and progress tracking.`,
      skillsRequired: ["React", "Learning Management", "Database", "User Authentication", "Progressive Web Apps"],
      researchAreas: ["Educational Technology", "Human-Computer Interaction", mainDomain],
      difficulty: "Advanced",
      estimatedDuration: "3-5 months",
      category: "EdTech",
      matchScore: 0,
    })
  }

  return projects
}

function generateDataScienceProjects(
  techSkills: any,
  academicLevel: string,
  researchFocus: any,
  userSkills: string[],
  userInterests: string[]
): ProjectSuggestion[] {
  const projects: ProjectSuggestion[] = []
  const primaryInterests = researchFocus.primaryDomains || []
  const mainDomain = primaryInterests[0] || "research"

  // Generate domain-specific data science projects
  projects.push({
    title: `${mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1)} Data Analysis Pipeline`,
    description: `Develop an automated pipeline specifically for processing and analyzing ${mainDomain} data, including domain-specific preprocessing, feature extraction, and statistical insights.`,
    skillsRequired: ["Python", "Pandas", "Scikit-learn", "Data Analysis", "Statistics"],
    researchAreas: ["Data Science", "Statistical Analysis", mainDomain],
    difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
    estimatedDuration: "2-3 months",
    category: `Data Science - ${mainDomain}`,
    matchScore: 0,
  })

  // Specialized projects based on research focus
  if (researchFocus.isBioFocused) {
    projects.push({
      title: "Genomic Data Mining and Biomarker Discovery",
      description:
        "Apply advanced data mining techniques to genomic and clinical datasets to discover potential biomarkers and predict treatment outcomes.",
      skillsRequired: ["Python", "R", "Bioinformatics", "Genomics", "Machine Learning", "Statistics"],
      researchAreas: ["Bioinformatics", "Genomics", "Precision Medicine"],
      difficulty: "Advanced",
      estimatedDuration: "4-6 months",
      category: "Biomedical Data Science",
      matchScore: 0,
    })
  } else if (researchFocus.isSecurityFocused) {
    projects.push({
      title: "Cybersecurity Analytics and Threat Intelligence",
      description:
        "Develop data science solutions for analyzing security logs, network traffic, and threat intelligence to identify patterns and predict cyber attacks.",
      skillsRequired: ["Python", "Security Analytics", "Network Analysis", "Machine Learning", "Threat Intelligence"],
      researchAreas: ["Cybersecurity", "Data Science", "Network Security"],
      difficulty: "Advanced",
      estimatedDuration: "3-5 months",
      category: "Security Data Science",
      matchScore: 0,
    })
  } else if (userInterests.some((i) => i.toLowerCase().includes("social") || i.toLowerCase().includes("behavior"))) {
    projects.push({
      title: "Social Media and Behavioral Data Analytics",
      description:
        "Analyze social media data and user behavior patterns to understand trends, sentiment, and social dynamics in your research domain.",
      skillsRequired: ["Python", "Social Network Analysis", "NLP", "Sentiment Analysis", "Data Visualization"],
      researchAreas: ["Social Computing", "Behavioral Analytics", "Digital Humanities"],
      difficulty: "Intermediate",
      estimatedDuration: "2-4 months",
      category: "Social Data Science",
      matchScore: 0,
    })
  }

  return projects
}

function generateResearchProjects(
  scholarData: any,
  techSkills: any,
  academicLevel: string,
  userSkills: string[],
  userInterests: string[]
): ProjectSuggestion[] {
  const projects: ProjectSuggestion[] = []
  const publications = scholarData.publications || []
  const primaryInterests = userInterests.slice(0, 3)
  const hasHighCitations = scholarData.totalCitations > 50

  // Generate projects based on publication history and interests
  if (publications.length > 0) {
    const recentPubs = publications.slice(0, 3)
    const _pubTopics = recentPubs.map((p: any) => p.title || "").join(" ")

    projects.push({
      title: `Advanced ${primaryInterests[0] || "Research"} Analytics Platform`,
      description: `Building on your publication history in ${primaryInterests[0] || "your field"}, develop a comprehensive analytics platform that tracks research impact, collaboration networks, and emerging trends in your domain.`,
      skillsRequired: ["Data Analysis", "Machine Learning", "Network Analysis", "API Integration", "Research Methods"],
      researchAreas: ["Bibliometrics", "Research Analytics", primaryInterests[0] || "Information Science"],
      difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: "3-4 months",
      category: `Research Analytics - ${primaryInterests[0] || "General"}`,
      matchScore: 0,
    })
  }

  if (hasHighCitations && publications.length > 5) {
    projects.push({
      title: "AI-Powered Literature Review and Gap Analysis Tool",
      description: `Leveraging your research expertise and publication record, create an advanced tool that automatically surveys literature in ${primaryInterests[0] || "your field"}, identifies research gaps, and suggests novel research directions.`,
      skillsRequired: ["NLP", "Machine Learning", "Information Retrieval", "Text Analysis", "Academic APIs"],
      researchAreas: [
        "Natural Language Processing",
        "Information Retrieval",
        primaryInterests[0] || "Research Methods",
      ],
      difficulty: "Advanced",
      estimatedDuration: "4-5 months",
      category: "Research Tools",
      matchScore: 0,
    })
  }

  // Project based on collaboration potential
  if (scholarData.hIndex && scholarData.hIndex > 5) {
    projects.push({
      title: "Research Collaboration Recommendation Engine",
      description: `Using your established research profile and network, build an intelligent system that recommends potential collaborators, funding opportunities, and research partnerships in ${primaryInterests[0] || "your field"}.`,
      skillsRequired: [
        "Graph Analytics",
        "Machine Learning",
        "Network Science",
        "Academic APIs",
        "Recommendation Systems",
      ],
      researchAreas: ["Social Network Analysis", "Research Collaboration", primaryInterests[0] || "Academic Networks"],
      difficulty: "Advanced",
      estimatedDuration: "3-5 months",
      category: "Academic Networking",
      matchScore: 0,
    })
  }

  return projects
}

function generateInterdisciplinaryProjects(
  techSkills: any,
  academicLevel: string,
  researchFocus: any,
  userSkills: string[],
  userInterests: string[]
): ProjectSuggestion[] {
  const projects: ProjectSuggestion[] = []
  const primaryInterests = researchFocus.primaryDomains || []
  const secondaryInterests = userInterests.slice(1, 3)

  // Create interdisciplinary projects combining user's multiple interests
  if (primaryInterests.length > 0 && secondaryInterests.length > 0) {
    projects.push({
      title: `${primaryInterests[0]} and ${secondaryInterests[0]} Integration Platform`,
      description: `Build a comprehensive system that bridges ${primaryInterests[0]} and ${secondaryInterests[0]}, enabling cross-disciplinary research, collaboration, and knowledge discovery.`,
      skillsRequired: ["Knowledge Representation", "Data Integration", "API Development", "Cross-domain Analysis"],
      researchAreas: [primaryInterests[0], secondaryInterests[0], "Interdisciplinary Studies"],
      difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: "3-5 months",
      category: `Interdisciplinary - ${primaryInterests[0]}/${secondaryInterests[0]}`,
      matchScore: 0,
    })
  }

  if (
    researchFocus.isHCIFocused ||
    userInterests.some((i) => i.toLowerCase().includes("interface") || i.toLowerCase().includes("user"))
  ) {
    const domain = primaryInterests[0] || "research"
    projects.push({
      title: `Adaptive ${domain} Interface Design`,
      description: `Design and develop adaptive user interfaces specifically for ${domain} tools that automatically adjust based on user expertise, research context, and domain-specific workflows.`,
      skillsRequired: ["UX/UI Design", "JavaScript", "User Research", "Adaptive Systems", "Domain Knowledge"],
      researchAreas: ["Human-Computer Interaction", "Adaptive Systems", domain],
      difficulty: "Intermediate",
      estimatedDuration: "2-3 months",
      category: `HCI - ${domain}`,
      matchScore: 0,
    })
  }

  // Add a general interdisciplinary project if no specific combinations found
  if (projects.length === 0) {
    projects.push({
      title: "Multi-Domain Knowledge Discovery System",
      description:
        "Create a system that discovers connections and patterns across multiple research domains, facilitating interdisciplinary insights and collaboration opportunities.",
      skillsRequired: ["Graph Databases", "Machine Learning", "Data Mining", "Semantic Web", "API Integration"],
      researchAreas: ["Knowledge Management", "Information Systems", "Interdisciplinary Studies"],
      difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: "3-5 months",
      category: "Knowledge Systems",
      matchScore: 0,
    })
  }

  return projects
}

function generateOpenSourceProjects(
  techSkills: any,
  academicLevel: string,
  userSkills: string[],
  userInterests: string[]
): ProjectSuggestion[] {
  const projects: ProjectSuggestion[] = []
  const primaryDomain = userInterests[0] || "research"
  const hasAdvancedSkills = techSkills.programmingLanguages.length > 2

  projects.push({
    title: `Open Source ${primaryDomain.charAt(0).toUpperCase() + primaryDomain.slice(1)} Toolkit`,
    description: `Contribute to or create open-source tools specifically designed for ${primaryDomain} researchers, including data collection, analysis, and visualization utilities tailored to your field.`,
    skillsRequired: [
      "Programming",
      "Software Engineering",
      "Documentation",
      "Testing",
      "Git",
      "Open Source Development",
    ],
    researchAreas: ["Software Engineering", "Research Methods", primaryDomain],
    difficulty: academicLevel === "Beginner" ? "Beginner" : "Intermediate",
    estimatedDuration: "1-3 months",
    category: `Open Source - ${primaryDomain}`,
    matchScore: 0,
  })

  if (hasAdvancedSkills && academicLevel !== "Beginner") {
    projects.push({
      title: `${primaryDomain} Reproducibility and Collaboration Platform`,
      description: `Develop an open-source platform specifically for ${primaryDomain} research that ensures reproducibility through containerization, version control, and standardized workflows.`,
      skillsRequired: ["Docker", "Git", "CI/CD", "Documentation", "Testing", "Research Workflows"],
      researchAreas: ["Open Science", "Reproducible Research", primaryDomain],
      difficulty: academicLevel as "Beginner" | "Intermediate" | "Advanced",
      estimatedDuration: "2-4 months",
      category: `Open Science - ${primaryDomain}`,
      matchScore: 0,
    })
  }

  // Add educational component for advanced users
  if (academicLevel === "Advanced") {
    projects.push({
      title: `${primaryDomain} Education and Training Resources`,
      description: `Create open educational resources, tutorials, and training materials for ${primaryDomain} research methods, making advanced techniques accessible to the broader research community.`,
      skillsRequired: [
        "Educational Design",
        "Content Creation",
        "Web Development",
        "Video Production",
        "Community Building",
      ],
      researchAreas: ["Educational Technology", "Open Education", primaryDomain],
      difficulty: "Intermediate",
      estimatedDuration: "2-4 months",
      category: `Open Education - ${primaryDomain}`,
      matchScore: 0,
    })
  }

  return projects
}

function calculateMatchScore(
  suggestion: ProjectSuggestion,
  techSkills: any,
  academicLevel: string,
  researchFocus: any,
  userSkills: string[],
  userInterests: string[]
): number {
  let score = 40 // Lower base score to make personalization more impactful

  // Skill matching (35 points max) - increased weight
  const requiredSkills = suggestion.skillsRequired.map((s) => s.toLowerCase())
  const userSkillsLower = userSkills.map((s) => s.toLowerCase())
  const skillMatches = requiredSkills.filter((req) =>
    userSkillsLower.some((user) => user.includes(req) || req.includes(user))
  ).length
  score += (skillMatches / requiredSkills.length) * 35

  // Research area matching (30 points max) - increased weight
  const researchAreas = suggestion.researchAreas.map((r) => r.toLowerCase())
  const userInterestsLower = userInterests.map((i) => i.toLowerCase())
  const researchMatches = researchAreas.filter((area) =>
    userInterestsLower.some((interest) => interest.includes(area) || area.includes(interest))
  ).length
  score += (researchMatches / Math.max(researchAreas.length, 1)) * 30

  // Personalization bonus (20 points max) - new scoring for domain-specific projects
  const categoryLower = suggestion.category.toLowerCase()
  const titleLower = suggestion.title.toLowerCase()
  const descriptionLower = suggestion.description.toLowerCase()

  // Bonus for projects that mention user's specific interests
  userInterests.forEach((interest) => {
    const interestLower = interest.toLowerCase()
    if (
      titleLower.includes(interestLower) ||
      descriptionLower.includes(interestLower) ||
      categoryLower.includes(interestLower)
    ) {
      score += 5 // Up to 20 points if 4+ interests match
    }
  })

  // Difficulty matching (15 points max) - reduced weight
  if (suggestion.difficulty === academicLevel) {
    score += 15
  } else if (
    (suggestion.difficulty === "Intermediate" && academicLevel === "Advanced") ||
    (suggestion.difficulty === "Beginner" && academicLevel === "Intermediate")
  ) {
    score += 8
  }

  // Category bonuses (10 points max) - reduced weight
  if (suggestion.category.includes("AI") && techSkills.hasML) score += 10
  if (suggestion.category.includes("Web") && techSkills.hasWeb) score += 10
  if (suggestion.category.includes("Data") && techSkills.hasDataScience) score += 10
  if (suggestion.category.includes("Research") && userInterests.length > 0) score += 8

  // Domain-specific bonuses (10 points max)
  if (researchFocus.isMLFocused && suggestion.category.includes("AI")) score += 10
  if (researchFocus.isDataFocused && suggestion.category.includes("Data")) score += 10
  if (researchFocus.isHCIFocused && suggestion.category.includes("HCI")) score += 10
  if (researchFocus.isBioFocused && suggestion.category.includes("Bio")) score += 10
  if (researchFocus.isSecurityFocused && suggestion.category.includes("Security")) score += 10

  return Math.min(Math.round(score), 100) // Cap at 100
}

export async function POST(request: NextRequest) {
  try {
    // Enhanced security and rate limiting
    const securityCheck = await SecurityValidator.validateRequest(request)
    if (!securityCheck.success) {
      return NextResponse.json(
        { error: securityCheck.error },
        { status: securityCheck.code === "RATE_LIMITED" ? 429 : 403 }
      )
    }

    const rateLimitResult = await EnhancedRateLimit.checkLimit(request, "suggestions")
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime?.toString() || "",
          },
        }
      )
    }

    // Parse and validate request body
    let requestData
    try {
      requestData = await request.json()
    } catch {
      SecurityValidator.recordFailure(request, "Invalid JSON")
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Sanitize input data
    const sanitizedData = SecurityValidator.sanitizeInput(requestData)
    const { resumeData, scholarData } = sanitizedData

    if (!resumeData && !scholarData) {
      SecurityValidator.recordFailure(request, "Missing required data")
      return NextResponse.json({ error: "Either resume data or scholar data is required" }, { status: 400 })
    }

    // Additional data validation
    const dataValidation = SecurityValidator.validateData(sanitizedData)
    if (!dataValidation.success) {
      SecurityValidator.recordFailure(request, "Data validation failed")
      return NextResponse.json({ error: dataValidation.error }, { status: 400 })
    }

    // Generate project suggestions
    const suggestions = generateProjectSuggestions(resumeData, scholarData)

    // Add security headers and return response
    const response = NextResponse.json({ suggestions })
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())

    return response
  } catch (error) {
    console.error("Suggestion generation error:", error)
    SecurityValidator.recordFailure(request, "Internal server error")
    return NextResponse.json({ error: "Failed to generate project suggestions" }, { status: 500 })
  }
}
