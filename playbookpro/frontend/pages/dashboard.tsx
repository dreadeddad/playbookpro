import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Play, 
  Target,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

interface UserData {
  role: 'coach' | 'player';
  name: string;
  email: string;
  id: string;
}

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');

    if (storedUserData && userRole) {
      setUserData(JSON.parse(storedUserData));
    } else {
      // Redirect to home if no user data
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const isCoach = userData.role === 'coach';

  const stats: StatCard[] = isCoach ? [
    {
      title: 'Playbooks Created',
      value: '12',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-blue-500'
    },
    {
      title: 'Active Players',
      value: '45',
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-500'
    },
    {
      title: 'Team Performance',
      value: '87%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-orange-500'
    }
  ] : [
    {
      title: 'Plays Practiced',
      value: '24',
      icon: <Play className="w-6 h-6" />,
      color: 'text-blue-500'
    },
    {
      title: 'Training Hours',
      value: '36',
      icon: <Target className="w-6 h-6" />,
      color: 'text-green-500'
    },
    {
      title: 'Skill Progress',
      value: '73%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-orange-500'
    }
  ];

  const quickActions: QuickAction[] = isCoach ? [
    {
      title: 'Create Playbook',
      description: 'Design new basketball strategies',
      href: '/create',
      icon: <PlusCircle className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'View Playbooks',
      description: 'Browse your coaching library',
      href: '/playbooks',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Player Analytics',
      description: 'Track team performance',
      href: '/analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    }
  ] : [
    {
      title: 'Browse Playbooks',
      description: 'Learn new basketball plays',
      href: '/playbooks',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Practice Mode',
      description: '3D simulation training',
      href: '/practice',
      icon: <Target className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'My Progress',
      description: 'View your improvement',
      href: '/progress',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <>
      <Head>
        <title>Dashboard - Playbook Pro</title>
        <meta name="description" content="Your basketball coaching dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">🏀</span>
                <h1 className="text-xl font-bold text-white">Playbook Pro</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  {userData.name} • {isCoach ? '👨‍🏫 Coach' : '🏃‍♂️ Player'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back, {userData.name.split(' ')[0]}!
            </h2>
            <p className="text-gray-400">
              {isCoach 
                ? 'Manage your team and create winning strategies' 
                : 'Continue your basketball journey and improve your skills'
              }
            </p>
          </motion.div>

          {/* Demo Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center space-x-2">
              <span className="text-orange-500">🎮</span>
              <span className="text-orange-500 font-semibold">Demo Mode Active</span>
              <span className="text-gray-400">- Explore all features without authentication!</span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={action.title} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <div className={`bg-gradient-to-br ${action.color} p-1 rounded-lg transform transition-all duration-300 group-hover:scale-105`}>
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="text-white">
                            {action.icon}
                          </div>
                          <h4 className="text-lg font-semibold text-white">{action.title}</h4>
                        </div>
                        <p className="text-gray-400 text-sm">{action.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'Created playbook', item: '"Advanced Pick & Roll"', time: '2 hours ago' },
                { action: 'Practiced play', item: '"2-3 Zone Defense"', time: '5 hours ago' },
                { action: 'Received feedback', item: 'Performance improved by 15%', time: '1 day ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <div className="flex-1">
                    <span className="text-white">{activity.action}</span>
                    <span className="text-orange-500 ml-2">{activity.item}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}