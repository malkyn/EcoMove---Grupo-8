from flask import Blueprint, request, jsonify
from upx_backend.models import Carona
from datetime import datetime
from upx_backend import db

caronas_bp = Blueprint("caronas", __name__)

@caronas_bp.route("/", methods=["GET"])
def listar_caronas():
    caronas = Carona.query.all()
    return jsonify([{
        "id_carona": c.id_carona,
        "origem": c.origem,
        "destino": c.destino,
        "horario": c.horario.strftime("%H:%M"),
        "vagas_disponiveis": c.vagas_disponiveis,
        "id_usuario": c.id_usuario,
        "id_veiculo": c.id_veiculo
    } for c in caronas])

@caronas_bp.route("/", methods=["POST"])
def criar_carona():
    data = request.json
    horario_formatado = datetime.strptime(data["horario"], "%H:%M")
    try:
        nova = Carona(
            origem = data["origem"],
            destino = data["destino"],
            horario=horario_formatado,
            vagas_disponiveis = data["vagas_disponiveis"],
            id_usuario = data["id_usuario"],
            id_veiculo = data["id_veiculo"]
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

@caronas_bp.route("/<int:id_carona>", methods=["DELETE"])
def deletar_carona(id_carona):
    carona = Carona.query.get_or_404(id_carona)
    db.session.delete(carona)
    db.session.commit()
    return jsonify({"mensagem": "Carona cancelada com sucesso!"})