from flask import Blueprint, request, jsonify
from upx_backend.models import Veiculo
from upx_backend import db
from flask_cors import cross_origin

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

@veiculos_bp.route("/", methods=["POST", "OPTIONS"])
@cross_origin(origin="http://localhost:5173", supports_credentials=True)
def criar_veiculo():
    data = request.json
    try:
        novo = Veiculo(
            modelo = data["modelo"],
            id_placa = data["placa"],
            id_usuario = data["id_usuario"],
            tipo = data["tipo"]
        )
        db.session.add(novo)
        db.session.commit()
        return jsonify({"mensagem": "Veículo cadastrado com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"erro": str(e)}), 500
    finally:
        db.session.close()

@veiculos_bp.route("/<int:id_veiculo>", methods=["DELETE", "OPTIONS"])
def deletar_veiculo(id_veiculo):
    veiculo = Veiculo.query.get_or_404(id_veiculo)
    db.session.delete(veiculo)
    db.session.commit()
    return jsonify({"mensagem": "Veículo deletado com sucesso!"})
