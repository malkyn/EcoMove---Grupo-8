from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:\\Users\\MarcosVini\\EcoMove.db?timeout=20'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    from upx_backend.routes.usuarios import usuarios_bp
    app.register_blueprint(usuarios_bp, url_prefix="/usuarios")

    from upx_backend.routes.veiculos import veiculos_bp
    app.register_blueprint(veiculos_bp, url_prefix="/veiculos")

    from upx_backend.routes.caronas import caronas_bp
    app.register_blueprint(caronas_bp, url_prefix="/caronas")

    with app.app_context():
        from upx_backend.models import Usuario, Veiculo, Carona
        db.create_all()

    return app
