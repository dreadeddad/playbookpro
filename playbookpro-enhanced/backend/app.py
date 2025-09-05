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
import firebase_admin
from firebase_admin import credentials, storage, firestore
from google.cloud.exceptions import GoogleCloudError

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

# Initialize Firebase Admin SDK
firebase_app = None
db = None
bucket = None

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global firebase_app, db, bucket
    
    try:
        firebase_key_path = os.getenv('FIREBASE_ADMIN_KEY_PATH', './firebase-admin-key.json')
        
        if os.path.exists(firebase_key_path):
            # Initialize with service account
            cred = credentials.Certificate(firebase_key_path)
            firebase_app = firebase_admin.initialize_app(cred, {
                'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'playbook-pro-119bb.appspot.com')
            })
            logger.info("Firebase initialized with service account")
        else:
            # Initialize with default credentials (for cloud deployment)
            firebase_app = firebase_admin.initialize_app({
                'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'playbook-pro-119bb.appspot.com')
            })
            logger.info("Firebase initialized with default credentials")
        
        # Initialize Firestore and Storage
        db = firestore.client()
        bucket = storage.bucket()
        logger.info("Firebase services initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        logger.warning("Running without Firebase integration")

# Initialize Firebase on startup
initialize_firebase()

# In-memory storage fallback (for when Firebase is not available)
playbooks_storage = {}
users_storage = {}
game_sessions_storage = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_id():
    return str(uuid.uuid4())

def upload_to_firebase_storage(file, file_path):
    """Upload file to Firebase Storage"""
    try:
        if not bucket:
            raise Exception("Firebase Storage not initialized")
        
        # Create blob in Firebase Storage
        blob = bucket.blob(f'playbooks/{file_path}')
        
        # Upload file
        blob.upload_from_file(file, content_type=file.content_type)
        
        # Make the file publicly readable (optional)
        blob.make_public()
        
        # Return the public URL
        return blob.public_url
    
    except Exception as e:
        logger.error(f"Firebase Storage upload failed: {str(e)}")
        raise

def save_playbook_to_firestore(playbook_data):
    """Save playbook to Firestore"""
    try:
        if not db:
            raise Exception("Firestore not initialized")
        
        # Add to Firestore
        doc_ref = db.collection('playbooks').document(playbook_data['id'])
        doc_ref.set(playbook_data)
        
        return playbook_data
    
    except Exception as e:
        logger.error(f"Firestore save failed: {str(e)}")
        # Fallback to in-memory storage
        playbooks_storage[playbook_data['id']] = playbook_data
        return playbook_data

def get_playbooks_from_firestore(filters=None):
    """Get playbooks from Firestore"""
    try:
        if not db:
            raise Exception("Firestore not initialized")
        
        query = db.collection('playbooks')
        
        # Apply filters
        if filters:
            if 'coach_id' in filters:
                query = query.where('coach_id', '==', filters['coach_id'])
            if 'is_public' in filters:
                query = query.where('is_public', '==', filters['is_public'])
        
        # Execute query
        docs = query.stream()
        playbooks = [doc.to_dict() for doc in docs]
        
        # Sort by creation date
        playbooks.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return playbooks
    
    except Exception as e:
        logger.error(f"Firestore query failed: {str(e)}")
        # Fallback to in-memory storage
        playbooks = list(playbooks_storage.values())
        
        if filters:
            if 'coach_id' in filters:
                playbooks = [p for p in playbooks if p.get('coach_id') == filters['coach_id']]
            if 'is_public' in filters:
                playbooks = [p for p in playbooks if p.get('is_public') == filters['is_public']]
        
        return playbooks

# Initialize with sample data
def init_sample_data():
    """Initialize sample basketball playbooks"""
    
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
    
    # Save sample playbooks
    save_playbook_to_firestore(sample_playbook_1)
    save_playbook_to_firestore(sample_playbook_2)
    
    logger.info("Sample data initialized with 2 basketball playbooks")

# API Routes

@app.route('/api', methods=['GET'])
def api_root():
    firebase_status = "connected" if (firebase_app and db and bucket) else "not connected"
    return jsonify({
        'message': 'Playbook Pro API Enhanced',
        'version': '1.1.0',
        'firebase_status': firebase_status,
        'endpoints': {
            'playbooks': '/api/playbooks',
            'upload': '/api/upload (with Firebase Storage)',
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

# Enhanced File Upload with Firebase Storage
@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Supported: PDF, JSON, TXT, PNG, JPG, JPEG'}), 400
        
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        safe_filename = timestamp + filename
        
        file_info = {
            'filename': safe_filename,
            'original_name': file.filename,
            'upload_time': datetime.utcnow().isoformat(),
            'size': 0,
            'url': None,
            'firebase_url': None,
            'storage_type': 'local'  # Default fallback
        }
        
        # Try Firebase Storage first
        firebase_upload_success = False
        if bucket:
            try:
                # Reset file pointer
                file.seek(0)
                
                # Upload to Firebase Storage
                firebase_url = upload_to_firebase_storage(file, safe_filename)
                file_info.update({
                    'firebase_url': firebase_url,
                    'url': firebase_url,
                    'storage_type': 'firebase',
                    'size': len(file.read())
                })
                firebase_upload_success = True
                logger.info(f"File uploaded to Firebase Storage: {safe_filename}")
                
            except Exception as e:
                logger.error(f"Firebase Storage upload failed: {str(e)}")
                # Continue to local fallback
        
        # Local storage fallback
        if not firebase_upload_success:
            file.seek(0)  # Reset file pointer
            filepath = app.config['UPLOAD_FOLDER'] / safe_filename
            file.save(filepath)
            
            file_info.update({
                'size': filepath.stat().st_size,
                'url': f'/api/uploads/{safe_filename}',
                'storage_type': 'local'
            })
            logger.info(f"File uploaded to local storage: {safe_filename}")
        
        # Process JSON playbooks
        if filename.lower().endswith('.json'):
            try:
                file.seek(0)  # Reset file pointer
                playbook_data = json.load(file)
                
                # Validate required fields
                if 'title' in playbook_data and 'plays' in playbook_data:
                    playbook_id = generate_id()
                    enhanced_playbook = {
                        'id': playbook_id,
                        'coach_id': request.form.get('coach_id', 'uploaded'),
                        'title': playbook_data['title'],
                        'description': playbook_data.get('description', ''),
                        'category': playbook_data.get('category', 'offense'),
                        'plays': playbook_data['plays'],
                        'is_public': playbook_data.get('is_public', False),
                        'created_at': datetime.utcnow().isoformat(),
                        'updated_at': datetime.utcnow().isoformat(),
                        'source_file': safe_filename,
                        'file_url': file_info['url'],
                        'storage_type': file_info['storage_type']
                    }
                    
                    # Save to database
                    saved_playbook = save_playbook_to_firestore(enhanced_playbook)
                    file_info['playbook_id'] = playbook_id
                    file_info['playbook_created'] = True
                    
                    logger.info(f"Playbook created from JSON upload: {playbook_data['title']}")
                
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON format in file {filename}: {str(e)}")
                file_info['json_error'] = f"Invalid JSON format: {str(e)}"
            except Exception as e:
                logger.warning(f"Failed to process JSON playbook: {str(e)}")
                file_info['processing_error'] = str(e)
        
        return jsonify(file_info), 201
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return jsonify({'error': f'Failed to upload file: {str(e)}'}), 500

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files (local storage fallback)"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        logger.error(f"Error serving file: {str(e)}")
        return jsonify({'error': 'File not found'}), 404

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
        
        # Try to save to Firestore, fallback to memory
        try:
            if db:
                db.collection('users').document(user_id).set(user)
            else:
                users_storage[user_id] = user
        except Exception as e:
            logger.error(f"Failed to save user to database: {str(e)}")
            users_storage[user_id] = user
        
        logger.info(f"Created user: {data['display_name']} ({data['role']})")
        return jsonify(user), 201
        
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Failed to create user'}), 500

@app.route('/api/users/<firebase_uid>', methods=['GET'])
def get_user(firebase_uid):
    try:
        # Try Firestore first
        if db:
            try:
                users_ref = db.collection('users')
                query = users_ref.where('firebase_uid', '==', firebase_uid).limit(1)
                docs = list(query.stream())
                
                if docs:
                    return jsonify(docs[0].to_dict())
            except Exception as e:
                logger.error(f"Firestore user query failed: {str(e)}")
        
        # Fallback to memory storage
        user = next((u for u in users_storage.values() if u['firebase_uid'] == firebase_uid), None)
        if user:
            return jsonify(user)
            
        return jsonify({'error': 'User not found'}), 404
        
    except Exception as e:
        logger.error(f"Error getting user: {str(e)}")
        return jsonify({'error': 'Failed to get user'}), 500

# Enhanced Playbook Management
@app.route('/api/playbooks', methods=['GET'])
def get_playbooks():
    try:
        coach_id = request.args.get('coach_id')
        public_only = request.args.get('public_only') == 'true'
        
        filters = {}
        if coach_id:
            filters['coach_id'] = coach_id
        if public_only:
            filters['is_public'] = True
        
        playbooks = get_playbooks_from_firestore(filters)
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
            'updated_at': datetime.utcnow().isoformat(),
            'source': 'manual_creation'
        }
        
        saved_playbook = save_playbook_to_firestore(playbook)
        logger.info(f"Created playbook: {data['title']} by {coach_id}")
        
        return jsonify(saved_playbook), 201
        
    except Exception as e:
        logger.error(f"Error creating playbook: {str(e)}")
        return jsonify({'error': 'Failed to create playbook'}), 500

@app.route('/api/playbooks/<playbook_id>', methods=['GET'])
def get_playbook(playbook_id):
    try:
        # Try Firestore first
        if db:
            try:
                doc_ref = db.collection('playbooks').document(playbook_id)
                doc = doc_ref.get()
                if doc.exists:
                    return jsonify(doc.to_dict())
            except Exception as e:
                logger.error(f"Firestore playbook query failed: {str(e)}")
        
        # Fallback to memory storage
        playbook = playbooks_storage.get(playbook_id)
        if playbook:
            return jsonify(playbook)
            
        return jsonify({'error': 'Playbook not found'}), 404
        
    except Exception as e:
        logger.error(f"Error getting playbook: {str(e)}")
        return jsonify({'error': 'Failed to get playbook'}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    firebase_status = {
        'admin_sdk': firebase_app is not None,
        'firestore': db is not None,
        'storage': bucket is not None
    }
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'firebase': firebase_status,
        'storage_type': 'firebase' if bucket else 'local',
        'database_type': 'firestore' if db else 'memory'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(413)
def file_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 16MB'}), 413

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Initialize sample data on startup
    init_sample_data()
    
    # Run the app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Playbook Pro API Enhanced v1.1.0 on port {port}")
    logger.info(f"Firebase Storage: {'Enabled' if bucket else 'Disabled (using local storage)'}")
    logger.info(f"Firestore: {'Enabled' if db else 'Disabled (using memory storage)'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)