import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Users, Target } from 'lucide-react';

interface Play {
  step_number: number;
  description: string;
  player_positions: Array<{
    x: number;
    y: number;
    role: string;
    responsibilities: string[];
  }>;
  key_actions: string[];
}

interface Playbook {
  id: string;
  coach_id: string;
  title: string;
  description: string;
  category: string;
  plays: Play[];
  created_at: string;
  is_public: boolean;
}

export default function PlaybookDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPlaybook(id as string);
    }
  }, [id]);

  const loadPlaybook = async (playbookId: string) => {
    try {
      const response = await fetch(`/api/playbooks/${playbookId}`);
      if (response.ok) {
        const data = await response.json();
        setPlaybook(data);
      } else {
        console.error('Playbook not found');
        router.push('/playbooks');
      }
    } catch (error) {
      console.error('Error loading playbook:', error);
      router.push('/playbooks');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (playbook && currentStep < playbook.plays.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Loading playbook...</p>
        </div>
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Playbook Not Found</h2>
          <Link href="/playbooks" className="text-orange-500 hover:text-orange-400">
            Return to Playbooks
          </Link>
        </div>
      </div>
    );
  }

  const currentPlay = playbook.plays[currentStep];

  return (
    <>
      <Head>
        <title>{playbook.title} - Playbook Pro</title>
        <meta name="description" content={playbook.description} />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/playbooks" className="flex items-center space-x-4 text-white hover:text-orange-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-2xl">🏀</span>
                <h1 className="text-xl font-bold">{playbook.title}</h1>
              </Link>
              
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${playbook.category === 'offense' ? 'bg-blue-500/20 text-blue-400' :
                  playbook.category === 'defense' ? 'bg-red-500/20 text-red-400' :
                  'bg-green-500/20 text-green-400'
                }
              `}>
                {playbook.category === 'offense' ? '⚡' : 
                 playbook.category === 'defense' ? '🛡️' : '🏃‍♂️'} {playbook.category}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Playbook Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-gray-400 text-lg mb-6">{playbook.description}</p>
            
            {/* Step Indicator */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-orange-500 font-bold text-lg">
                    Step {currentPlay.step_number} of {playbook.plays.length}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{currentPlay.description}</h2>
                </div>
                <div className="flex space-x-2">
                  {playbook.plays.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`
                        w-3 h-3 rounded-full transition-colors
                        ${index === currentStep ? 'bg-orange-500' : 'bg-gray-600 hover:bg-gray-500'}
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basketball Court Visualization */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">🏀</span>
                Court Positions
              </h3>
              
              <div className="relative w-full h-80 bg-gradient-to-b from-orange-900/20 to-orange-800/20 rounded-lg border-2 border-white/30 overflow-hidden">
                {/* Court markings */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50 transform -translate-y-1/2" />
                <div className="absolute bottom-8 left-1/4 right-1/4 h-0.5 bg-white/30" />
                <div className="absolute bottom-4 left-1/6 right-1/6 h-0.5 bg-white/20 rounded-full" />
                
                {/* Player positions */}
                {currentPlay.player_positions.map((player, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="absolute w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                    style={{
                      left: `${player.x * 100}%`,
                      top: `${(1 - player.y) * 100}%`,
                    }}
                  >
                    <span className="text-white text-xs font-bold">
                      {player.role.split('_')[0].charAt(0).toUpperCase()}
                    </span>
                  </motion.div>
                ))}

                {/* Court labels */}
                <div className="absolute top-2 left-2 text-white/70 text-xs">Defense</div>
                <div className="absolute bottom-2 right-2 text-white/70 text-xs">Offense</div>
              </div>

              {/* Player Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {currentPlay.player_positions.map((player, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {player.role.split('_')[0].charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-300 capitalize">
                      {player.role.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Player Responsibilities & Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Player Responsibilities */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-orange-500" />
                  Player Roles & Responsibilities
                </h3>
                
                <div className="space-y-4">
                  {currentPlay.player_positions.map((player, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="bg-gray-700/50 rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-orange-500 mb-2 capitalize">
                        {player.role.replace('_', ' ')}
                      </h4>
                      <ul className="space-y-1">
                        {player.responsibilities.map((resp, respIndex) => (
                          <li key={respIndex} className="text-gray-300 text-sm flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key Actions */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Key Actions
                </h3>
                
                <div className="space-y-3">
                  {currentPlay.key_actions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center space-x-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-green-400 font-medium">{action}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex justify-center space-x-4 mt-8"
          >
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg transition-all
                ${currentStep === 0 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 text-white hover:bg-gray-600 transform hover:scale-105'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <button
              onClick={nextStep}
              disabled={currentStep === playbook.plays.length - 1}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg transition-all
                ${currentStep === playbook.plays.length - 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 transform hover:scale-105'
                }
              `}
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}