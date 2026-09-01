export interface AIProjectRequest {
  topic: string;
  studentClass: string;
  language: "bn" | "en";
  subject?: string;
  studentName?: string;
  schoolName?: string;
}

export async function requestAIProject(params: AIProjectRequest) {
  try {
    const res = await fetch("/api/ai/project-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    return data.project;
  } catch (error) {
    console.warn("AI generation failed, fallback applied:", error);
    throw error;
  }
}

export async function requestAIDocumentAssist(docType: string, inputs: Record<string, any>, language: "bn" | "en") {
  try {
    const res = await fetch("/api/ai/document-assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docType, inputs, language }),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    return data.draft;
  } catch (error) {
    console.warn("AI document assist failed:", error);
    throw error;
  }
}
