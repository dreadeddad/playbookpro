import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePlaybook() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('offense');
  const [playTitle, setPlayTitle] = useState('');
  const [playDescription, setPlayDescription] = useState('');
  const [keyActions, setKeyActions] = useState(['', '', '']);

  const categories = [
    { id: 'offense', name: 'Offense', icon: '⚡', description: 'Scoring strategies and plays' },
    { id: 'defense', name: 'Defense', icon: '🛡️', description: 'Defensive formations and tactics' },
    { id: 'transition', name: 'Transition', icon: '🏃‍♂️', description: 'Fast break and transition plays' },
  ];

  const samplePositions = [
    { x: 0.5, y: 0.8, role: 'point_guard', responsibilities: ['Control ball', 'Read defense'] },
    { x: 0.4, y: 0.6, role: 'center', responsibilities: ['Set screen', 'Roll to basket'] },
    { x: 0.1, y: 0.4, role: 'forward', responsibilities: ['Space the floor', 'Be ready for pass'] },
    { x: 0.9, y: 0.4, role: 'forward', responsibilities: ['Space the floor', 'Help side support'] },
    { x: 0.7, y: 0.2, role: 'guard', responsibilities: ['Spot up for three', 'Be ready to help'] },
  ];

  useEffect(() => {
    // Check if user is logged in and is a coach
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      if (user.role !== 'coach') {
        router.push('/dashboard');
        return;
      }
      setUserData(user);
    } else {
      router.push('/');
    }
  }, [router]);

  const createPlaybook = async () => {
    if (!title.trim() || !description.trim() || !playTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const playbookData = {
        title: title.trim(),
        description: description.trim(),
        category,
        is_public: true,
        plays: [
          {
            step_number: 1,
            description: playDescription.trim() || 'Execute the play as designed',
            player_positions: samplePositions,
            key_actions: keyActions.filter(action => action.trim() !== '')
          }
        ]
      };

      const response = await fetch(`/api/playbooks?coach_id=${userData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playbookData),
      });

      if (response.ok) {
        toast.success('Playbook created successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setPlayTitle('');
        setPlayDescription('');
        setKeyActions(['', '', '']);
        setStep(1);
        // Redirect to playbooks page
        setTimeout(() => router.push('/playbooks'), 1500);
      } else {
        throw new Error('Failed to create playbook');
      }
    } catch (error) {
      console.error('Error creating playbook:', error);
      toast.error('Failed to create playbook. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">📋 Basic Information</h2>
        <p className="text-gray-400">Tell us about your basketball playbook</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Playbook Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Advanced Pick and Roll"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the purpose and strategy of this playbook..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-4">Category</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${category === cat.id
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-semibold text-white">{cat.name}</span>
              </div>
              <p className="text-sm text-gray-400">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">🏀 Play Details</h2>
        <p className="text-gray-400">Define your basketball play</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Play Name *
        </label>
        <input
          type="text"
          value={playTitle}
          onChange={(e) => setPlayTitle(e.target.value)}
          placeholder="e.g., Screen and Roll"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Play Description
        </label>
        <textarea
          value={playDescription}
          onChange={(e) => setPlayDescription(e.target.value)}
          placeholder="Describe how to execute this play..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-4">Key Actions</label>
        <div className="space-y-3">
          {keyActions.map((action, index) => (
            <input
              key={index}
              type="text"
              value={action}
              onChange={(e) => {
                const newActions = [...keyActions];
                newActions[index] = e.target.value;
                setKeyActions(newActions);
              }}
              placeholder={`Key action ${index + 1}...`}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">👁️ Preview & Create</h2>
        <p className="text-gray-400">Review your playbook before creating</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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
        
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">📋 {playTitle}</h4>
          {playDescription && (
            <p className="text-gray-400 text-sm mb-3">{playDescription}</p>
          )}
          
          <div>
            <p className="text-sm font-medium text-white mb-2">Key Actions:</p>
            <div className="space-y-1">
              {keyActions.filter(action => action.trim()).map((action, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create Playbook - Playbook Pro</title>
        <meta name="description" content="Create custom basketball playbooks" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/dashboard" className="flex items-center space-x-4 text-white hover:text-orange-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-2xl">🏀</span>
                <h1 className="text-xl font-bold">Create Playbook</h1>
              </Link>
              
              <button className="text-gray-400 hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step {step} of 3</span>
              <span className="text-sm text-gray-400">{Math.round((step / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg transition-all
                  ${step === 1 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {step < 3 ? (
                <button
                  onClick={() => {
                    if (step === 1 && (!title.trim() || !description.trim())) {
                      toast.error('Please fill in all required fields');
                      return;
                    }
                    if (step === 2 && !playTitle.trim()) {
                      toast.error('Please enter a play name');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={createPlaybook}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-6 py-3 rounded-lg transition-all"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Creating...' : 'Create Playbook'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}