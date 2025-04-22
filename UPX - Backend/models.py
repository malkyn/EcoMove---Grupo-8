from app import db

class Usucario(db.Model):
    id_usuario = db.Column(db.integer, primary_key=True)

class Veiculo:
    id_usuario = db.Column(db.integer, db.ForeingKey('Usuario'))