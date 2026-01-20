
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SovereignButton, SovereignBadge } from '../../components/SovereignComponents';
import { Download, Calculator, Send, FileText, Loader2, AlertCircle } from 'lucide-react';

// PDF generation via API (not direct server import)
const API_BASE = typeof window !== 'undefined'
  ? (window as any).__API_URL__ || 'http://localhost:3001'
  : 'http://localhost:3001';

async function generatePDFMarksheet(studentId: string, examId: string): Promise<string | null> {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_BASE}/api/academics/marksheet/${studentId}/${examId}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

// ============================================================================
// TYPES - Properly typed API response (NO 'any')
// ============================================================================

interface SubjectMark {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string | null;
}

interface GradebookStudent {
  studentId: string;
  name: string;
  admissionNo: string;
  roll: number;
  class: string;
  classId: string;
  resultId: string | null;
  totalPercentage: number | null;
  grade: string | null;
  remarks: string | null;
  subjectMarks: SubjectMark[];
}

interface GradebookResponse {
  success: boolean;
  classId: string;
  examId: string;
  students: GradebookStudent[];
  totalStudents: number;
}

interface ClassOption {
  id: string;
  name: string;
  studentCount: number;
}

interface ClassesResponse {
  success: boolean;
  classes: ClassOption[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

// API_BASE defined above with generatePDFMarksheet

async function fetchGradebook(classId: string, examId: string): Promise<GradebookResponse> {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API_BASE}/api/academics/gradebook/${classId}/${examId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch gradebook');
  return res.json();
}

async function fetchClasses(): Promise<ClassesResponse> {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API_BASE}/api/academics/gradebook/classes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch classes');
  return res.json();
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Gradebook = () => {
  const queryClient = useQueryClient();

  // State for selected class and exam
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_10_A');
  const [selectedExamId, setSelectedExamId] = useState<string>('exam_midterm_2025');

  // CBSE Standard: 20% Internal / 80% Final
  const [weights] = useState({ internal: 20, final: 80 });

  // Fetch available classes
  const { data: classesData } = useQuery({
    queryKey: ['gradebook-classes'],
    queryFn: fetchClasses,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch gradebook data for selected class and exam
  const { data: gradebookData, isLoading, isError, error } = useQuery({
    queryKey: ['gradebook', selectedClassId, selectedExamId],
    queryFn: () => fetchGradebook(selectedClassId, selectedExamId),
    enabled: !!selectedClassId && !!selectedExamId
  });

  // Process results to compute grades (for students without pre-computed grades)
  const processedResults = useMemo(() => {
    if (!gradebookData?.students) return [];

    return gradebookData.students.map((student) => {
      // Calculate internal and final from subject marks if available
      // For now, use the totalPercentage if available, otherwise compute
      let internal = 0;
      let final = 0;

      // If we have subject marks, compute totals
      if (student.subjectMarks.length > 0) {
        const totalObtained = student.subjectMarks.reduce((sum, m) => sum + m.marksObtained, 0);
        const totalMax = student.subjectMarks.reduce((sum, m) => sum + m.maxMarks, 0);
        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

        // Approximate split for display (in real app, this would come from ResultMark)
        internal = Math.round(percentage * 0.2);
        final = Math.round(percentage * 0.8);
      }

      const total = internal + final;

      // Use stored grade or compute it
      let grade = student.grade || 'N/A';
      if (!student.grade && total > 0) {
        if (total >= 91) grade = 'A1';
        else if (total >= 81) grade = 'A2';
        else if (total >= 71) grade = 'B1';
        else if (total >= 61) grade = 'B2';
        else if (total >= 51) grade = 'C1';
        else if (total >= 41) grade = 'C2';
        else if (total >= 33) grade = 'D';
        else grade = 'F';
      }

      return {
        studentId: student.studentId,
        name: student.name,
        roll: student.roll,
        class: student.class,
        internal,
        final,
        total,
        grade
      };
    });
  }, [gradebookData]);

  // Mutation for saving marks
  const markMutation = useMutation({
    mutationFn: async ({ studentId, type, val }: { studentId: string; type: 'internal' | 'final'; val: number }) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/academics/results`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          examId: selectedExamId,
          studentId,
          marks: { [type]: val },
          totalPercentage: null, // Computed server-side
          grade: null
        })
      });
      if (!res.ok) throw new Error('Failed to save marks');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gradebook'] })
  });

  const generatePDF = async (studentName: string, studentId: string) => {
    const url = await generatePDFMarksheet(studentId, selectedExamId);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${studentName}_ReportCard.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Failed to generate PDF");
    }
  };

  // Get current class display name
  const currentClass = classesData?.classes?.find(c => c.id === selectedClassId);
  const classDisplayName = currentClass?.name || selectedClassId.replace('cls_', '').replace('_', '-');

  // Loading State
  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p>Loading Academic Registry...</p>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <p>Error loading gradebook: {(error as Error)?.message || 'Unknown error'}</p>
        <SovereignButton onClick={() => queryClient.invalidateQueries({ queryKey: ['gradebook'] })}>
          Retry
        </SovereignButton>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Term 1 Evaluation
          </h2>
          <p className="text-xs text-gray-500">
            Class {classDisplayName} • {processedResults.length} Students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Class Selector */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {classesData?.classes?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.studentCount} students)
              </option>
            ))}
          </select>

          <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg flex items-center gap-2 text-xs">
            <Calculator className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-indigo-900">CBSE Norms:</span>
            <span>Int {weights.internal}%</span>
            <span className="text-gray-300">|</span>
            <span>Ext {weights.final}%</span>
          </div>
          <SovereignButton icon={<Send className="w-3 h-3" />} className="w-full md:w-auto">
            Publish
          </SovereignButton>
        </div>
      </div>

      {/* Empty State */}
      {processedResults.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <p className="text-yellow-800">No students enrolled in this class for the current academic year.</p>
        </div>
      )}

      {/* DESKTOP VIEW (Table) */}
      {processedResults.length > 0 && (
        <div className="hidden md:block overflow-x-auto border rounded-xl shadow-sm bg-white">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b">
              <tr>
                <th className="px-6 py-4 text-left">Roll</th>
                <th className="px-6 py-4 text-left">Student Name</th>
                <th className="px-4 py-4 text-center w-32">Internal (20)</th>
                <th className="px-4 py-4 text-center w-32">Final (80)</th>
                <th className="px-4 py-4 text-center w-24 bg-indigo-50/50 text-indigo-900 border-x border-indigo-100">Total</th>
                <th className="px-4 py-4 text-center w-24">Grade</th>
                <th className="px-4 py-4 text-center">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedResults.map((r) => (
                <tr key={r.studentId} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-3 text-sm text-gray-500 font-mono">{r.roll}</td>
                  <td className="px-6 py-3 font-bold text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      defaultValue={r.internal}
                      max={20}
                      onBlur={(e) => markMutation.mutate({ studentId: r.studentId, type: 'internal', val: parseFloat(e.target.value) })}
                      className="w-16 border border-gray-300 rounded text-center p-1.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      defaultValue={r.final}
                      max={80}
                      onBlur={(e) => markMutation.mutate({ studentId: r.studentId, type: 'final', val: parseFloat(e.target.value) })}
                      className="w-16 border border-gray-300 rounded text-center p-1.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    />
                  </td>
                  <td className="px-4 py-3 text-center font-black text-indigo-700 bg-indigo-50/30 border-x border-indigo-100">
                    {r.total}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SovereignBadge status={r.grade.startsWith('A') ? 'success' : r.grade === 'F' ? 'error' : 'warning'}>
                      {r.grade}
                    </SovereignBadge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => generatePDF(r.name, r.studentId)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded hover:bg-indigo-50"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE VIEW (Cards) - Optimized for "Thumb Zone" */}
      {processedResults.length > 0 && (
        <div className="md:hidden space-y-4 pb-20">
          {processedResults.map((r) => (
            <div key={r.studentId} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">#{r.roll}</span>
                    <h3 className="font-bold text-gray-900">{r.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <SovereignBadge status={r.grade.startsWith('A') ? 'success' : r.grade === 'F' ? 'error' : 'warning'}>
                      Grade {r.grade}
                    </SovereignBadge>
                    <span className="text-xs text-gray-500 font-medium">Total: {r.total}/100</span>
                  </div>
                </div>
                <button
                  onClick={() => generatePDF(r.name, r.studentId)}
                  className="p-2 bg-gray-50 text-indigo-600 rounded-lg border border-gray-200"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500">Internal (20)</label>
                  <input
                    type="tel"
                    defaultValue={r.internal}
                    className="w-full mt-1 border-gray-300 rounded-md p-2 text-center font-bold text-gray-900 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500">Final (80)</label>
                  <input
                    type="tel"
                    defaultValue={r.final}
                    className="w-full mt-1 border-gray-300 rounded-md p-2 text-center font-bold text-gray-900 shadow-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
