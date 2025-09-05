#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Playbook Pro Basketball Coaching App
Tests all endpoints systematically with realistic basketball data
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://playbook-pro-1.preview.emergentagent.com/api"
TIMEOUT = 30

class PlaybookProTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.test_results = []
        self.created_resources = {
            'users': [],
            'playbooks': [],
            'game_sessions': []
        }
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response': response_data
        })
    
    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Playbook Pro API":
                    self.log_test("Basic API Connectivity", True, "API is responding correctly")
                    return True
                else:
                    self.log_test("Basic API Connectivity", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Basic API Connectivity", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Basic API Connectivity", False, f"Connection error: {str(e)}")
            return False
    
    def test_user_management(self):
        """Test all user management endpoints"""
        print("=== Testing User Management ===")
        
        # Test data - realistic basketball coach
        firebase_uid = f"coach_{uuid.uuid4().hex[:8]}"
        user_data = {
            "firebase_uid": firebase_uid,
            "email": "coach.johnson@basketballacademy.com",
            "display_name": "Coach Michael Johnson",
            "role": "coach"
        }
        
        # Test 1: Create User
        try:
            response = self.session.post(f"{BASE_URL}/users", json=user_data)
            if response.status_code == 200:
                created_user = response.json()
                self.created_resources['users'].append(firebase_uid)
                self.log_test("Create User", True, f"Created user: {created_user['display_name']}")
                
                # Verify user structure
                required_fields = ['id', 'firebase_uid', 'email', 'display_name', 'role', 'created_at']
                missing_fields = [field for field in required_fields if field not in created_user]
                if missing_fields:
                    self.log_test("User Data Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("User Data Structure", True, "All required fields present")
            else:
                self.log_test("Create User", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create User", False, f"Exception: {str(e)}")
            return False
        
        # Test 2: Get User
        try:
            response = self.session.get(f"{BASE_URL}/users/{firebase_uid}")
            if response.status_code == 200:
                user = response.json()
                if user['firebase_uid'] == firebase_uid:
                    self.log_test("Get User", True, f"Retrieved user: {user['display_name']}")
                else:
                    self.log_test("Get User", False, "Retrieved user doesn't match")
            else:
                self.log_test("Get User", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get User", False, f"Exception: {str(e)}")
        
        # Test 3: Update User
        try:
            update_data = {
                "display_name": "Coach Michael 'The Strategist' Johnson",
                "role": "head_coach"
            }
            response = self.session.put(f"{BASE_URL}/users/{firebase_uid}", json=update_data)
            if response.status_code == 200:
                updated_user = response.json()
                if updated_user['display_name'] == update_data['display_name']:
                    self.log_test("Update User", True, "User updated successfully")
                else:
                    self.log_test("Update User", False, "Update didn't take effect")
            else:
                self.log_test("Update User", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Update User", False, f"Exception: {str(e)}")
        
        # Test 4: Duplicate User Creation (should fail)
        try:
            response = self.session.post(f"{BASE_URL}/users", json=user_data)
            if response.status_code == 400:
                self.log_test("Duplicate User Prevention", True, "Correctly prevented duplicate user")
            else:
                self.log_test("Duplicate User Prevention", False, f"Should have failed with 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Duplicate User Prevention", False, f"Exception: {str(e)}")
        
        return True
    
    def test_playbook_management(self):
        """Test all playbook management endpoints"""
        print("=== Testing Playbook Management ===")
        
        # Ensure we have a coach user
        if not self.created_resources['users']:
            self.log_test("Playbook Management Setup", False, "No users available for testing")
            return False
        
        coach_id = self.created_resources['users'][0]
        
        # Test data - realistic basketball playbook
        playbook_data = {
            "title": "Motion Offense - Flex Cut",
            "description": "A continuous motion offense featuring flex cuts and screen-the-screener actions to create scoring opportunities",
            "category": "offense",
            "is_public": True,
            "plays": [
                {
                    "step_number": 1,
                    "description": "Initial setup - Guards at top, forwards on wings, center in post",
                    "player_positions": [
                        {
                            "x": 0.5,
                            "y": 0.9,
                            "role": "point_guard",
                            "responsibilities": ["Initiate offense", "Read defense", "Make entry pass"]
                        },
                        {
                            "x": 0.7,
                            "y": 0.8,
                            "role": "shooting_guard",
                            "responsibilities": ["Space the floor", "Be ready for catch and shoot"]
                        },
                        {
                            "x": 0.2,
                            "y": 0.6,
                            "role": "small_forward",
                            "responsibilities": ["Create spacing", "Set screens"]
                        },
                        {
                            "x": 0.8,
                            "y": 0.5,
                            "role": "power_forward",
                            "responsibilities": ["Post up", "Set screens", "Rebound"]
                        },
                        {
                            "x": 0.5,
                            "y": 0.3,
                            "role": "center",
                            "responsibilities": ["Establish post position", "Set screens", "Protect rim"]
                        }
                    ],
                    "key_actions": ["Ball movement", "Player spacing", "Screen setting"]
                },
                {
                    "step_number": 2,
                    "description": "Flex cut execution - Forward cuts off screen for scoring opportunity",
                    "player_positions": [
                        {
                            "x": 0.4,
                            "y": 0.8,
                            "role": "point_guard",
                            "responsibilities": ["Make the pass", "Follow the ball"]
                        },
                        {
                            "x": 0.8,
                            "y": 0.7,
                            "role": "shooting_guard",
                            "responsibilities": ["Spot up for three", "Be ready for kick out"]
                        },
                        {
                            "x": 0.6,
                            "y": 0.4,
                            "role": "small_forward",
                            "responsibilities": ["Make flex cut", "Look for scoring opportunity"]
                        },
                        {
                            "x": 0.5,
                            "y": 0.5,
                            "role": "power_forward",
                            "responsibilities": ["Set flex screen", "Roll to basket"]
                        },
                        {
                            "x": 0.3,
                            "y": 0.2,
                            "role": "center",
                            "responsibilities": ["Seal defender", "Be ready for pass"]
                        }
                    ],
                    "key_actions": ["Flex cut", "Screen contact", "Pass timing"]
                }
            ]
        }
        
        # Test 1: Create Playbook
        try:
            response = self.session.post(f"{BASE_URL}/playbooks?coach_id={coach_id}", json=playbook_data)
            if response.status_code == 200:
                created_playbook = response.json()
                playbook_id = created_playbook['id']
                self.created_resources['playbooks'].append(playbook_id)
                self.log_test("Create Playbook", True, f"Created playbook: {created_playbook['title']}")
                
                # Verify playbook structure
                required_fields = ['id', 'coach_id', 'title', 'description', 'category', 'plays', 'created_at']
                missing_fields = [field for field in required_fields if field not in created_playbook]
                if missing_fields:
                    self.log_test("Playbook Data Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Playbook Data Structure", True, "All required fields present")
            else:
                self.log_test("Create Playbook", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Playbook", False, f"Exception: {str(e)}")
            return False
        
        # Test 2: Get All Playbooks
        try:
            response = self.session.get(f"{BASE_URL}/playbooks")
            if response.status_code == 200:
                playbooks = response.json()
                if isinstance(playbooks, list) and len(playbooks) > 0:
                    self.log_test("Get All Playbooks", True, f"Retrieved {len(playbooks)} playbooks")
                else:
                    self.log_test("Get All Playbooks", False, "No playbooks returned")
            else:
                self.log_test("Get All Playbooks", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get All Playbooks", False, f"Exception: {str(e)}")
        
        # Test 3: Get Specific Playbook
        if self.created_resources['playbooks']:
            try:
                playbook_id = self.created_resources['playbooks'][0]
                response = self.session.get(f"{BASE_URL}/playbooks/{playbook_id}")
                if response.status_code == 200:
                    playbook = response.json()
                    if playbook['id'] == playbook_id:
                        self.log_test("Get Specific Playbook", True, f"Retrieved playbook: {playbook['title']}")
                    else:
                        self.log_test("Get Specific Playbook", False, "Retrieved playbook doesn't match")
                else:
                    self.log_test("Get Specific Playbook", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Get Specific Playbook", False, f"Exception: {str(e)}")
        
        # Test 4: Update Playbook
        if self.created_resources['playbooks']:
            try:
                playbook_id = self.created_resources['playbooks'][0]
                update_data = {
                    "title": "Advanced Motion Offense - Flex Cut System",
                    "description": "Enhanced version with multiple options and counters"
                }
                response = self.session.put(f"{BASE_URL}/playbooks/{playbook_id}", json=update_data)
                if response.status_code == 200:
                    updated_playbook = response.json()
                    if updated_playbook['title'] == update_data['title']:
                        self.log_test("Update Playbook", True, "Playbook updated successfully")
                    else:
                        self.log_test("Update Playbook", False, "Update didn't take effect")
                else:
                    self.log_test("Update Playbook", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Update Playbook", False, f"Exception: {str(e)}")
        
        # Test 5: Filter Playbooks by Coach
        try:
            response = self.session.get(f"{BASE_URL}/playbooks?coach_id={coach_id}")
            if response.status_code == 200:
                coach_playbooks = response.json()
                if isinstance(coach_playbooks, list):
                    self.log_test("Filter Playbooks by Coach", True, f"Retrieved {len(coach_playbooks)} playbooks for coach")
                else:
                    self.log_test("Filter Playbooks by Coach", False, "Invalid response format")
            else:
                self.log_test("Filter Playbooks by Coach", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Filter Playbooks by Coach", False, f"Exception: {str(e)}")
        
        return True
    
    def test_game_sessions(self):
        """Test game session management endpoints"""
        print("=== Testing Game Session Management ===")
        
        # Ensure we have required resources
        if not self.created_resources['users'] or not self.created_resources['playbooks']:
            self.log_test("Game Session Setup", False, "Missing required users or playbooks")
            return False
        
        player_id = self.created_resources['users'][0]  # Using coach as player for testing
        playbook_id = self.created_resources['playbooks'][0]
        
        # Test 1: Create Game Session
        session_data = {
            "player_id": player_id,
            "playbook_id": playbook_id,
            "play_step": 1
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/game-sessions", json=session_data)
            if response.status_code == 200:
                created_session = response.json()
                session_id = created_session['id']
                self.created_resources['game_sessions'].append(session_id)
                self.log_test("Create Game Session", True, f"Created session: {session_id}")
                
                # Verify session structure
                required_fields = ['id', 'player_id', 'playbook_id', 'play_step', 'actions', 'start_time']
                missing_fields = [field for field in required_fields if field not in created_session]
                if missing_fields:
                    self.log_test("Game Session Data Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Game Session Data Structure", True, "All required fields present")
            else:
                self.log_test("Create Game Session", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Game Session", False, f"Exception: {str(e)}")
            return False
        
        # Test 2: Get Game Session
        if self.created_resources['game_sessions']:
            try:
                session_id = self.created_resources['game_sessions'][0]
                response = self.session.get(f"{BASE_URL}/game-sessions/{session_id}")
                if response.status_code == 200:
                    session = response.json()
                    if session['id'] == session_id:
                        self.log_test("Get Game Session", True, f"Retrieved session: {session_id}")
                    else:
                        self.log_test("Get Game Session", False, "Retrieved session doesn't match")
                else:
                    self.log_test("Get Game Session", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Get Game Session", False, f"Exception: {str(e)}")
        
        # Test 3: Add Action to Session
        if self.created_resources['game_sessions']:
            try:
                session_id = self.created_resources['game_sessions'][0]
                action_data = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "action_type": "move",
                    "position": {"x": 0.5, "y": 0.7},
                    "target_position": {"x": 0.6, "y": 0.5},
                    "effectiveness_score": 8.5
                }
                response = self.session.post(f"{BASE_URL}/game-sessions/{session_id}/actions", json=action_data)
                if response.status_code == 200:
                    result = response.json()
                    if result.get("message") == "Action added successfully":
                        self.log_test("Add Action to Session", True, "Action added successfully")
                    else:
                        self.log_test("Add Action to Session", False, f"Unexpected response: {result}")
                else:
                    self.log_test("Add Action to Session", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Add Action to Session", False, f"Exception: {str(e)}")
        
        # Test 4: Add Multiple Actions (realistic basketball sequence)
        if self.created_resources['game_sessions']:
            try:
                session_id = self.created_resources['game_sessions'][0]
                basketball_actions = [
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "action_type": "pass",
                        "position": {"x": 0.5, "y": 0.9},
                        "target_position": {"x": 0.2, "y": 0.6},
                        "effectiveness_score": 9.0
                    },
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "action_type": "move",
                        "position": {"x": 0.2, "y": 0.6},
                        "target_position": {"x": 0.6, "y": 0.4},
                        "effectiveness_score": 7.5
                    },
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "action_type": "shoot",
                        "position": {"x": 0.6, "y": 0.4},
                        "target_position": {"x": 0.5, "y": 0.1},
                        "effectiveness_score": 8.0
                    }
                ]
                
                success_count = 0
                for action in basketball_actions:
                    response = self.session.post(f"{BASE_URL}/game-sessions/{session_id}/actions", json=action)
                    if response.status_code == 200:
                        success_count += 1
                    time.sleep(0.1)  # Small delay between actions
                
                if success_count == len(basketball_actions):
                    self.log_test("Add Multiple Actions", True, f"Added {success_count} basketball actions")
                else:
                    self.log_test("Add Multiple Actions", False, f"Only {success_count}/{len(basketball_actions)} actions added")
            except Exception as e:
                self.log_test("Add Multiple Actions", False, f"Exception: {str(e)}")
        
        # Test 5: End Game Session
        if self.created_resources['game_sessions']:
            try:
                session_id = self.created_resources['game_sessions'][0]
                response = self.session.post(f"{BASE_URL}/game-sessions/{session_id}/end")
                if response.status_code == 200:
                    result = response.json()
                    if result.get("message") == "Game session ended":
                        self.log_test("End Game Session", True, "Session ended successfully")
                    else:
                        self.log_test("End Game Session", False, f"Unexpected response: {result}")
                else:
                    self.log_test("End Game Session", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("End Game Session", False, f"Exception: {str(e)}")
        
        return True
    
    def test_ai_feedback(self):
        """Test AI feedback generation"""
        print("=== Testing AI Feedback Generation ===")
        
        # Ensure we have a game session with actions
        if not self.created_resources['game_sessions']:
            self.log_test("AI Feedback Setup", False, "No game sessions available")
            return False
        
        session_id = self.created_resources['game_sessions'][0]
        
        # Test AI Feedback Generation
        try:
            feedback_data = {
                "session_id": session_id,
                "actions": [
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "action_type": "pass",
                        "position": {"x": 0.5, "y": 0.9},
                        "target_position": {"x": 0.2, "y": 0.6},
                        "effectiveness_score": 9.0
                    },
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "action_type": "move",
                        "position": {"x": 0.2, "y": 0.6},
                        "target_position": {"x": 0.6, "y": 0.4},
                        "effectiveness_score": 7.5
                    },
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "action_type": "shoot",
                        "position": {"x": 0.6, "y": 0.4},
                        "target_position": {"x": 0.5, "y": 0.1},
                        "effectiveness_score": 8.0
                    }
                ]
            }
            
            response = self.session.post(f"{BASE_URL}/ai-feedback", json=feedback_data)
            if response.status_code == 200:
                result = response.json()
                if "feedback" in result and result["feedback"]:
                    self.log_test("AI Feedback Generation", True, f"Generated feedback: {len(result['feedback'])} characters")
                else:
                    self.log_test("AI Feedback Generation", False, "No feedback content returned")
            else:
                self.log_test("AI Feedback Generation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("AI Feedback Generation", False, f"Exception: {str(e)}")
        
        return True
    
    def test_sample_data(self):
        """Test sample data creation"""
        print("=== Testing Sample Data Creation ===")
        
        try:
            response = self.session.post(f"{BASE_URL}/sample-data")
            if response.status_code == 200:
                result = response.json()
                if result.get("message") == "Sample data created successfully":
                    self.log_test("Create Sample Data", True, "Sample playbooks created")
                    
                    # Verify sample data was created by checking playbooks
                    time.sleep(1)  # Give time for data to be inserted
                    playbooks_response = self.session.get(f"{BASE_URL}/playbooks?public_only=true")
                    if playbooks_response.status_code == 200:
                        public_playbooks = playbooks_response.json()
                        sample_count = len([p for p in public_playbooks if p.get('coach_id') == 'sample_coach'])
                        if sample_count >= 2:
                            self.log_test("Verify Sample Data", True, f"Found {sample_count} sample playbooks")
                        else:
                            self.log_test("Verify Sample Data", False, f"Only found {sample_count} sample playbooks")
                    else:
                        self.log_test("Verify Sample Data", False, "Could not verify sample data")
                else:
                    self.log_test("Create Sample Data", False, f"Unexpected response: {result}")
            else:
                self.log_test("Create Sample Data", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Create Sample Data", False, f"Exception: {str(e)}")
        
        return True
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("=== Testing Error Handling ===")
        
        # Test 1: Get non-existent user
        try:
            response = self.session.get(f"{BASE_URL}/users/nonexistent_uid")
            if response.status_code == 404:
                self.log_test("Non-existent User Error", True, "Correctly returned 404")
            else:
                self.log_test("Non-existent User Error", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Non-existent User Error", False, f"Exception: {str(e)}")
        
        # Test 2: Get non-existent playbook
        try:
            response = self.session.get(f"{BASE_URL}/playbooks/nonexistent_id")
            if response.status_code == 404:
                self.log_test("Non-existent Playbook Error", True, "Correctly returned 404")
            else:
                self.log_test("Non-existent Playbook Error", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Non-existent Playbook Error", False, f"Exception: {str(e)}")
        
        # Test 3: Get non-existent game session
        try:
            response = self.session.get(f"{BASE_URL}/game-sessions/nonexistent_id")
            if response.status_code == 404:
                self.log_test("Non-existent Game Session Error", True, "Correctly returned 404")
            else:
                self.log_test("Non-existent Game Session Error", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Non-existent Game Session Error", False, f"Exception: {str(e)}")
        
        return True
    
    def cleanup_test_data(self):
        """Clean up created test data"""
        print("=== Cleaning Up Test Data ===")
        
        # Delete created playbooks
        for playbook_id in self.created_resources['playbooks']:
            try:
                response = self.session.delete(f"{BASE_URL}/playbooks/{playbook_id}")
                if response.status_code == 200:
                    self.log_test(f"Delete Playbook {playbook_id}", True, "Playbook deleted successfully")
                else:
                    self.log_test(f"Delete Playbook {playbook_id}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Delete Playbook {playbook_id}", False, f"Exception: {str(e)}")
        
        return True
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🏀 Starting Playbook Pro Backend API Tests 🏀")
        print("=" * 60)
        
        # Test sequence
        if not self.test_basic_connectivity():
            print("❌ Basic connectivity failed. Stopping tests.")
            return False
        
        self.test_user_management()
        self.test_playbook_management()
        self.test_game_sessions()
        self.test_ai_feedback()
        self.test_sample_data()
        self.test_error_handling()
        self.cleanup_test_data()
        
        # Summary
        print("=" * 60)
        print("🏀 TEST SUMMARY 🏀")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test in self.test_results:
                if not test['success']:
                    print(f"  - {test['test']}: {test['details']}")
        
        print("\n" + "=" * 60)
        return failed_tests == 0

if __name__ == "__main__":
    tester = PlaybookProTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)