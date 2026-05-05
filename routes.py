from flask import Blueprint, request, jsonify
from models import db, Admin, Opportunity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, current_user, logout_user

main = Blueprint('main', __name__)

# ================= SIGNUP =================
@main.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    # validation
    if not data.get('email') or not data.get('password') or not data.get('full_name'):
        return jsonify({"error": "All fields required"}), 400

    if Admin.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Account already exists"}), 400

    user = Admin(
        full_name=data['full_name'],
        email=data['email'],
        password=generate_password_hash(data['password'])
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Account created successfully"
    })


# ================= LOGIN =================
@main.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    user = Admin.query.filter_by(email=data.get('email')).first()

    if not user or not check_password_hash(user.password, data.get('password')):
        return jsonify({"error": "Invalid email or password"}), 401

    login_user(user)

    return jsonify({
        "status": "success",
        "message": "Login successful"
    })


# ================= LOGOUT =================
@main.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"status": "success"})


# ================= CREATE OPPORTUNITY =================
@main.route('/opportunities', methods=['POST'])
@login_required
def create_opportunity():
    data = request.get_json()

    # basic validation
    if not data.get('title') or not data.get('description') or not data.get('category'):
        return jsonify({"error": "Missing required fields"}), 400

    op = Opportunity(
        title=data.get('title'),
        duration=data.get('duration'),
        start_date=data.get('start_date'),
        description=data.get('description'),
        skills=data.get('skills'),
        category=data.get('category'),
        future_opportunities=data.get('future_opportunities'),
        max_applicants=data.get('max_applicants'),
        admin_id=current_user.id
    )

    db.session.add(op)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Opportunity created"
    })


# ================= GET ALL =================
@main.route('/opportunities', methods=['GET'])
@login_required
def get_opportunities():
    ops = Opportunity.query.filter_by(admin_id=current_user.id).all()

    result = []
    for o in ops:
        result.append({
            "id": o.id,
            "title": o.title,
            "duration": o.duration,
            "start_date": o.start_date,
            "description": o.description,
            "skills": o.skills,
            "category": o.category,
            "future_opportunities": o.future_opportunities,
            "max_applicants": o.max_applicants
        })

    return jsonify(result)   # ✅ IMPORTANT: return array (frontend-friendly)


# ================= GET SINGLE =================
@main.route('/opportunities/<int:id>', methods=['GET'])
@login_required
def get_single(id):
    op = Opportunity.query.get(id)

    if not op or op.admin_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({
        "id": op.id,
        "title": op.title,
        "duration": op.duration,
        "start_date": op.start_date,
        "description": op.description,
        "skills": op.skills,
        "category": op.category,
        "future_opportunities": op.future_opportunities,
        "max_applicants": op.max_applicants
    })


# ================= EDIT =================
@main.route('/opportunities/<int:id>', methods=['PUT'])
@login_required
def edit_opportunity(id):
    op = Opportunity.query.get(id)

    if not op or op.admin_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    op.title = data.get('title')
    op.duration = data.get('duration')
    op.start_date = data.get('start_date')
    op.description = data.get('description')
    op.skills = data.get('skills')
    op.category = data.get('category')
    op.future_opportunities = data.get('future_opportunities')
    op.max_applicants = data.get('max_applicants')

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Updated successfully"
    })


# ================= DELETE =================
@main.route('/opportunities/<int:id>', methods=['DELETE'])
@login_required
def delete_opportunity(id):
    op = Opportunity.query.get(id)

    if not op or op.admin_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(op)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Deleted successfully"
    })