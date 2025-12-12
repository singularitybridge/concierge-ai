'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'link';
import Image from 'next/image';
import {
  ArrowLeft, Clock, MapPin, AlertCircle, CheckCircle2,
  Camera, X, Upload, MessageSquare, MoreVertical
} from 'lucide-react';

// Mock task data
const taskData = {
  id: 'room-301-clean',
  title: 'Deep Clean Suite 301',
  location: 'Sky Suite 301',
  priority: 'urgent',
  status: 'in-progress',
  dueTime: '14:00',
  category: 'housekeeping',
  description: 'Express turnover - VIP arriving 2PM. Previous guest checked out early. Deep clean required for all areas including private onsen.',
  instructions: [
    'Replace all bed linens with premium set',
    'Deep clean bathroom and onsen area',
    'Restock all amenities (toiletries, towels, robes)',
    'Check minibar and restock if needed',
    'Vacuum and dust all surfaces',
    'Arrange welcome flowers on dining table',
  ],
  notes: 'VIP guest - Platinum member. Prefers room temperature at 22°C. Arrange welcome sake and personalized note from GM.',
  assignedAt: '10:30 AM',
  estimatedTime: '90 min',
};

type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

export default function TaskDetailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(taskData.status as TaskStatus);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [checkedInstructions, setCheckedInstructions] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckInstruction = (index: number) => {
    setCheckedInstructions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkComplete = () => {
    if (checkedInstructions.length === taskData.instructions.length) {
      setShowPhotoCapture(true);
    } else {
      alert('Please complete all instructions before marking as complete');
    }
  };

  const handleConfirmComplete = () => {
    // In production: upload photo, update task status
    setStatus('completed');
    setShowPhotoCapture(false);
    // Show success feedback
    setTimeout(() => {
      router.push('/staff');
    }, 1500);
  };

  const statusColors: Record<TaskStatus, string> = {
    'pending': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'in-progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'blocked': 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const priorityDotColor =
    taskData.priority === 'urgent' ? 'bg-red-500' :
    taskData.priority === 'high' ? 'bg-orange-500' :
    taskData.priority === 'medium' ? 'bg-amber-500' :
    'bg-white/30';

  const allInstructionsComplete = checkedInstructions.length === taskData.instructions.length;

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Header - Fixed */}
      <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-white/70 hover:text-white active:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-white">Task Details</h1>
          <button className="p-2 -mr-2 text-white/70 hover:text-white active:bg-white/10 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content - Scrollable */}
      <main className="px-4 py-4 pb-32">
        {/* Task Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${priorityDotColor}`} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-medium text-white mb-2">
                {taskData.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-white/50 mb-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{taskData.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Due {taskData.dueTime} • Est. {taskData.estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusColors[status]}`}>
              {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {taskData.priority === 'urgent' && (
              <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold uppercase">
                Urgent
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 mb-4">
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
            Description
          </h3>
          <p className="text-sm text-white/80 leading-relaxed">
            {taskData.description}
          </p>
        </div>

        {/* Instructions Checklist */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 mb-4">
          <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">
            Instructions ({checkedInstructions.length}/{taskData.instructions.length})
          </h3>
          <div className="space-y-3">
            {taskData.instructions.map((instruction, index) => (
              <button
                key={index}
                onClick={() => handleCheckInstruction(index)}
                className="w-full flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl transition-all text-left"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                  checkedInstructions.includes(index)
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-white/30'
                }`}>
                  {checkedInstructions.includes(index) && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className={`text-sm ${
                  checkedInstructions.includes(index)
                    ? 'text-white/50 line-through'
                    : 'text-white'
                }`}>
                  {instruction}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        {taskData.notes && (
          <div className="bg-amber-500/10 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                Important Notes
              </h3>
            </div>
            <p className="text-sm text-amber-200/90 leading-relaxed">
              {taskData.notes}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {status === 'in-progress' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Progress</span>
              <span className="text-xs font-medium text-white">
                {Math.round((checkedInstructions.length / taskData.instructions.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${(checkedInstructions.length / taskData.instructions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Action Buttons - Fixed */}
      {status !== 'completed' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-md border-t border-white/10 px-4 py-4 safe-area-bottom">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-4 px-4 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-xl transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Add Note</span>
            </button>
            <button
              onClick={handleMarkComplete}
              disabled={!allInstructionsComplete}
              className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl transition-all font-medium ${
                allInstructionsComplete
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete</span>
            </button>
          </div>
        </div>
      )}

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center">
          <div className="w-full max-w-md mx-4 bg-stone-900 rounded-3xl border border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-lg font-medium text-white">Task Completion</h3>
              <button
                onClick={() => setShowPhotoCapture(false)}
                className="p-2 -mr-2 text-white/70 hover:text-white active:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Area */}
            <div className="p-5">
              <p className="text-sm text-white/70 mb-4">
                Take a photo of the completed work for verification
              </p>

              {/* Photo Preview or Upload Button */}
              {capturedPhoto ? (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={capturedPhoto}
                    alt="Task completion"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setCapturedPhoto(null)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-400 active:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] bg-white/5 hover:bg-white/10 active:bg-white/15 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all mb-4"
                >
                  <Camera className="w-12 h-12 text-white/40" />
                  <span className="text-sm font-medium text-white/60">
                    Tap to take photo
                  </span>
                </button>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              {/* Optional Note */}
              <div className="mb-4">
                <label className="text-xs text-white/50 mb-2 block">
                  Add completion note (optional)
                </label>
                <textarea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmComplete}
                disabled={!capturedPhoto}
                className={`w-full py-4 rounded-xl font-medium transition-all ${
                  capturedPhoto
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Screen (shown after completion) */}
      {status === 'completed' && (
        <div className="fixed inset-0 z-[100] bg-emerald-500/20 backdrop-blur-md flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-2">Task Completed!</h3>
            <p className="text-white/70">Great work. Returning to dashboard...</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .safe-area-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
