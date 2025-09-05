import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Users, BookOpen, Target, Brain } from 'lucide-react';

interface RoleOption {
  id: 'coach' | 'player';
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'coach',
    title: "I'm a Coach",
    description: "Create and manage basketball playbooks, view player progress, and access AI coaching insights",
    icon: <Users className="w-12 h-12" />,
    features: [
      "Create custom playbooks",
      "Manage player reports", 
      "AI performance analysis",
      "Team management tools"
    ],
    color: "from-blue-500 to-blue-600"
  },
  {
    id: 'player',
    title: "I'm a Player",
    description: "Learn basketball plays, practice with 3D simulations, and improve with AI feedback",
    icon: <Target className="w-12 h-12" />,
    features: [
      "Browse interactive playbooks",
      "3D court simulation",
      "Personalized coaching tips",
      "Track your progress"
    ],
    color: "from-orange-500 to-orange-600"
  }
];

export default function HomePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'coach' | 'player' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async (role: 'coach' | 'player') => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      // Store user role in localStorage for demo
      localStorage.setItem('userRole', role);
      localStorage.setItem('userData', JSON.stringify({
        role,
        name: role === 'coach' ? 'Demo Coach' : 'Demo Player',
        email: `demo@${role}.com`,
        id: `demo_${role}_${Date.now()}`
      }));

      // Navigate to dashboard
      await router.push('/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Playbook Pro - Youth Basketball Coaching Platform</title>
        <meta name="description" content="Interactive basketball coaching platform with 3D playbooks and AI feedback" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <div className="text-center pt-16 pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl mb-6"
          >
            🏀
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4 font-heading"
          >
            Playbook Pro
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto px-6"
          >
            Choose your role to explore the basketball coaching platform
          </motion.p>
        </div>

        {/* Role Selection */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {roleOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.2 }}
                className={`relative group cursor-pointer ${
                  isLoading && selectedRole !== option.id ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => !isLoading && handleRoleSelection(option.id)}
              >
                <div className={`
                  bg-gradient-to-br ${option.color} p-1 rounded-2xl
                  transform transition-all duration-300 
                  group-hover:scale-105 group-hover:shadow-2xl
                  ${selectedRole === option.id ? 'scale-105 shadow-2xl' : ''}
                `}>
                  <div className="bg-gray-900 rounded-xl p-8 h-full">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className={`
                        p-4 rounded-full bg-gradient-to-br ${option.color}
                        text-white transform transition-transform group-hover:rotate-12
                      `}>
                        {option.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white text-center mb-4">
                      {option.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-300 text-center mb-6 leading-relaxed">
                      {option.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      {option.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${option.color}`} />
                          <span className="text-gray-200 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Loading indicator */}
                    {isLoading && selectedRole === option.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-8">Platform Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <BookOpen className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Interactive Playbooks</h4>
                <p className="text-gray-300 text-sm">2D/3D basketball play visualization with step-by-step guidance</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-4xl mx-auto mb-4">🎮</div>
                <h4 className="text-lg font-semibold text-white mb-2">3D Court Simulation</h4>
                <p className="text-gray-300 text-sm">Practice plays in virtual environment with physics simulation</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <Brain className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">AI Coaching Feedback</h4>
                <p className="text-gray-300 text-sm">Personalized performance analysis and improvement recommendations</p>
              </div>
            </div>
          </motion.div>

          {/* Demo Mode Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm">
              🎮 Demo Mode - No login required! Explore all features instantly
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}