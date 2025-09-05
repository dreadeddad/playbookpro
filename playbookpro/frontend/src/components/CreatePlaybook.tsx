import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';

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

const CreatePlaybook: React.FC<CreatePlaybookProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('offense');
  const [playTitle, setPlayTitle] = useState('');
  const [playDescription, setPlayDescription] = useState('');
  const [keyActions, setKeyActions] = useState(['', '', '']);
  const [isPublic, setIsPublic] = useState(true);

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
      setStep(1);
      
    } catch (error) {
      console.error('Error creating playbook:', error);
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
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full" />
                    <div className="pl-6" />
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