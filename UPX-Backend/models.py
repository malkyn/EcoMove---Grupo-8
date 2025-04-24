from __init__ import db

class Usuario(db.Model):
    id_usuario = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(100), nullable=False)

class Veiculo(db.Model):
    id_veiculo = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'))
    modelo = db.Column(db.String(100), nullable=False)
    placa = db.Column(db.String(10), unique=True, nullable=False)
    tipo = db.Column(db.String(50))

class Carona(db.Model):
    id_carona = db.Column(db.Integer, primary_key=True)
    origem = db.Column(db.String(100), nullable=False)
    destino = db.Column(db.String(100), nullable=False)
    horario = db.Column(db.String(4), nullable=False)
    vagas = db.Column(db.Integer, nullable=False)
