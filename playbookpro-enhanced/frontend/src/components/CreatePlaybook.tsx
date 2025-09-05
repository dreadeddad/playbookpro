import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Save, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface CreatePlaybookProps {
  onSubmit: (data: PlaybookData) => Promise<void>;
  onCancel: () => void;
}

interface PlaybookData {
  title: string;
  description: string;
  category: string;
  plays: Array<{
    step_number: number;
    description: string;
    player_positions: Array<{
      x: number;
      y: number;
      role: string;
      responsibilities: string[];
    }>;
    key_actions: string[];
  }>;
  is_public: boolean;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const CreatePlaybook: React.FC<CreatePlaybookProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [firebaseApp, setFirebaseApp] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('offense');
  const [playTitle, setPlayTitle] = useState('');
  const [playDescription, setPlayDescription] = useState('');
  const [keyActions, setKeyActions] = useState(['', '', '']);
  const [isPublic, setIsPublic] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const categories = [
    { 
      id: 'offense', 
      name: 'Offense', 
      icon: '⚡', 
      color: 'from-blue-500 to-blue-600',
      description: 'Scoring strategies and offensive plays' 
    },
    { 
      id: 'defense', 
      name: 'Defense', 
      icon: '🛡️', 
      color: 'from-red-500 to-red-600',
      description: 'Defensive formations and tactics' 
    },
    { 
      id: 'transition', 
      name: 'Transition', 
      icon: '🏃‍♂️', 
      color: 'from-green-500 to-green-600',
      description: 'Fast break and transition plays' 
    },
  ];

  const samplePositions = [
    { x: 0.5, y: 0.8, role: 'point_guard', responsibilities: ['Control ball', 'Initiate play', 'Read defense'] },
    { x: 0.4, y: 0.6, role: 'center', responsibilities: ['Set screen', 'Roll to basket', 'Create space'] },
    { x: 0.1, y: 0.4, role: 'forward', responsibilities: ['Space the floor', 'Be ready for pass', 'Help on screens'] },
    { x: 0.9, y: 0.4, role: 'forward', responsibilities: ['Space the floor', 'Support offense', 'Rebound position'] },
    { x: 0.7, y: 0.2, role: 'guard', responsibilities: ['Spot up for three', 'Ball movement', 'Help defense'] },
  ];

  // Initialize Firebase on component mount
  useEffect(() => {
    try {
      if (!firebaseConfig.apiKey) {
        console.warn('Firebase configuration missing. File upload will use backend only.');
        return;
      }

      const app = initializeApp(firebaseConfig);
      const storageInstance = getStorage(app);
      
      setFirebaseApp(app);
      setStorage(storageInstance);
      
      console.log('Firebase initialized successfully for file uploads');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      toast.error('Firebase setup issue. File uploads will use backend storage.');
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploadLoading(true);
    
    try {
      // Validate file
      const allowedTypes = ['application/json', 'application/pdf', 'text/plain'];
      const maxSize = 16 * 1024 * 1024; // 16MB
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(json|pdf|txt)$/i)) {
        throw new Error('Invalid file type. Please upload JSON, PDF, or TXT files only.');
      }
      
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 16MB.');
      }

      let uploadResult = null;

      // Try Firebase Storage first (if initialized)
      if (storage) {
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const fileName = `${timestamp}_${file.name}`;
          const storageRef = ref(storage, `playbooks/${fileName}`);
          
          // Upload to Firebase Storage
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          uploadResult = {
            firebase_url: downloadURL,
            storage_type: 'firebase',
            filename: fileName,
            original_name: file.name,
            size: file.size,
            upload_time: new Date().toISOString()
          };
          
          toast.success('File uploaded to Firebase Storage successfully!');
          console.log('Firebase upload successful:', uploadResult);
          
        } catch (firebaseError) {
          console.error('Firebase upload failed:', firebaseError);
          toast.error('Firebase upload failed. Trying backend upload...');
          
          // Fallback to backend upload
          uploadResult = await uploadToBackend(file);
        }
      } else {
        // Direct backend upload
        uploadResult = await uploadToBackend(file);
      }

      setUploadResult(uploadResult);
      setUploadedFile(file);
      
      // If it's a JSON file, try to parse and auto-fill form
      if (file.name.toLowerCase().endsWith('.json') && uploadResult.playbook_created) {
        toast.success('JSON playbook detected! Check your playbooks list.');
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'File upload failed. Please try again.');
      
      // Show user-friendly error alert
      alert(`Upload Failed: ${error.message}\n\nPlease check:\n• File size is under 16MB\n• File type is JSON, PDF, or TXT\n• Internet connection is stable`);
      
    } finally {
      setUploadLoading(false);
    }
  };

  const uploadToBackend = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('coach_id', 'demo_coach'); // In real app, get from auth context
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }
    
    const result = await response.json();
    toast.success('File uploaded to backend successfully!');
    
    return result;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !playTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const playbookData: PlaybookData = {
        title: title.trim(),
        description: description.trim(),
        category,
        is_public: isPublic,
        plays: [
          {
            step_number: 1,
            description: playDescription.trim() || 'Execute the play as designed',
            player_positions: samplePositions,
            key_actions: keyActions.filter(action => action.trim() !== '')
          }
        ]
      };

      await onSubmit(playbookData);
      
      // Reset form on success
      setTitle('');
      setDescription('');
      setPlayTitle('');
      setPlayDescription('');
      setKeyActions(['', '', '']);
      setUploadedFile(null);
      setUploadResult(null);
      setStep(1);
      
    } catch (error: any) {
      console.error('Error creating playbook:', error);
      toast.error('Failed to create playbook. Please try again.');
      
      // Show detailed error to user
      alert(`Creation Failed: ${error.message}\n\nPlease check your internet connection and try again.`);
      
    } finally {
      setLoading(false);
    }
  };

  const canProceedFromStep1 = title.trim() && description.trim();
  const canProceedFromStep2 = playTitle.trim();

  const stepTitles = [
    { title: 'Basic Information', subtitle: 'Tell us about your playbook' },
    { title: 'Play Details', subtitle: 'Define your basketball play' },
    { title: 'Review & Create', subtitle: 'Preview before creating' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Basketball Playbook</h1>
        <p className="text-gray-400">Design custom plays for your team</p>
        {storage ? (
          <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Firebase Storage Connected</span>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <AlertCircle className="w-3 h-3 text-yellow-500" />
            <span className="text-yellow-400 text-sm">Using Backend Storage</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Step {step} of 3</span>
          <span className="text-sm text-gray-400">{Math.round((step / 3) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div 
            className="bg-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 && '📋'} {step === 2 && '🏀'} {step === 3 && '👁️'} {stepTitles[step - 1].title}
          </h2>
          <p className="text-gray-400">{stepTitles[step - 1].subtitle}</p>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* File Upload Section */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-orange-500" />
                Upload Existing Playbook (Optional)
              </h3>
              
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {uploadLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></div>
                    <p className="text-gray-300">Uploading...</p>
                  </div>
                ) : uploadResult ? (
                  <div className="flex flex-col items-center">
                    <Check className="w-8 h-8 text-green-500 mb-3" />
                    <p className="text-green-400 font-medium">{uploadResult.original_name}</p>
                    <p className="text-gray-400 text-sm">
                      Uploaded to {uploadResult.storage_type === 'firebase' ? 'Firebase Storage' : 'Backend Storage'}
                    </p>
                    {uploadResult.playbook_created && (
                      <p className="text-blue-400 text-sm mt-1">✨ Playbook automatically created!</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Drop a JSON or PDF file here, or click to browse</p>
                    <p className="text-gray-500 text-sm">Supported: JSON, PDF, TXT (max 16MB)</p>
                  </div>
                )}
                
                <input
                  id="file-input"
                  type="file"
                  accept=".json,.pdf,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
              
              {uploadResult && (
                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>📁 File: {uploadResult.original_name}</div>
                    <div>📊 Size: {Math.round(uploadResult.size / 1024)} KB</div>
                    <div>🔗 Storage: {uploadResult.storage_type === 'firebase' ? 'Firebase Storage' : 'Backend Storage'}</div>
                    {uploadResult.firebase_url && (
                      <div className="text-green-400">✅ Cloud URL available</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-600 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Or Create Manually</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Playbook Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Advanced Pick and Roll Strategies"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose, strategy, and when to use this playbook..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-4">Category</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left group
                      ${category === cat.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-semibold text-white">{cat.name}</span>
                    </div>
                    <p className="text-sm text-gray-400">{cat.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
              />
              <label htmlFor="public" className="text-sm text-gray-300">
                Make this playbook public (other coaches can view and use it)
              </label>
            </div>
          </motion.div>
        )}

        {/* Step 2: Play Details */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Play Name *
              </label>
              <input
                type="text"
                value={playTitle}
                onChange={(e) => setPlayTitle(e.target.value)}
                placeholder="e.g., Screen and Roll to Basket"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Play Description
              </label>
              <textarea
                value={playDescription}
                onChange={(e) => setPlayDescription(e.target.value)}
                placeholder="Describe the execution, timing, and key points of this play..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-4">Key Actions</label>
              <div className="space-y-3">
                {keyActions.map((action, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={action}
                      onChange={(e) => {
                        const newActions = [...keyActions];
                        newActions[index] = e.target.value;
                        setKeyActions(newActions);
                      }}
                      placeholder={`Key action ${index + 1} (e.g., "Set solid screen at top of key")`}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors pl-6"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Add the most important actions players need to execute in this play
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <div className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${category === 'offense' ? 'bg-blue-500/20 text-blue-400' :
                    category === 'defense' ? 'bg-red-500/20 text-red-400' :
                    'bg-green-500/20 text-green-400'
                  }
                `}>
                  {categories.find(c => c.id === category)?.icon} {category}
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">{description}</p>
              
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="font-semibold text-white mb-2 flex items-center">
                  <span className="text-orange-500 mr-2">📋</span>
                  {playTitle}
                </h4>
                
                {playDescription && (
                  <p className="text-gray-400 text-sm mb-4">{playDescription}</p>
                )}
                
                <div>
                  <p className="text-sm font-medium text-white mb-3">Key Actions:</p>
                  <div className="space-y-2">
                    {keyActions.filter(action => action.trim()).map((action, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-green-400 text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm">
                  {isPublic ? '🌐 This playbook will be public and visible to other coaches' : '🔒 This playbook will be private to your team'}
                </p>
              </div>

              {uploadResult && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">
                    📎 Attached file: {uploadResult.original_name} ({uploadResult.storage_type})
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
          <motion.button
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg transition-all
              ${step === 1 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Previous'}</span>
          </motion.button>

          {step < 3 ? (
            <motion.button
              onClick={() => {
                if (step === 1 && !canProceedFromStep1) {
                  toast.error('Please fill in all required fields');
                  return;
                }
                if (step === 2 && !canProceedFromStep2) {
                  toast.error('Please enter a play name');
                  return;
                }
                setStep(step + 1);
              }}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-6 py-3 rounded-lg transition-all"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Creating...' : 'Create Playbook'}</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePlaybook;