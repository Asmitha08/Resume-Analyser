import type { ResumeAnalysisResponse, BulletImprovement } from '../types/analysis';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getStoredApiKey = (): string => {
  return localStorage.getItem('resumeai_gemini_key') || '';
};

export const setStoredApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem('resumeai_gemini_key', key.trim());
  } else {
    localStorage.removeItem('resumeai_gemini_key');
  }
};

const getHeaders = (isJson: boolean = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const key = getStoredApiKey();
  if (key) {
    headers['X-Gemini-Api-Key'] = key;
  }
  return headers;
};

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  gemini_configured: boolean;
}

export interface RolesResponse {
  supported_roles: string[];
  criteria: Record<string, { core_domains: string[]; focus_areas: string }>;
  example_job_descriptions: Record<string, string>;
}

const safeFetch = async (url: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, init);
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.toLowerCase().includes('fetch')) {
      throw new Error(
        `Unable to reach backend service at ${BASE_URL}. Please ensure the FastAPI server is running.`
      );
    }
    throw err;
  }
};

const parseApiError = async (response: Response): Promise<Error> => {
  let errorData: any = null;
  try {
    errorData = await response.json();
  } catch {
    errorData = null;
  }

  let errorMsg = `Server returned status ${response.status}`;
  let errorCode: string | undefined;

  if (errorData && errorData.detail) {
    if (typeof errorData.detail === 'string') {
      errorMsg = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      // FastAPI 422 Unprocessable Entity array
      errorMsg = errorData.detail
        .map((e: any) => {
          const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : '';
          return field ? `${field}: ${e.msg || e.message}` : (e.msg || e.message || JSON.stringify(e));
        })
        .join('; ');
    } else if (typeof errorData.detail === 'object') {
      errorMsg = errorData.detail.message || errorData.detail.detail || JSON.stringify(errorData.detail);
      errorCode = errorData.detail.code;
    }
  }

  const err = new Error(errorMsg) as any;
  err.status = response.status;
  err.code = errorCode;
  return err;
};

export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const res = await safeFetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    if (!res.ok) {
      throw await parseApiError(res);
    }
    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || 'Unable to connect to ResumeAI backend service.');
  }
};

export const getRoles = async (): Promise<RolesResponse> => {
  try {
    const res = await safeFetch(`${BASE_URL}/api/roles`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    if (!res.ok) {
      throw await parseApiError(res);
    }
    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || 'Failed to fetch roles.');
  }
};

export const analyzeResumeFile = async (
  file: File,
  role: string,
  jobDescription: string
): Promise<ResumeAnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('role', role);
  formData.append('job_description', jobDescription);

  const headers = getHeaders(false); // Multipart/form-data sets its own boundary

  const response = await safeFetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return await response.json();
};

export const analyzeResumeText = async (
  resumeText: string,
  role: string,
  jobDescription: string
): Promise<ResumeAnalysisResponse> => {
  const response = await safeFetch(`${BASE_URL}/api/analyze-text`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      resume_text: resumeText,
      role,
      job_description: jobDescription,
      filename: 'Pasted_Resume.txt',
    }),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return await response.json();
};

export const improveBullets = async (
  bullets: string[],
  role: string,
  jobDescription: string = ''
): Promise<BulletImprovement[]> => {
  const response = await safeFetch(`${BASE_URL}/api/improve-resume`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      bullets,
      role,
      job_description: jobDescription,
    }),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return await response.json();
};

export const downloadReportPdf = async (analysisData: ResumeAnalysisResponse): Promise<void> => {
  const response = await safeFetch(`${BASE_URL}/api/download-report`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(analysisData),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Safe filename
  const cleanRole = (analysisData.selected_role || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `ResumeAI_Report_${cleanRole}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
