from flask import Blueprint, request, jsonify
from models import Veiculo
from __init__ import db

veiculos_bp = Blueprint("veiculos", __name__)

@veiculos_bp.route("/", methods=["GET"])
def listar_veiculos():
    veiculos = Veiculo.query.all()
    return jsonify([{
        "id_veiculo": v.id_veiculo,
        "modelo": v.modelo,
        "placa": v.placa,
        "capacidade": v.capacidade,
        "id_usuario": v.id_usuario
    } for v in veiculos])

@veiculos_bp.route("/", methods=["POST"])
def criar_veiculo():
    data = request.json
    try:
        novo = Veiculo(
            modelo=data["modelo"],
            placa=data["placa"],
            capacidade=data["capacidade"],
            id_usuario=data["id_usuario"]
        )
        db.session.add(novo)
        db.session.commit()
        return jsonify({"mensagem": "Veículo cadastrado com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
    finally:
        db.session.close()