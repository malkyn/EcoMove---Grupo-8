from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    from routes.usuarios import usuarios_bp
    from routes.veiculos import veiculos_bp
    from routes.caronas import caronas_bp

    app.register_blueprint(usuarios_bp, url_prefix="/usuarios")
    app.register_blueprint(veiculos_bp, url_prefix="/veiculos")
    app.register_blueprint(caronas_bp, url_prefix="/caronas")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
