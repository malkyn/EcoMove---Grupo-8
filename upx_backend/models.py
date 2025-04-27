from upx_backend import db
import enum

class PerfilUsuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)


class Usuario(db.Model):
    id_usuario = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(100), nullable=False)
    id_perfil = db.Column(db.Integer, db.ForeignKey('perfil_usuario.id'), nullable=False)
    cnh = db.Column(db.String(20))
    rg = db.Column(db.String(20))
    cpf = db.Column(db.String(20))

class Veiculo(db.Model):
    id_veiculo = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'))
    modelo = db.Column(db.String(100), nullable=False)
    id_placa = db.Column(db.String(10), unique=True, nullable=False)
    tipo = db.Column(db.String(50))
    cor = db.Column(db.String(50))

class Carona(db.Model):
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=False)
    id_veiculo = db.Column(db.Integer, db.ForeignKey('veiculo.id_veiculo'), nullable=False)
    id_carona = db.Column(db.Integer, primary_key=True)
    origem = db.Column(db.String(100), nullable=False)
    destino = db.Column(db.String(100), nullable=False)
    horario = db.Column(db.DateTime, nullable=False)
    vagas_disponiveis = db.Column(db.Integer, nullable=False)
