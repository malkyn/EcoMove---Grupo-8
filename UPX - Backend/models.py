from app import db

class Usuario(db.Model):
    id_usuario = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email= db.Column(db.String(100), unique=True, nullable=False)
    senha= db.Column(db.String(100), nullable=False)

class Veiculo:
    id_veiculo = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'))
    modelo = db.Column(db.String(100), nullable=False)
    placa = db.Column(db.String(10), unique=True, nullable=False)
    tipo = db.Column(db.String(50)) 

class Carona:
    id_carona = db.Column(db.Integer, primary_key=True)