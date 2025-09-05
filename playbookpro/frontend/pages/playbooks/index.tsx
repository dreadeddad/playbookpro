import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { BookOpen, Filter, ArrowLeft, Play, ChevronRight } from 'lucide-react';

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

export default function PlaybooksPage() {
  const router = useRouter();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Plays', icon: '🏀' },
    { id: 'offense', name: 'Offense', icon: '⚡' },
    { id: 'defense', name: 'Defense', icon: '🛡️' },
    { id: 'transition', name: 'Transition', icon: '🏃‍♂️' },
  ];

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const loadPlaybooks = async () => {
    try {
      // Create sample data first
      await fetch('/api/sample-data', { method: 'POST' });
      
      // Then fetch playbooks
      const response = await fetch('/api/playbooks?public_only=true');
      if (response.ok) {
        const data = await response.json();
        setPlaybooks(data);
      }
    } catch (error) {
      console.error('Error loading playbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaybooks = selectedCategory === 'all' 
    ? playbooks 
    : playbooks.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Loading basketball playbooks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Basketball Playbooks - Playbook Pro</title>
        <meta name="description" content="Browse interactive basketball playbooks with 2D court visualization" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/dashboard" className="flex items-center space-x-4 text-white hover:text-orange-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-2xl">🏀</span>
                <h1 className="text-xl font-bold">Basketball Playbooks</h1>
              </Link>
              
              <button className="text-gray-400 hover:text-white transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                    ${selectedCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Playbooks Grid */}
          {filteredPlaybooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaybooks.map((playbook, index) => (
                <motion.div
                  key={playbook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/playbooks/${playbook.id}`}>
                    <div className="group cursor-pointer">
                      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-orange-500 transition-all transform group-hover:scale-105">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">
                            {playbook.title}
                          </h3>
                          <div className={`
                            px-2 py-1 rounded text-xs font-medium
                            ${playbook.category === 'offense' ? 'bg-blue-500/20 text-blue-400' :
                              playbook.category === 'defense' ? 'bg-red-500/20 text-red-400' :
                              'bg-green-500/20 text-green-400'
                            }
                          `}>
                            {categories.find(c => c.id === playbook.category)?.icon} {playbook.category}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 mb-4 line-clamp-2">
                          {playbook.description}
                        </p>

                        {/* Play Count */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Play className="w-4 h-4" />
                            <span className="text-sm">
                              {playbook.plays.length} step{playbook.plays.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-orange-500 group-hover:text-orange-400">
                            <span className="text-sm font-medium">View Play</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Playbooks Found</h3>
              <p className="text-gray-400 mb-6">
                {selectedCategory === 'all' 
                  ? 'Loading sample basketball playbooks...' 
                  : `No ${selectedCategory} playbooks available yet.`
                }
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  View All Playbooks
                </button>
              )}
            </motion.div>
          )}

          {/* Features Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Interactive Basketball Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">2D</span>
                </div>
                <span className="text-gray-300">Interactive court visualization</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📋</span>
                </div>
                <span className="text-gray-300">Step-by-step play breakdown</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🎯</span>
                </div>
                <span className="text-gray-300">Player roles & responsibilities</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}