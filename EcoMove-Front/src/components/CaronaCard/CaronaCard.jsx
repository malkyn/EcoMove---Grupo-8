import React from "react";
import "./CaronaCard.css";
import { formatarDataHora } from "../../utils/formatar";
import { formatarKm, formatarReais } from "../../utils/estimativas";
import { propulsaoSustentavel, rotuloPropulsao } from "../../utils/veiculos";

/**
 * Card de carona no formato completo do contrato (docs/api-contrato.md).
 * `children` recebe os botões de ação (reservar, cancelar, avaliar...).
 */
function CaronaCard({ carona, children }) {
  const {
    origem,
    destino,
    horario,
    motorista,
    veiculo,
    vagas_disponiveis,
    vagas_restantes,
    preco_estimado,
    compatibilidade,
  } = carona;
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
        {preco_estimado !== null && preco_estimado !== undefined && (
          <div>
            <dt>Contribuição</dt>
            <dd className="carona-preco">{formatarReais(preco_estimado)}</dd>
          </div>
        )}
      </dl>

      {compatibilidade && (
        <p className="carona-compatibilidade">
          Saída a {formatarKm(compatibilidade.distancia_origem_km)} de você · chegada a{" "}
          {formatarKm(compatibilidade.distancia_destino_km)} do seu destino
        </p>
      )}

      {children && <div className="carona-acoes">{children}</div>}
    </article>
  );
}

export default CaronaCard;
