'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight, Clock, MapPin, Camera, CheckCircle2, AlertTriangle,
  MessageSquare, Phone, RefreshCw, Loader2, X, Send, ChevronDown,
  Coffee, Pause, LogOut as LogOutIcon, Sparkles, SwitchCamera
} from 'lucide-react';

// Types
interface StaffTask {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  dueTime: string;
  category: string;
  checklist?: { id: string; label: string; done: boolean }[];
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'available' | 'busy' | 'break' | 'off-duty';
  supervisor: {
    name: string;
    avatar: string;
    phone: string;
  };
  tasks: StaffTask[];
}

// Mock data for a housekeeping staff member
const mockStaffMember: StaffMember = {
  id: 'staff-001',
  name: 'Sakura Tanaka',
  role: 'Housekeeping',
  avatar: '/avatars/staff-1.jpg',
  status: 'available',
  supervisor: {
    name: 'Mika Hayashi',
    avatar: '/avatars/operations-avatar.jpg',
    phone: '+81-136-xx-xxxx',
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Room 301 - Full Turnover',
      description: 'Deep clean and prepare for VIP guest arriving at 3PM. Fresh flowers requested.',
      location: 'Suite 301',
      priority: 'high',
      status: 'pending',
      dueTime: '14:00',
      category: 'Turnover',
      checklist: [
        { id: 'c1', label: 'Strip and replace all linens', done: false },
        { id: 'c2', label: 'Deep clean bathroom', done: false },
        { id: 'c3', label: 'Vacuum and mop floors', done: false },
        { id: 'c4', label: 'Restock minibar', done: false },
        { id: 'c5', label: 'Place fresh flowers', done: false },
        { id: 'c6', label: 'Final inspection', done: false },
      ],
    },
    {
      id: 'task-2',
      title: 'Room 205 - Minibar Restock',
      description: 'Guest requested additional sake and snacks. Check preferences in notes.',
      location: 'Room 205',
      priority: 'medium',
      status: 'pending',
      dueTime: '15:30',
      category: 'Service',
      checklist: [
        { id: 'c1', label: 'Restock sake (Dassai 23)', done: false },
        { id: 'c2', label: 'Add premium snack selection', done: false },
        { id: 'c3', label: 'Replace used glasses', done: false },
      ],
    },
    {
      id: 'task-3',
      title: 'Lobby - Evening Turndown Prep',
      description: 'Prepare turndown amenities for all occupied suites.',
      location: 'Housekeeping Storage',
      priority: 'low',
      status: 'pending',
      dueTime: '17:00',
      category: 'Prep',
      checklist: [
        { id: 'c1', label: 'Prepare 6 turndown trays', done: false },
        { id: 'c2', label: 'Stock chocolate selections', done: false },
        { id: 'c3', label: 'Prepare slippers and robes', done: false },
      ],
    },
    {
      id: 'task-4',
      title: 'Room 102 - Quick Service',
      description: 'Extra towels and toiletries requested by guest.',
      location: 'Room 102',
      priority: 'medium',
      status: 'completed',
      dueTime: '11:00',
      category: 'Request',
    },
  ],
};

const statusConfig = {
  'available': { label: 'Available', color: 'bg-emerald-500', textColor: 'text-emerald-400', icon: Sparkles },
  'busy': { label: 'Busy', color: 'bg-amber-500', textColor: 'text-amber-400', icon: RefreshCw },
  'break': { label: 'On Break', color: 'bg-blue-500', textColor: 'text-blue-400', icon: Coffee },
  'off-duty': { label: 'Off Duty', color: 'bg-stone-500', textColor: 'text-stone-400', icon: Pause },
};

const priorityConfig = {
  'low': { color: 'bg-stone-500', borderColor: 'border-stone-500/30' },
  'medium': { color: 'bg-amber-500', borderColor: 'border-amber-500/30' },
  'high': { color: 'bg-orange-500', borderColor: 'border-orange-500/30' },
  'urgent': { color: 'bg-red-500', borderColor: 'border-red-500/30' },
};

export default function MyShiftPage() {
  const [staff, setStaff] = useState<StaffMember>(mockStaffMember);
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [reportText, setReportText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const pendingTasks = staff.tasks.filter(t => t.status !== 'completed');
  const completedTasks = staff.tasks.filter(t => t.status === 'completed');

  // Camera functions
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please grant permission.');
      setCameraActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoPreview(photoDataUrl);

    // Stop camera after capture
    stopCamera();
  }, [stopCamera]);

  const switchCameraFacing = useCallback(async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);

    // If camera is active, restart with new facing mode
    if (cameraActive) {
      stopCamera();
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newFacing },
            audio: false,
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setCameraActive(true);
        } catch (err) {
          console.error('Camera switch error:', err);
        }
      }, 100);
    }
  }, [facingMode, cameraActive, stopCamera]);

  // Cleanup camera on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStatusChange = (newStatus: StaffMember['status']) => {
    setStaff(prev => ({ ...prev, status: newStatus }));
    setShowStatusMenu(false);
  };

  const handleTaskClick = (task: StaffTask) => {
    setSelectedTask(task);
  };

  const handleChecklistToggle = (taskId: string, checkId: string) => {
    setStaff(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => {
        if (task.id === taskId && task.checklist) {
          return {
            ...task,
            checklist: task.checklist.map(item =>
              item.id === checkId ? { ...item, done: !item.done } : item
            ),
          };
        }
        return task;
      }),
    }));

    // Update selected task too
    if (selectedTask?.id === taskId && selectedTask.checklist) {
      setSelectedTask(prev => prev ? {
        ...prev,
        checklist: prev.checklist?.map(item =>
          item.id === checkId ? { ...item, done: !item.done } : item
        ),
      } : null);
    }
  };

  const handleCompleteTask = () => {
    setShowPhotoModal(true);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCompletion = async () => {
    if (!selectedTask) return;

    setIsSubmitting(true);
    // Simulate API call - sending photo to supervisor
    await new Promise(resolve => setTimeout(resolve, 1500));

    const taskTitle = selectedTask.title;

    // Update task status
    setStaff(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === selectedTask.id ? { ...task, status: 'completed' as const } : task
      ),
    }));

    setIsSubmitting(false);
    setShowPhotoModal(false);
    setPhotoPreview(null);
    setCompletionNote('');
    setSelectedTask(null);
    setSuccessMessage(`Photo sent! "${taskTitle}" marked complete`);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowReportModal(false);
    setReportText('');
    setSuccessMessage('Issue reported to supervisor');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowMessageModal(false);
    setMessageText('');
    setSuccessMessage(`Message sent to ${staff.supervisor.name}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-stone-900 text-white pb-24">
      {/* Header - Staff Profile */}
      <div className="bg-stone-800/50 border-b border-white/10">
        <div className="px-4 pt-6 pb-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs" style={{ fontFamily: 'var(--font-cormorant)' }}>18</span>
              </div>
              <span className="text-sm text-white/70">The 1898 Niseko</span>
            </Link>
            <span className="text-sm text-white/50">{currentTime}</span>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20">
              <Image
                src={staff.avatar}
                alt={staff.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-medium text-white truncate">{staff.name}</h1>
              <p className="text-sm text-white/60">{staff.role}</p>
            </div>
          </div>

          {/* Status Selector */}
          <div className="mt-4 relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusConfig[staff.status].color}`} />
                <span className="text-sm">My Status: <span className={statusConfig[staff.status].textColor}>{statusConfig[staff.status].label}</span></span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showStatusMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Status Dropdown */}
            {showStatusMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-stone-800 rounded-xl border border-white/10 overflow-hidden z-50 shadow-xl">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key as StaffMember['status'])}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                      staff.status === key ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <span className="text-sm">{config.label}</span>
                    {staff.status === key && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-4 py-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">
            My Tasks Today
            <span className="ml-2 text-sm text-white/50">({pendingTasks.length} pending)</span>
          </h2>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className={`w-full text-left p-4 bg-white/5 rounded-xl border ${priorityConfig[task.priority].borderColor} hover:bg-white/10 transition-colors`}
            >
              <div className="flex items-start gap-3">
                {/* Priority Indicator */}
                <div className={`w-2 h-2 rounded-full mt-2 ${priorityConfig[task.priority].color}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white truncate pr-2">{task.title}</h3>
                    <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-white/50 line-clamp-1 mb-2">{task.description}</p>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {task.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {task.dueTime}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm text-white/50 mb-3">Completed ({completedTasks.length})</h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl opacity-60"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-through truncate">{task.title}</p>
                    <p className="text-xs text-white/40">{task.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-lg border-t border-white/10 p-4 safe-area-pb">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowStatusMenu(true)}
            className="flex flex-col items-center gap-1 px-3 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-white/70">Update Status</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex flex-col items-center gap-1 px-3 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-white/70">Report Issue</span>
          </button>
          <button
            onClick={() => setShowMessageModal(true)}
            className="flex flex-col items-center gap-1 px-3 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-white/70">Message</span>
          </button>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-stone-900">
            <button
              onClick={() => setSelectedTask(null)}
              className="p-2 -ml-2 text-white/70"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-medium">Task Details</h2>
            <div className="w-9" />
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto bg-stone-900 px-4 py-4">
            {/* Priority Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedTask.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                selectedTask.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                selectedTask.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-stone-500/20 text-stone-400'
              }`}>
                {selectedTask.priority.toUpperCase()}
              </span>
              <span className="px-2 py-1 rounded text-xs bg-white/10 text-white/60">
                {selectedTask.category}
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-medium mb-2">{selectedTask.title}</h3>
            <p className="text-white/60 mb-4">{selectedTask.description}</p>

            {/* Location & Time */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <MapPin className="w-4 h-4" />
                {selectedTask.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Clock className="w-4 h-4" />
                Due {selectedTask.dueTime}
              </div>
            </div>

            {/* Checklist */}
            {selectedTask.checklist && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-white/80">Checklist</h4>
                <div className="space-y-2">
                  {selectedTask.checklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleChecklistToggle(selectedTask.id, item.id)}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 text-left"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        item.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                      }`}>
                        {item.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${item.done ? 'line-through text-white/40' : 'text-white'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-4 py-4 border-t border-white/10 bg-stone-900 safe-area-pb">
            <button
              onClick={handleCompleteTask}
              className="w-full py-4 bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Mark as Complete
            </button>
          </div>
        </div>
      )}

      {/* Photo Capture Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-stone-900">
            <button
              onClick={() => {
                stopCamera();
                setShowPhotoModal(false);
                setPhotoPreview(null);
                setCompletionNote('');
                setCameraError(null);
              }}
              className="p-2 -ml-2 text-white/70"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-medium">
              {photoPreview ? 'Review Photo' : cameraActive ? 'Camera' : 'Take Photo'}
            </h2>
            {cameraActive ? (
              <button
                onClick={switchCameraFacing}
                className="p-2 -mr-2 text-white/70 hover:text-white"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9" />
            )}
          </div>

          <div className="flex-1 flex flex-col bg-stone-900">
            {photoPreview ? (
              <>
                {/* Photo Preview */}
                <div className="flex-1 flex items-center justify-center p-4 bg-black">
                  <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden">
                    <Image
                      src={photoPreview}
                      alt="Completion photo"
                      fill
                      className="object-cover"
                    />
                    {/* Photo timestamp overlay */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-xs text-white/80">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-3 bg-stone-900">
                  {/* Note input */}
                  <input
                    type="text"
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    placeholder="Add a note (optional)..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 text-base"
                  />

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        startCamera();
                      }}
                      className="flex-1 py-4 bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Retake
                    </button>
                    <button
                      onClick={handleSubmitCompletion}
                      disabled={isSubmitting}
                      className="flex-[2] py-4 bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send & Complete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : cameraActive ? (
              /* Live Camera View */
              <div className="flex-1 flex flex-col bg-black">
                {/* Video feed */}
                <div className="flex-1 relative flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera guide overlay */}
                  <div className="absolute inset-4 border-2 border-white/20 rounded-xl pointer-events-none" />
                </div>

                {/* Capture button */}
                <div className="p-6 flex justify-center bg-stone-900/90">
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 rounded-full bg-white border-4 border-stone-500 flex items-center justify-center hover:bg-white/90 active:scale-95 transition-transform"
                  >
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-stone-300" />
                  </button>
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              /* Camera Prompt */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {cameraError ? (
                  <>
                    <div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border-2 border-red-500/30">
                      <AlertTriangle className="w-14 h-14 text-red-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-red-400">Camera Error</h3>
                    <p className="text-white/50 mb-8 max-w-xs">
                      {cameraError}
                    </p>
                    <button
                      onClick={startCamera}
                      className="w-full max-w-xs py-4 bg-amber-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-lg mb-4"
                    >
                      <RefreshCw className="w-6 h-6" />
                      Try Again
                    </button>
                    {/* Fallback to file input */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full max-w-xs py-4 bg-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Choose from Gallery
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 rounded-full bg-amber-500/20 flex items-center justify-center mb-6 border-2 border-amber-500/30">
                      <Camera className="w-14 h-14 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Take a Completion Photo</h3>
                    <p className="text-white/50 mb-8 max-w-xs">
                      Capture the completed task to verify and send to your supervisor
                    </p>
                    <button
                      onClick={startCamera}
                      className="w-full max-w-xs py-4 bg-amber-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-lg"
                    >
                      <Camera className="w-6 h-6" />
                      Open Camera
                    </button>
                    <p className="text-white/30 text-sm mt-4">
                      Photo will be sent to {staff.supervisor.name}
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-stone-900 rounded-t-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 -ml-2 text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-medium">Report an Issue</h2>
              <div className="w-9" />
            </div>
            <div className="p-4">
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none mb-4"
              />
              <button
                onClick={handleSubmitReport}
                disabled={!reportText.trim() || isSubmitting}
                className="w-full py-4 bg-orange-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* Message Supervisor Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-stone-900 rounded-t-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-2 -ml-2 text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-medium">Contact Supervisor</h2>
              <div className="w-9" />
            </div>
            <div className="p-4">
              {/* Supervisor Info */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={staff.supervisor.avatar}
                    alt={staff.supervisor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{staff.supervisor.name}</p>
                  <p className="text-sm text-white/50">Operations Manager</p>
                </div>
                <a
                  href={`tel:${staff.supervisor.phone}`}
                  className="p-3 bg-emerald-500/20 rounded-full"
                >
                  <Phone className="w-5 h-5 text-emerald-400" />
                </a>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none mb-4"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSubmitting}
                className="w-full py-4 bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center gap-3 z-50 animate-in slide-in-from-top shadow-lg">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}
    </div>
  );
}
