from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
import uuid
from datetime import datetime
import logging
from werkzeug.utils import secure_filename
from pathlib import Path

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','))

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = Path(__file__).parent / 'uploads'
app.config['UPLOAD_FOLDER'].mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'json', 'txt', 'png', 'jpg', 'jpeg'}

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# In-memory storage (replace with database in production)
playbooks_storage = {}
users_storage = {}
game_sessions_storage = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_id():
    return str(uuid.uuid4())

# Initialize with sample data
def init_sample_data():
    """Initialize sample basketball playbooks"""
    global playbooks_storage
    
    # Sample playbook: Pick and Roll
    sample_playbook_1 = {
        'id': generate_id(),
        'coach_id': 'sample_coach',
        'title': 'Basic Pick and Roll',
        'description': 'Fundamental pick and roll play for offense',
        'category': 'offense',
        'is_public': True,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'plays': [
            {
                'step_number': 1,
                'description': 'Initial setup - Point guard at top, Center sets up for screen',
                'player_positions': [
                    {'x': 0.5, 'y': 0.8, 'role': 'point_guard', 'responsibilities': ['Control ball', 'Read defense']},
                    {'x': 0.4, 'y': 0.6, 'role': 'center', 'responsibilities': ['Prepare for screen']},
                    {'x': 0.1, 'y': 0.4, 'role': 'forward', 'responsibilities': ['Space the floor']},
                    {'x': 0.9, 'y': 0.4, 'role': 'forward', 'responsibilities': ['Space the floor']},
                    {'x': 0.7, 'y': 0.2, 'role': 'guard', 'responsibilities': ['Spot up for three']}
                ],
                'key_actions': ['Ball handler maintains control', 'Center positions for screen']
            },
            {
                'step_number': 2,
                'description': 'Screen execution - Center sets solid screen, Point guard uses it',
                'player_positions': [
                    {'x': 0.6, 'y': 0.7, 'role': 'point_guard', 'responsibilities': ['Use screen', 'Attack basket or pass']},
                    {'x': 0.5, 'y': 0.75, 'role': 'center', 'responsibilities': ['Set solid screen', 'Roll to basket']},
                    {'x': 0.1, 'y': 0.4, 'role': 'forward', 'responsibilities': ['Stay spaced']},
                    {'x': 0.9, 'y': 0.4, 'role': 'forward', 'responsibilities': ['Stay spaced']},
                    {'x': 0.7, 'y': 0.2, 'role': 'guard', 'responsibilities': ['Be ready for pass']}
                ],
                'key_actions': ['Screen contact', 'Ball handler decision', 'Screen setter rolls']
            }
        ]
    }
    
    # Sample playbook: 2-3 Zone Defense
    sample_playbook_2 = {
        'id': generate_id(),
        'coach_id': 'sample_coach',
        'title': '2-3 Zone Defense',
        'description': 'Basic 2-3 zone defensive formation',
        'category': 'defense',
        'is_public': True,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'plays': [
            {
                'step_number': 1,
                'description': 'Initial 2-3 zone setup',
                'player_positions': [
                    {'x': 0.3, 'y': 0.8, 'role': 'guard', 'responsibilities': ['Cover top left', 'Pressure ball']},
                    {'x': 0.7, 'y': 0.8, 'role': 'guard', 'responsibilities': ['Cover top right', 'Help on ball']},
                    {'x': 0.2, 'y': 0.5, 'role': 'forward', 'responsibilities': ['Cover left wing', 'Help on post']},
                    {'x': 0.5, 'y': 0.3, 'role': 'center', 'responsibilities': ['Protect paint', 'Defend post']},
                    {'x': 0.8, 'y': 0.5, 'role': 'forward', 'responsibilities': ['Cover right wing', 'Help on post']}
                ],
                'key_actions': ['Maintain zone shape', 'Communicate rotations', 'Contest shots']
            }
        ]
    }
    
    playbooks_storage[sample_playbook_1['id']] = sample_playbook_1
    playbooks_storage[sample_playbook_2['id']] = sample_playbook_2
    
    logger.info("Sample data initialized with 2 basketball playbooks")

# API Routes

@app.route('/api', methods=['GET'])
def api_root():
    return jsonify({
        'message': 'Playbook Pro API',
        'version': '1.0.0',
        'endpoints': {
            'playbooks': '/api/playbooks',
            'upload': '/api/upload',
            'sample_data': '/api/sample-data',
            'users': '/api/users',
            'game_sessions': '/api/game-sessions',
            'ai_feedback': '/api/ai/feedback'
        }
    })

@app.route('/api/sample-data', methods=['POST'])
def create_sample_data():
    """Create sample playbooks for demonstration"""
    try:
        init_sample_data()
        return jsonify({'message': 'Sample data created successfully'}), 200
    except Exception as e:
        logger.error(f"Error creating sample data: {str(e)}")
        return jsonify({'error': 'Failed to create sample data'}), 500

# User Management
@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        
        required_fields = ['firebase_uid', 'email', 'display_name', 'role']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = generate_id()
        user = {
            'id': user_id,
            'firebase_uid': data['firebase_uid'],
            'email': data['email'],
            'display_name': data['display_name'],
            'role': data['role'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        users_storage[user_id] = user
        logger.info(f"Created user: {data['display_name']} ({data['role']})")
        
        return jsonify(user), 201
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Failed to create user'}), 500

@app.route('/api/users/<firebase_uid>', methods=['GET'])
def get_user(firebase_uid):
    try:
        user = next((u for u in users_storage.values() if u['firebase_uid'] == firebase_uid), None)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user)
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        return jsonify({'error': 'Failed to get user'}), 500

# Playbook Management
@app.route('/api/playbooks', methods=['GET'])
def get_playbooks():
    try:
        coach_id = request.args.get('coach_id')
        public_only = request.args.get('public_only') == 'true'
        
        playbooks = list(playbooks_storage.values())
        
        if coach_id:
            playbooks = [p for p in playbooks if p['coach_id'] == coach_id]
        elif public_only:
            playbooks = [p for p in playbooks if p.get('is_public', False)]
        
        # Sort by creation date (newest first)
        playbooks.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify(playbooks)
    except Exception as e:
        logger.error(f"Error getting playbooks: {str(e)}")
        return jsonify({'error': 'Failed to get playbooks'}), 500

@app.route('/api/playbooks', methods=['POST'])
def create_playbook():
    try:
        data = request.get_json()
        coach_id = request.args.get('coach_id', 'anonymous')
        
        required_fields = ['title', 'description', 'category', 'plays']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        playbook_id = generate_id()
        playbook = {
            'id': playbook_id,
            'coach_id': coach_id,
            'title': data['title'],
            'description': data['description'],
            'category': data['category'],
            'plays': data['plays'],
            'is_public': data.get('is_public', False),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        playbooks_storage[playbook_id] = playbook
        logger.info(f"Created playbook: {data['title']} by {coach_id}")
        
        return jsonify(playbook), 201
    except Exception as e:
        logger.error(f"Error creating playbook: {str(e)}")
        return jsonify({'error': 'Failed to create playbook'}), 500

@app.route('/api/playbooks/<playbook_id>', methods=['GET'])
def get_playbook(playbook_id):
    try:
        playbook = playbooks_storage.get(playbook_id)
        if not playbook:
            return jsonify({'error': 'Playbook not found'}), 404
        return jsonify(playbook)
    except Exception as e:
        logger.error(f"Error getting playbook: {str(e)}")
        return jsonify({'error': 'Failed to get playbook'}), 500

@app.route('/api/playbooks/<playbook_id>', methods=['PUT'])
def update_playbook(playbook_id):
    try:
        playbook = playbooks_storage.get(playbook_id)
        if not playbook:
            return jsonify({'error': 'Playbook not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        for field in ['title', 'description', 'category', 'plays', 'is_public']:
            if field in data:
                playbook[field] = data[field]
        
        playbook['updated_at'] = datetime.utcnow().isoformat()
        playbooks_storage[playbook_id] = playbook
        
        logger.info(f"Updated playbook: {playbook_id}")
        return jsonify(playbook)
    except Exception as e:
        logger.error(f"Error updating playbook: {str(e)}")
        return jsonify({'error': 'Failed to update playbook'}), 500

@app.route('/api/playbooks/<playbook_id>', methods=['DELETE'])
def delete_playbook(playbook_id):
    try:
        if playbook_id not in playbooks_storage:
            return jsonify({'error': 'Playbook not found'}), 404
        
        del playbooks_storage[playbook_id]
        logger.info(f"Deleted playbook: {playbook_id}")
        return jsonify({'message': 'Playbook deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting playbook: {str(e)}")
        return jsonify({'error': 'Failed to delete playbook'}), 500

# File Upload
@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid conflicts
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            
            filepath = app.config['UPLOAD_FOLDER'] / filename
            file.save(filepath)
            
            # Process file based on type
            file_info = {
                'filename': filename,
                'original_name': file.filename,
                'size': filepath.stat().st_size,
                'upload_time': datetime.utcnow().isoformat(),
                'url': f'/api/uploads/{filename}'
            }
            
            # If it's a JSON playbook, try to parse and create playbook
            if filename.lower().endswith('.json'):
                try:
                    with open(filepath, 'r') as f:
                        playbook_data = json.load(f)
                    
                    # Validate and create playbook
                    if 'title' in playbook_data and 'plays' in playbook_data:
                        playbook_id = generate_id()
                        playbook = {
                            'id': playbook_id,
                            'coach_id': request.form.get('coach_id', 'uploaded'),
                            'title': playbook_data['title'],
                            'description': playbook_data.get('description', ''),
                            'category': playbook_data.get('category', 'offense'),
                            'plays': playbook_data['plays'],
                            'is_public': playbook_data.get('is_public', False),
                            'created_at': datetime.utcnow().isoformat(),
                            'updated_at': datetime.utcnow().isoformat(),
                            'source_file': filename
                        }
                        playbooks_storage[playbook_id] = playbook
                        file_info['playbook_id'] = playbook_id
                        
                except Exception as e:
                    logger.warning(f"Failed to parse JSON playbook: {str(e)}")
            
            logger.info(f"File uploaded: {filename}")
            return jsonify(file_info), 201
        
        return jsonify({'error': 'File type not allowed'}), 400
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return jsonify({'error': 'Failed to upload file'}), 500

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        logger.error(f"Error serving file: {str(e)}")
        return jsonify({'error': 'File not found'}), 404

# Game Session Management
@app.route('/api/game-sessions', methods=['POST'])
def create_game_session():
    try:
        data = request.get_json()
        
        session_id = generate_id()
        session = {
            'id': session_id,
            'player_id': data.get('player_id', 'anonymous'),
            'playbook_id': data.get('playbook_id'),
            'play_step': data.get('play_step', 1),
            'actions': [],
            'start_time': datetime.utcnow().isoformat(),
            'end_time': None,
            'ai_feedback': None,
            'performance_score': None
        }
        
        game_sessions_storage[session_id] = session
        logger.info(f"Created game session: {session_id}")
        
        return jsonify(session), 201
    except Exception as e:
        logger.error(f"Error creating game session: {str(e)}")
        return jsonify({'error': 'Failed to create game session'}), 500

@app.route('/api/game-sessions/<session_id>', methods=['GET'])
def get_game_session(session_id):
    try:
        session = game_sessions_storage.get(session_id)
        if not session:
            return jsonify({'error': 'Game session not found'}), 404
        return jsonify(session)
    except Exception as e:
        logger.error(f"Error getting game session: {str(e)}")
        return jsonify({'error': 'Failed to get game session'}), 500

@app.route('/api/game-sessions/<session_id>/actions', methods=['POST'])
def add_action_to_session(session_id):
    try:
        session = game_sessions_storage.get(session_id)
        if not session:
            return jsonify({'error': 'Game session not found'}), 404
        
        action_data = request.get_json()
        action = {
            'timestamp': datetime.utcnow().isoformat(),
            'action_type': action_data.get('action_type'),
            'position': action_data.get('position'),
            'target_position': action_data.get('target_position'),
            'effectiveness_score': action_data.get('effectiveness_score')
        }
        
        session['actions'].append(action)
        game_sessions_storage[session_id] = session
        
        return jsonify({'message': 'Action added successfully'})
    except Exception as e:
        logger.error(f"Error adding action: {str(e)}")
        return jsonify({'error': 'Failed to add action'}), 500

@app.route('/api/game-sessions/<session_id>/end', methods=['POST'])
def end_game_session(session_id):
    try:
        session = game_sessions_storage.get(session_id)
        if not session:
            return jsonify({'error': 'Game session not found'}), 404
        
        session['end_time'] = datetime.utcnow().isoformat()
        game_sessions_storage[session_id] = session
        
        return jsonify({'message': 'Game session ended'})
    except Exception as e:
        logger.error(f"Error ending game session: {str(e)}")
        return jsonify({'error': 'Failed to end game session'}), 500

# AI Feedback (Placeholder - requires AI integration)
@app.route('/api/ai/feedback', methods=['POST'])
def generate_ai_feedback():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        actions = data.get('actions', [])
        
        # Placeholder AI feedback - replace with actual AI integration
        feedback = {
            'session_id': session_id,
            'overall_score': 75,
            'strengths': [
                'Good ball handling technique',
                'Proper screen positioning',
                'Quick decision making'
            ],
            'improvements': [
                'Work on screen timing',
                'Improve court awareness',
                'Better communication with teammates'
            ],
            'recommendations': [
                'Practice pick and roll drills',
                'Focus on reading defense',
                'Work on finishing at the rim'
            ],
            'generated_at': datetime.utcnow().isoformat()
        }
        
        # Update session with feedback
        if session_id and session_id in game_sessions_storage:
            game_sessions_storage[session_id]['ai_feedback'] = feedback
            game_sessions_storage[session_id]['performance_score'] = feedback['overall_score']
        
        logger.info(f"Generated AI feedback for session: {session_id}")
        return jsonify(feedback)
    except Exception as e:
        logger.error(f"Error generating AI feedback: {str(e)}")
        return jsonify({'error': 'Failed to generate AI feedback'}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'playbooks_count': len(playbooks_storage),
        'users_count': len(users_storage),
        'sessions_count': len(game_sessions_storage)
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Initialize sample data on startup
    init_sample_data()
    
    # Run the app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Playbook Pro API server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)