import React from "react";
import "./CaronaCard.css";
import { formatarDataHora } from "../../utils/formatar";
import { propulsaoSustentavel, rotuloPropulsao } from "../../utils/veiculos";

/**
 * Card de carona no formato completo do contrato (docs/api-contrato.md).
 * `children` recebe os botões de ação (reservar, cancelar, avaliar...).
 */
function CaronaCard({ carona, children }) {
  const { origem, destino, horario, motorista, veiculo, vagas_disponiveis, vagas_restantes } =
    carona;
  const lotada = vagas_restantes === 0;

  return (
    <article className={`carona-card ${lotada ? "carona-lotada" : ""}`}>
      <div className="carona-rota">
        <span className="carona-local">{origem}</span>
        <span className="carona-seta" aria-hidden="true">
          →
        </span>
        <span className="carona-local">{destino}</span>
      </div>

      <dl className="carona-info">
        <div>
          <dt>Saída</dt>
          <dd>{formatarDataHora(horario)}</dd>
        </div>
        {motorista && (
          <div>
            <dt>Motorista</dt>
            <dd>{motorista.nome}</dd>
          </div>
        )}
        {veiculo && (
          <div>
            <dt>Veículo</dt>
            <dd>
              {veiculo.modelo}
              {veiculo.categoria === "moto" && <span className="badge-categoria">Moto</span>}
              {propulsaoSustentavel(veiculo.propulsao) && (
                <span className="badge-eletrico">{rotuloPropulsao(veiculo.propulsao)}</span>
              )}
            </dd>
          </div>
        )}
        <div>
          <dt>Vagas</dt>
          <dd>
            {lotada ? "Lotada" : `${vagas_restantes} de ${vagas_disponiveis} disponíveis`}
          </dd>
        </div>
      </dl>

      {children && <div className="carona-acoes">{children}</div>}
    </article>
  );
}

export default CaronaCard;
