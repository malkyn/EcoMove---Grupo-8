from flask import Blueprint, request, jsonify
from upx_backend.models import Usuario
from upx_backend import db

usuarios_bp = Blueprint("usuarios", __name__)

@usuarios_bp.route("/", methods=["GET"])
def listar_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([{
        "id_usuario": u.id_usuario,
        "nome": u.nome,
        "email": u.email,
        "id_perfil": u.id_perfil,
        "cnh": u.cnh,
        "rg": u.rg,
        "cpf": u.cpf
    } for u in usuarios])

@usuarios_bp.route("/", methods=["POST"])
def criar_usuario():
    data = request.json
    try:
        novo = Usuario(nome=data["nome"], email=data["email"], senha=data["senha"], id_perfil=data["id_perfil"], cnh=data["cnh"], rg=data["rg"], cpf=data["cpf"])
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
