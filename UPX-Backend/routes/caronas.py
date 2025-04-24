from flask import Blueprint, request, jsonify
from models import Carona
from __init__ import db

caronas_bp = Blueprint("caronas", __name__)

@caronas_bp.route("/", methods=["GET"])
def listar_caronas():
    caronas = Carona.query.all()
    return jsonify([{
        "id_carona": c.id_carona,
        "origem": c.origem,
        "destino": c.destino,
        "horario": c.horario,
        "id_usuario": c.id_usuario,
        "id_veiculo": c.id_veiculo
    } for c in caronas])

@caronas_bp.route("/", methods=["POST"])
def criar_carona():
    data = request.json
    try:
        nova = Carona(
            origem=data["origem"],
            destino=data["destino"],
            horario=data["horario"],
            id_usuario=data["id_usuario"],
            id_veiculo=data["id_veiculo"]
        )
        db.session.add(nova)
        db.session.commit()
        return jsonify({"mensagem": "Motorista a caminho!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
        "erro": "Erro ao buscar motorista parceiro.",
        "detalhes": str(e)
    }), 500

    finally:
        db.session.close()