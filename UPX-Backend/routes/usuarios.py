from flask import Blueprint, request, jsonify
from models import Usuario
from __init__ import db

usuarios_bp = Blueprint("usuarios", __name__)

@usuarios_bp.route("/", methods=["GET"])
def listar_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([{
        "id_usuario": u.id_usuario,
        "nome": u.nome,
        "email": u.email
    } for u in usuarios])

@usuarios_bp.route("/", methods=["POST"])
def criar_usuario():
    data = request.json
    try:
        novo = Usuario(nome=data["nome"], email=data["email"], senha=data["senha"])
        db.session.add(novo)
        db.session.commit()
        return jsonify({"mensagem": "Usuário criado com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
    finally:
        db.session.close()

@usuarios_bp.route("/<int:id_usuario>", methods=["DELETE"])
def deletar_usuario(id_usuario):
    usuario = Usuario.query.get_or_404(id_usuario)
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"mensagem": "Usuário deletado com sucesso!"})
