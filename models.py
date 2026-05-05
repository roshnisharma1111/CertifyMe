from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

# ================= ADMIN MODEL =================
class Admin(UserMixin, db.Model):
    __tablename__ = "admin"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # Relationship (one admin → many opportunities)
    opportunities = db.relationship(
        "Opportunity",
        backref="creator",
        lazy=True,
        cascade="all, delete"
    )

    def __repr__(self):
        return f"<Admin {self.email}>"

# ================= OPPORTUNITY MODEL =================
class Opportunity(db.Model):
    __tablename__ = "opportunity"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.String(50))
    start_date = db.Column(db.String(50))
    description = db.Column(db.Text, nullable=False)

    skills = db.Column(db.String(200))
    category = db.Column(db.String(50))
    future_opportunities = db.Column(db.String(200))
    max_applicants = db.Column(db.Integer)

    # Foreign key (VERY IMPORTANT)
    admin_id = db.Column(
        db.Integer,
        db.ForeignKey("admin.id"),
        nullable=False
    )

    def __repr__(self):
        return f"<Opportunity {self.title}>"