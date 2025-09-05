#!/usr/bin/env python3

# Read the file
with open('frontend/app/(app)/(tabs)/simulation.tsx', 'r') as f:
    content = f.read()

# Define the old string to replace
old_str = '''export default function Simulation() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>3D Simulation</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Coming Soon */}
        <View style={styles.comingSoon}>
          <Ionicons name="game-controller" size={64} color="#666666" />
          <Text style={styles.comingSoonTitle}>3D Court Coming Soon</Text>
          <Text style={styles.comingSoonDescription}>
            Interactive 3D basketball court with physics simulation and AI-powered opponents
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
              <Text style={styles.featureText}>3D Basketball Court</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
              <Text style={styles.featureText}>Player Movement Controls</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
              <Text style={styles.featureText}>Physics-Based Gameplay</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
              <Text style={styles.featureText}>AI Performance Analysis</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}'''

# Define the new string
new_str = '''export default function Simulation() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const loadPlaybooks = async () => {
    try {
      // First create sample data if it doesn't exist
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/sample-data`, {
        method: 'POST',
      });

      // Then fetch all public playbooks
      const playbooksResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/playbooks?public_only=true`);
      
      if (playbooksResponse.ok) {
        const data = await playbooksResponse.json();
        setPlaybooks(data);
      }
    } catch (error) {
      console.error('Error loading playbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPlaybook = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
  };

  const handleActionLog = (action: string) => {
    setGameLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${action}`]);
  };

  const closeSimulation = () => {
    setSelectedPlaybook(null);
    setGameLog([]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading simulations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render Game Simulation
  if (selectedPlaybook) {
    return (
      <GameSimulation
        plays={selectedPlaybook.plays}
        title={selectedPlaybook.title}
        onClose={closeSimulation}
        onActionLog={handleActionLog}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>3D Simulation</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Features Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏀 Interactive 3D Basketball Simulation</Text>
          <Text style={styles.bannerDescription}>
            Experience realistic gameplay with physics-based interactions and AI opponents
          </Text>
        </View>

        {/* Available Simulations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Simulations</Text>
          
          {playbooks.length > 0 ? (
            <View style={styles.playbooksContainer}>
              {playbooks.map((playbook) => (
                <TouchableOpacity
                  key={playbook.id}
                  style={styles.playbookCard}
                  onPress={() => selectPlaybook(playbook)}
                >
                  <View style={styles.playbookHeader}>
                    <View style={styles.playbookIcon}>
                      <Ionicons 
                        name={playbook.category === 'offense' ? 'basketball' : 
                              playbook.category === 'defense' ? 'shield' : 'flash'} 
                        size={24} 
                        color="#FF6B35" 
                      />
                    </View>
                    <View style={styles.playbookInfo}>
                      <Text style={styles.playbookTitle}>{playbook.title}</Text>
                      <Text style={styles.playbookCategory}>{playbook.category.toUpperCase()}</Text>
                    </View>
                    <View style={styles.playbookMeta}>
                      <Text style={styles.playCount}>{playbook.plays.length} plays</Text>
                      <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
                    </View>
                  </View>
                  
                  <Text style={styles.playbookDescription} numberOfLines={2}>
                    {playbook.description}
                  </Text>
                  
                  <View style={styles.simulationFeatures}>
                    <View style={styles.feature}>
                      <Ionicons name="cube" size={16} color="#10B981" />
                      <Text style={styles.featureText}>3D Physics</Text>
                    </View>
                    <View style={styles.feature}>
                      <Ionicons name="people" size={16} color="#8B5CF6" />
                      <Text style={styles.featureText}>AI Players</Text>
                    </View>
                    <View style={styles.feature}>
                      <Ionicons name="stats-chart" size={16} color="#F59E0B" />
                      <Text style={styles.featureText}>Analytics</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="game-controller" size={64} color="#666666" />
              <Text style={styles.emptyTitle}>No Simulations Available</Text>
              <Text style={styles.emptyDescription}>
                Create or import playbooks to run 3D simulations
              </Text>
            </View>
          )}
        </View>

        {/* Feature Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simulation Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureCard}>
              <Ionicons name="cube-outline" size={32} color="#FF6B35" />
              <Text style={styles.featureCardTitle}>3D Court Physics</Text>
              <Text style={styles.featureCardDescription}>
                Realistic ball physics and player movement in 3D space
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="people-outline" size={32} color="#10B981" />
              <Text style={styles.featureCardTitle}>AI Opposition</Text>
              <Text style={styles.featureCardDescription}>
                Smart AI players that adapt to your strategies
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="analytics-outline" size={32} color="#8B5CF6" />
              <Text style={styles.featureCardTitle}>Performance Analytics</Text>
              <Text style={styles.featureCardDescription}>
                Detailed analysis of your gameplay decisions
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}'''

# Perform the replacement
if old_str in content:
    new_content = content.replace(old_str, new_str)
    
    # Write the updated content back to the file
    with open('frontend/app/(app)/(tabs)/simulation.tsx', 'w') as f:
        f.write(new_content)
    
    print("Successfully replaced the function!")
else:
    print("Old string not found in the file")