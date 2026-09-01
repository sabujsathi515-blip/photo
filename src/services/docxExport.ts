import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { SchoolProjectData, ResumeData } from "../types";

/**
 * Generate and download a formatted School Project as a .docx file
 */
export async function exportProjectToDocx(project: SchoolProjectData) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Cover Page
          new Paragraph({
            text: project.schoolName.toUpperCase() || "NAME OF THE SCHOOL",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Paragraph({
            text: `PROJECT REPORT ON`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
          }),
          new Paragraph({
            text: `"${project.title || project.topic}"`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Subject: ${project.subject}\n`, bold: true }),
              new TextRun({ text: `Academic Year: ${project.academicYear}\n\n` }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          // Student details block
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Submitted by:", bold: true })] }),
                      new Paragraph({ text: `Name: ${project.studentName}` }),
                      new Paragraph({ text: `Class: ${project.studentClass}` }),
                      new Paragraph({ text: `Roll No: ${project.rollNumber}` }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Submitted to:", bold: true })] }),
                      new Paragraph({ text: `Teacher: ${project.teacherName || "Subject Teacher"}` }),
                      new Paragraph({ text: `Department: ${project.subject}` }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: "",
            pageBreakBefore: true,
          }),

          // Introduction
          new Paragraph({
            text: "1. INTRODUCTION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: project.sections.introduction || "N/A",
            spacing: { after: 200 },
          }),

          // Objectives
          new Paragraph({
            text: "2. PROJECT OBJECTIVES",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          ...(project.sections.objectives || []).map(
            (obj) =>
              new Paragraph({
                text: `• ${obj}`,
                spacing: { after: 50 },
              })
          ),

          // Main Content
          new Paragraph({
            text: "3. MAIN CONTENT & OVERVIEW",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: project.sections.mainContent || "N/A",
            spacing: { after: 200 },
          }),

          // Explanation
          new Paragraph({
            text: "4. DETAILED EXPLANATION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: project.sections.explanation || "N/A",
            spacing: { after: 200 },
          }),

          // Key Facts
          new Paragraph({
            text: "5. IMPORTANT FACTS & DATA",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          ...(project.sections.importantFacts || []).map(
            (fact) =>
              new Paragraph({
                text: `• ${fact}`,
                spacing: { after: 50 },
              })
          ),

          // Examples
          new Paragraph({
            text: "6. REAL-LIFE EXAMPLES & CASE STUDIES",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          ...(project.sections.examples || []).map(
            (ex) =>
              new Paragraph({
                text: `• ${ex}`,
                spacing: { after: 50 },
              })
          ),

          // Advantages / Disadvantages
          new Paragraph({
            text: "7. ADVANTAGES & DISADVANTAGES",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ text: "Advantages / Benefits:", children: [new TextRun({ text: "Advantages:", bold: true })] }),
          ...(project.sections.advantages || []).map((adv) => new Paragraph({ text: `+ ${adv}` })),
          new Paragraph({ text: "Challenges / Disadvantages:", children: [new TextRun({ text: "Disadvantages:", bold: true })], spacing: { before: 100 } }),
          ...(project.sections.disadvantages || []).map((dis) => new Paragraph({ text: `- ${dis}` })),

          // Conclusion
          new Paragraph({
            text: "8. CONCLUSION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: project.sections.conclusion || "N/A",
            spacing: { after: 200 },
          }),

          // Bibliography
          new Paragraph({
            text: "9. BIBLIOGRAPHY & REFERENCES",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          ...(project.sections.bibliography || []).map(
            (bib) =>
              new Paragraph({
                text: `[Ref] ${bib}`,
                spacing: { after: 50 },
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeTitle = (project.title || "School_Project").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadBlob(blob, `${safeTitle}.docx`);
}

/**
 * Export Resume to .docx format
 */
export async function exportResumeToDocx(resume: ResumeData) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: resume.fullName.toUpperCase() || "CURRICULUM VITAE",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${resume.designation || ""} | Phone: ${resume.phone} | Email: ${resume.email}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
          }),
          new Paragraph({
            text: `Address: ${resume.address}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          new Paragraph({
            text: "CAREER OBJECTIVE",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 50 },
          }),
          new Paragraph({
            text: resume.careerObjective || "To contribute effectively to organizational growth.",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "EDUCATION & QUALIFICATIONS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 50 },
          }),
          ...(resume.education || []).map(
            (edu) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${edu.degree} - `, bold: true }),
                  new TextRun({ text: `${edu.institution} (${edu.year}) ` }),
                  new TextRun({ text: `[${edu.score}]`, italics: true }),
                ],
                spacing: { after: 50 },
              })
          ),

          new Paragraph({
            text: "SKILLS & EXPERTISE",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 50 },
          }),
          new Paragraph({
            text: resume.skills.join(" • "),
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "LANGUAGES KNOWN",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 50 },
          }),
          new Paragraph({
            text: resume.languages.join(", "),
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "DECLARATION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 50 },
          }),
          new Paragraph({
            text: resume.declaration || "I hereby declare that the details provided above are true to the best of my knowledge.",
            spacing: { after: 300 },
          }),

          new Paragraph({
            text: `Date: ${new Date().toISOString().split("T")[0]}\n\n______________________\n(${resume.fullName})`,
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = (resume.fullName || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadBlob(blob, `${safeName}_CV.docx`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
