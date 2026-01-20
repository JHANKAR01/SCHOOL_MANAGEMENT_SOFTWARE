import React, { useState } from 'react';
import { mapColumnsWithAI } from '../../../../packages/api/src/ai-importer';

// Mock Data for Dashboard
const MOCK_REVENUE = {
  total_collected: 4500000,
  active_schools: 12,
  savings_vs_gateway: 90000 // 2% saved
};

export default function SuperAdminOnboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primary_color: '#000000',
    features: {
      enable_transport: false,
      enable_biometric: false,
      enable_hostel: false
    }
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [aiMapping, setAiMapping] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // --- Step 1: School Details & Feature Flags ---
  const handleFeatureToggle = (feature: keyof typeof formData.features) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  // --- Step 2: AI Data Import ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const runAiMapping = async () => {
    if (!csvFile) return;
    setLoadingAI(true);
    
    // Simulate reading headers from CSV
    // In real app: parse CSV here
    const mockHeaders = ["Roll No", "Bacche Ka Naam", "Pita Ji", "Phone"];
    
    try {
      // Call our Gemini wrapper
      // In a real app, this would be an API call to the backend
      // const mapping = await fetch('/api/ai-import', ...);
      
      // Simulating the AI response for the UI preview
      console.log("Calling Gemini with headers:", mockHeaders);
      setTimeout(() => {
        setAiMapping({
          mapping: [
            { csvHeader: "Roll No", standardField: "roll_number", confidence: 0.95 },
            { csvHeader: "Bacche Ka Naam", standardField: "student_name", confidence: 0.92 },
            { csvHeader: "Pita Ji", standardField: "father_name", confidence: 0.88 },
            { csvHeader: "Phone", standardField: "contact_number", confidence: 0.90 },
          ]
        });
        setLoadingAI(false);
      }, 1500);
      
    } catch (e) {
      console.error(e);
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Super Admin Header */}
      <header className="bg-gray-900 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider">SOVEREIGN <span className="text-indigo-400">CONTROL</span></h1>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase">Global Revenue (Zero-Fee)</p>
            <p className="text-lg font-mono text-green-400">₹{MOCK_REVENUE.total_collected.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 p-4">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          <div className={`h-2 w-16 rounded ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
          <div className={`h-2 w-16 rounded ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
        </div>

        {step === 1 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Create New Sovereign School</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">School Name</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Greenwood High"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug (Subdomain)</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  placeholder="e.g. greenwood"
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Feature Flags (Sovereign Toggle)</h3>
              <div className="space-y-3">
                {Object.keys(formData.features).map((feature) => (
                  <div key={feature} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="font-mono text-sm">{feature}</span>
                    <button
                      onClick={() => handleFeatureToggle(feature as keyof typeof formData.features)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.features[feature as keyof typeof formData.features] ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                         formData.features[feature as keyof typeof formData.features] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium"
              >
                Next: Data Import &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-2">Day 1 Data Solver</h2>
            <p className="text-gray-500 mb-6 text-sm">Upload a messy CSV. Gemini will map "Pita Ji" to "father_name".</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-white transition-colors">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-indigo-600 font-medium">Click to upload CSV</div>
                <div className="text-xs text-gray-400 mt-1">{csvFile ? csvFile.name : "No file selected"}</div>
              </label>
            </div>

            {csvFile && !aiMapping && (
              <button 
                onClick={runAiMapping}
                disabled={loadingAI}
                className="mt-4 w-full bg-gray-900 text-white py-2 rounded flex justify-center items-center"
              >
                {loadingAI ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Asking Gemini...
                  </>
                ) : "Identify Columns (AI)"}
              </button>
            )}

            {aiMapping && (
              <div className="mt-6">
                <h3 className="font-bold mb-3">AI Proposed Mapping</h3>
                <div className="bg-white border rounded divide-y">
                  {aiMapping.mapping.map((m: any, i: number) => (
                    <div key={i} className="p-3 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                         <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded border">{m.csvHeader}</span>
                         <span className="text-gray-400">&rarr;</span>
                         <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-mono">{m.standardField}</span>
                      </div>
                      <span className={`text-xs font-bold ${m.confidence > 0.9 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {Math.round(m.confidence * 100)}% Match
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full bg-green-600 text-white py-2 rounded font-bold shadow-lg hover:bg-green-700">
                  Confirm & Import Students
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
