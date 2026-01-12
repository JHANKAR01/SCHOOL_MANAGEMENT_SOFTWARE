
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SovereignButton, SovereignBadge } from '../../components/SovereignComponents';
import { Download, Calculator, Send, FileText, ChevronDown } from 'lucide-react';
import { DUMMY_STUDENTS } from '../../../api/src/data/dummy-data';
import { generatePDFMarksheet } from '../../../api/src/services/pdf-service';

export const Gradebook = () => {
  const queryClient = useQueryClient();
  const examId = "TERM_1_MATH";
  // CBSE Standard: 20% Internal / 80% Final
  const [weights, setWeights] = useState({ internal: 20, final: 80 });

  const { data: results, isLoading } = useQuery({
    queryKey: ['results', examId],
    queryFn: async () => {
      // Simulate fetch from Genesis Data - filter first 40 students (Class 10-A)
      const students = DUMMY_STUDENTS.filter((s, i) => i < 40);
      return students.map((s, i) => ({
        studentId: s.id,
        name: s.name,
        roll: i + 1, // Roll is now in StudentEnrollment table, using index as mock
        internal: Math.floor(Math.random() * (20 - 12) + 12), // Max 20
        final: Math.floor(Math.random() * (80 - 45) + 45),   // Max 80
      }));
    }
  });

  const processedResults = useMemo(() => {
    if (!results) return [];
    return results.map((r: any) => {
      // Weighted Logic is effectively direct addition if max marks are 20 and 80.
      // If raw marks were out of 100, we would do: (r.internal * 0.2) + (r.final * 0.8)
      const total = r.internal + r.final;

      let grade = 'F';
      if (total >= 91) grade = 'A1';
      else if (total >= 81) grade = 'A2';
      else if (total >= 71) grade = 'B1';
      else if (total >= 61) grade = 'B2';
      else if (total >= 51) grade = 'C1';
      else if (total >= 41) grade = 'C2';
      else if (total >= 33) grade = 'D';

      return { ...r, total, grade };
    });
  }, [results]);

  const markMutation = useMutation({
    mutationFn: async ({ studentId, type, val }: { studentId: string, type: 'internal' | 'final', val: number }) => {
      console.log(`[DEMO] Saving ${type}: ${val} for ${studentId}`);
      return { success: true };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['results'] })
  });

  const generatePDF = async (studentName: string, studentId: string) => {
    // In a real app, we might fetch specific data. Here we pass IDs to the service.
    const url = await generatePDFMarksheet(studentId, examId);
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

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Academic Registry...</div>;

  return (
    <div className="p-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Term 1 Evaluation
          </h2>
          <p className="text-xs text-gray-500">Class 10-A • Mathematics • {processedResults.length} Students</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg flex items-center gap-2 text-xs w-full md:w-auto justify-center">
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

      {/* DESKTOP VIEW (Table) */}
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
            {processedResults.map((r: any) => (
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

      {/* MOBILE VIEW (Cards) - Optimized for "Thumb Zone" */}
      <div className="md:hidden space-y-4 pb-20">
        {processedResults.map((r: any) => (
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
    </div>
  );
};
