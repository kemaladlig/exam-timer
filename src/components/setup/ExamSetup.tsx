import { useState } from 'react';
import { Button } from '../ui/Button';
import { EXAM_PRESETS } from '../../constants/presets';
import type { ExamTemplate } from '../../types';
import { Clock, Play } from 'lucide-react';
import { formatDurationHuman } from '../../utils';

interface ExamSetupProps {
  onStartExam: (template: ExamTemplate) => void;
}

export function ExamSetup({ onStartExam }: ExamSetupProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(EXAM_PRESETS[0].id);
  const selectedTemplate = EXAM_PRESETS.find(t => t.id === selectedTemplateId) || EXAM_PRESETS[0];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between p-4 md:p-8">
      {/* Top / Massive Clock area */}
      <div className="flex-1 flex flex-col items-center justify-center pt-10 pb-8">
        <h1 className="text-zinc-500 font-medium tracking-widest uppercase mb-4 text-sm">
          Set Exam Duration
        </h1>
        <div className="text-[5rem] md:text-[8rem] font-mono tabular-nums font-bold tracking-tighter text-white leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          {Math.floor(selectedTemplate.totalDurationSeconds / 60)}:00
        </div>
        <div className="text-zinc-400 mt-4 flex items-center gap-2">
          <Clock size={16} />
          <span>{formatDurationHuman(selectedTemplate.totalDurationSeconds)}</span>
        </div>
      </div>

      {/* Bottom Setup Menu */}
      <div className="w-full max-w-lg mx-auto bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Select Mode</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {EXAM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedTemplateId(preset.id)}
              className={`text-left p-4 rounded-2xl transition-all duration-300 ${
                selectedTemplateId === preset.id 
                  ? 'bg-zinc-800 border-zinc-700 shadow-lg scale-[1.02]'
                  : 'bg-zinc-950/50 border-zinc-900 hover:bg-zinc-900'
              } border`}
            >
              <h3 className={`font-semibold ${selectedTemplateId === preset.id ? 'text-white' : 'text-zinc-400'}`}>
                {preset.name}
              </h3>
            </button>
          ))}
        </div>

        <Button 
          size="lg" 
          fullWidth 
          className="rounded-2xl py-6 text-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300"
          onClick={() => onStartExam(selectedTemplate)}
        >
          <Play fill="currentColor" className="mr-2" size={24} />
          Start Focus Mode
        </Button>
      </div>
    </div>
  );
}
