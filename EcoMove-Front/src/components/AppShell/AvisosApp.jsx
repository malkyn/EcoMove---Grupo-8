import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../Feedback/FeedbackContext";
import { useAtualizacaoApp, useConexao, useInstalarApp } from "../../hooks/usePwa";
import { IconeCelular } from "../Icones";

const CHAVE_ADIADO = "ecomove_instalar_adiado";
const ADIAR_MS = 14 * 24 * 60 * 60 * 1000;

function conviteAdiado() {
  try {
    return Number(localStorage.getItem(CHAVE_ADIADO) || 0) > Date.now() - ADIAR_MS;
  } catch {
    return false;
  }
}

function adiarConvite() {
  try {
    localStorage.setItem(CHAVE_ADIADO, String(Date.now()));
  } catch {
    // armazenamento bloqueado: o convite volta na próxima visita
  }
}

/**
 * Faixa abaixo do topo: sem conexão (âmbar) ou versão nova pronta (verde).
 * Sem conexão vem primeiro: o que a pessoa precisa saber é por que nada carrega.
 */
export function AvisosTopo() {
  const online = useConexao();
  const { atualizacaoPronta, atualizar } = useAtualizacaoApp();
  const toast = useToast();
  const estavaOnline = useRef(online);

  useEffect(() => {
    if (online && !estavaOnline.current) toast("Conexão de volta.");
    estavaOnline.current = online;
  }, [online, toast]);

  if (!online) {
    return (
      <div className="app-aviso" role="status">
        <span>Sem conexão. Mostrando o que já estava carregado.</span>
      </div>
    );
  }
  if (atualizacaoPronta) {
    return (
      <div className="app-aviso app-aviso-novo" role="status">
        <span>Versão nova do EcoMove pronta.</span>
        <button type="button" className="app-btn app-btn-primario app-btn-pequeno" onClick={atualizar}>
          Atualizar
        </button>
      </div>
    );
  }
  return null;
}

/**
 * Convite para instalar o app, acima das abas. Só aparece quando o navegador permite
 * instalar (Android/Chrome/Edge) e some por 14 dias se a pessoa tocar em "Agora não".
 */
export function ConviteInstalar() {
  const { podeInstalar, instalar } = useInstalarApp();
  const toast = useToast();
  const [escondido, setEscondido] = useState(conviteAdiado);

  if (!podeInstalar || escondido) return null;

  const agoraNao = () => {
    adiarConvite();
    setEscondido(true);
  };

  const aoInstalar = async () => {
    const aceitou = await instalar();
    if (aceitou) toast("App instalado. Ele fica na tela inicial do aparelho.");
    else adiarConvite();
  };

  return (
    <aside className="app-convite" aria-label="Instalar o app">
      <IconeCelular className="app-convite-icone" />
      <div className="app-convite-texto">
        <strong>Instale o EcoMove</strong>
        <span>Abre direto da tela inicial, sem o navegador.</span>
      </div>
      <div className="app-convite-acoes">
        <button type="button" className="app-btn app-btn-vazado app-btn-pequeno" onClick={agoraNao}>
          Agora não
        </button>
        <button type="button" className="app-btn app-btn-primario app-btn-pequeno" onClick={aoInstalar}>
          Instalar
        </button>
      </div>
    </aside>
  );
}
