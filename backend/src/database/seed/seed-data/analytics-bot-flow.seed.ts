export const analyticsBotFlow = {
  name: 'E-commerce Support Flow',
  description: 'Full e-commerce support flow with product, order, return, complaint and agent branches',
  startNodeId: 'ec-start',
  version: 1,
  published: true,
  nodes: [
    // ── Entry ─────────────────────────────────────────────────────────────
    {
      id: 'ec-start',
      type: 'startNode',
      position: { x: 500, y: 40 },
      data: { label: 'Start' },
    },
    {
      id: 'ec-welcome',
      type: 'messageNode',
      position: { x: 500, y: 150 },
      data: {
        label: 'Boas-vindas',
        messages: [
          'Olá! 👋 Bem-vindo ao suporte da nossa loja online.',
          'Posso ajudar com produtos, pedidos, devoluções, reclamações ou te conectar a um atendente humano.',
        ],
      },
    },
    {
      id: 'ec-main-intent',
      type: 'intentNode',
      position: { x: 500, y: 300 },
      data: {
        label: 'Detectar Intenção',
        language: 'pt',
        confidenceThreshold: 0.55,
        intents: [
          'greeting',
          'products',
          'order_status',
          'return_request',
          'complaint',
          'human_agent',
          'farewell',
        ],
      },
    },

    // ── Greeting branch ───────────────────────────────────────────────────
    {
      id: 'ec-greeting-reply',
      type: 'messageNode',
      position: { x: 80, y: 470 },
      data: {
        label: 'Resposta de Saudação',
        messages: ['Olá! Estou aqui para ajudar. O que você precisa hoje?'],
      },
    },
    {
      id: 'ec-end-greeting',
      type: 'endNode',
      position: { x: 80, y: 600 },
      data: { label: 'Fim Saudação', message: 'Até mais! 👋' },
    },

    // ── Products branch ───────────────────────────────────────────────────
    {
      id: 'ec-ask-category',
      type: 'inputNode',
      position: { x: 280, y: 470 },
      data: {
        label: 'Pedir Categoria',
        prompt: 'Qual categoria de produto você está procurando? (ex: eletrônicos, roupas, calçados)',
        variableName: 'categoria',
      },
    },
    {
      id: 'ec-product-info',
      type: 'messageNode',
      position: { x: 280, y: 590 },
      data: {
        label: 'Informações do Produto',
        messages: [
          'Ótimo! Temos excelentes opções em {{categoria}}.',
          'Nosso catálogo está atualizado com as melhores marcas e preços do mercado. Acesse: loja.exemplo.com/catalogo',
        ],
      },
    },
    {
      id: 'ec-upsell',
      type: 'messageNode',
      position: { x: 280, y: 710 },
      data: {
        label: 'Oferta Especial',
        messages: [
          '💡 Aproveite! Esta semana temos 15% de desconto em toda a linha de {{categoria}} com o cupom: DESCONTO15',
        ],
      },
    },
    {
      id: 'ec-end-products',
      type: 'endNode',
      position: { x: 280, y: 830 },
      data: { label: 'Fim Produtos', message: 'Obrigado pelo interesse! Boas compras! 🛍️' },
    },

    // ── Order Status branch ───────────────────────────────────────────────
    {
      id: 'ec-ask-order-id',
      type: 'inputNode',
      position: { x: 480, y: 470 },
      data: {
        label: 'Pedir Número do Pedido',
        prompt: 'Por favor, informe o número do seu pedido:',
        variableName: 'numeroPedido',
      },
    },
    {
      id: 'ec-set-order-var',
      type: 'variableNode',
      position: { x: 480, y: 590 },
      data: {
        label: 'Registrar Pedido',
        assignments: [{ name: 'pedidoConsultado', value: '{{numeroPedido}}', type: 'set' }],
      },
    },
    {
      id: 'ec-order-status-msg',
      type: 'messageNode',
      position: { x: 480, y: 710 },
      data: {
        label: 'Status do Pedido',
        messages: [
          'Consultando o pedido #{{numeroPedido}}... ⏳',
          '✅ Seu pedido está em trânsito e deve chegar em até 3 dias úteis. Você receberá atualizações por e-mail.',
        ],
      },
    },
    {
      id: 'ec-end-order',
      type: 'endNode',
      position: { x: 480, y: 830 },
      data: { label: 'Fim Pedido', message: 'Rastreamento concluído! Estamos à disposição.' },
    },

    // ── Return Request branch ─────────────────────────────────────────────
    {
      id: 'ec-return-policy',
      type: 'messageNode',
      position: { x: 680, y: 470 },
      data: {
        label: 'Política de Devolução',
        messages: [
          'Claro! Nossa política permite troca ou devolução em até 30 dias após a compra.',
          'Para iniciar o processo, preciso de algumas informações.',
        ],
      },
    },
    {
      id: 'ec-ask-return-reason',
      type: 'inputNode',
      position: { x: 680, y: 590 },
      data: {
        label: 'Motivo da Devolução',
        prompt:
          'Qual o motivo da devolução? (produto defeituoso, tamanho incorreto, arrependimento, etc.)',
        variableName: 'motivoDevolucao',
      },
    },
    {
      id: 'ec-return-confirm',
      type: 'messageNode',
      position: { x: 680, y: 710 },
      data: {
        label: 'Confirmar Devolução',
        messages: [
          'Solicitação de devolução registrada! Motivo: {{motivoDevolucao}}.',
          '📧 Em até 48h você receberá as instruções de envio por e-mail.',
        ],
      },
    },
    {
      id: 'ec-end-return',
      type: 'endNode',
      position: { x: 680, y: 830 },
      data: { label: 'Fim Devolução', message: 'Devolução solicitada com sucesso!' },
    },

    // ── Complaint branch ──────────────────────────────────────────────────
    {
      id: 'ec-empathy',
      type: 'messageNode',
      position: { x: 880, y: 470 },
      data: {
        label: 'Mensagem de Empatia',
        messages: [
          'Lamento muito que você esteja passando por isso. 😔',
          'Vou fazer tudo para resolver. Pode descrever o problema em detalhes?',
        ],
      },
    },
    {
      id: 'ec-collect-complaint',
      type: 'inputNode',
      position: { x: 880, y: 590 },
      data: {
        label: 'Coletar Reclamação',
        prompt: 'Descreva detalhadamente o problema que você está enfrentando:',
        variableName: 'reclamacao',
      },
    },
    {
      id: 'ec-complaint-condition',
      type: 'conditionNode',
      position: { x: 880, y: 710 },
      data: {
        label: 'Avaliar Urgência',
        condition:
          '{{reclamacao}} includes "urgente" || {{reclamacao}} includes "cancelar" || {{reclamacao}} includes "reembolso"',
      },
    },
    {
      id: 'ec-escalate',
      type: 'messageNode',
      position: { x: 790, y: 840 },
      data: {
        label: 'Escalonar para Humano',
        messages: [
          'Entendi a gravidade do problema. Estou escalando sua reclamação para um atendente especializado.',
          '⚡ Você receberá um contato de retorno em até 2 horas úteis.',
        ],
      },
    },
    {
      id: 'ec-autoresolve',
      type: 'messageNode',
      position: { x: 970, y: 840 },
      data: {
        label: 'Resolução Automática',
        messages: [
          'Sua reclamação foi registrada.',
          '📋 Número de protocolo: #REC-{{numeroPedido}}. Nossa equipe responderá em até 5 dias úteis.',
        ],
      },
    },
    {
      id: 'ec-end-complaint',
      type: 'endNode',
      position: { x: 880, y: 970 },
      data: { label: 'Fim Reclamação', message: 'Reclamação registrada. Obrigado pela paciência!' },
    },

    // ── Human Agent branch ────────────────────────────────────────────────
    {
      id: 'ec-agent-msg',
      type: 'messageNode',
      position: { x: 1100, y: 470 },
      data: {
        label: 'Agendar Atendimento',
        messages: [
          'Claro! Posso te conectar a um de nossos atendentes.',
          '🕐 Horário de atendimento: Seg–Sex, 8h–18h. Aguarde um momento enquanto verifico a disponibilidade...',
        ],
      },
    },
    {
      id: 'ec-agent-wait',
      type: 'delayNode',
      position: { x: 1100, y: 590 },
      data: { label: 'Aguardar Disponibilidade', delayMs: 2000 },
    },
    {
      id: 'ec-agent-connect',
      type: 'messageNode',
      position: { x: 1100, y: 700 },
      data: {
        label: 'Conectar Agente',
        messages: ['✅ Um atendente estará disponível em instantes. Por favor, aguarde na linha.'],
      },
    },
    {
      id: 'ec-end-agent',
      type: 'endNode',
      position: { x: 1100, y: 820 },
      data: { label: 'Fim Agente', message: 'Transferindo para atendimento humano. Obrigado pela espera!' },
    },

    // ── Farewell branch ───────────────────────────────────────────────────
    {
      id: 'ec-farewell-msg',
      type: 'messageNode',
      position: { x: 1290, y: 470 },
      data: {
        label: 'Despedida',
        messages: [
          'Foi um prazer te atender! 😊',
          'Volte sempre que precisar. Tenha um ótimo dia!',
        ],
      },
    },
    {
      id: 'ec-end-farewell',
      type: 'endNode',
      position: { x: 1290, y: 600 },
      data: { label: 'Fim Despedida', message: 'Até logo!' },
    },

    // ── Fallback branch ───────────────────────────────────────────────────
    {
      id: 'ec-fallback-msg',
      type: 'messageNode',
      position: { x: 1480, y: 470 },
      data: {
        label: 'Fallback',
        messages: [
          'Desculpe, não consegui entender sua solicitação. 😕',
          'Posso te ajudar com: produtos, status de pedido, devoluções, reclamações ou atendimento humano. O que você precisa?',
        ],
      },
    },
    {
      id: 'ec-end-fallback',
      type: 'endNode',
      position: { x: 1480, y: 600 },
      data: { label: 'Fim Fallback', message: 'Obrigado pelo contato!' },
    },
  ],

  edges: [
    // Entry path
    { id: 'ee-start-welcome', source: 'ec-start', target: 'ec-welcome' },
    { id: 'ee-welcome-intent', source: 'ec-welcome', target: 'ec-main-intent' },

    // Intent branches
    { id: 'ee-to-greeting', source: 'ec-main-intent', target: 'ec-greeting-reply', sourceHandle: 'greeting' },
    { id: 'ee-to-products', source: 'ec-main-intent', target: 'ec-ask-category', sourceHandle: 'products' },
    { id: 'ee-to-order', source: 'ec-main-intent', target: 'ec-ask-order-id', sourceHandle: 'order_status' },
    { id: 'ee-to-return', source: 'ec-main-intent', target: 'ec-return-policy', sourceHandle: 'return_request' },
    { id: 'ee-to-complaint', source: 'ec-main-intent', target: 'ec-empathy', sourceHandle: 'complaint' },
    { id: 'ee-to-agent', source: 'ec-main-intent', target: 'ec-agent-msg', sourceHandle: 'human_agent' },
    { id: 'ee-to-farewell', source: 'ec-main-intent', target: 'ec-farewell-msg', sourceHandle: 'farewell' },
    { id: 'ee-to-fallback', source: 'ec-main-intent', target: 'ec-fallback-msg', sourceHandle: 'fallback' },

    // Greeting flow
    { id: 'ee-greeting-end', source: 'ec-greeting-reply', target: 'ec-end-greeting' },

    // Products flow
    { id: 'ee-cat-info', source: 'ec-ask-category', target: 'ec-product-info' },
    { id: 'ee-info-upsell', source: 'ec-product-info', target: 'ec-upsell' },
    { id: 'ee-upsell-end', source: 'ec-upsell', target: 'ec-end-products' },

    // Order flow
    { id: 'ee-orderid-var', source: 'ec-ask-order-id', target: 'ec-set-order-var' },
    { id: 'ee-var-status', source: 'ec-set-order-var', target: 'ec-order-status-msg' },
    { id: 'ee-status-end', source: 'ec-order-status-msg', target: 'ec-end-order' },

    // Return flow
    { id: 'ee-policy-reason', source: 'ec-return-policy', target: 'ec-ask-return-reason' },
    { id: 'ee-reason-confirm', source: 'ec-ask-return-reason', target: 'ec-return-confirm' },
    { id: 'ee-confirm-end', source: 'ec-return-confirm', target: 'ec-end-return' },

    // Complaint flow
    { id: 'ee-empathy-collect', source: 'ec-empathy', target: 'ec-collect-complaint' },
    { id: 'ee-collect-cond', source: 'ec-collect-complaint', target: 'ec-complaint-condition' },
    { id: 'ee-cond-escalate', source: 'ec-complaint-condition', target: 'ec-escalate', sourceHandle: 'true' },
    { id: 'ee-cond-auto', source: 'ec-complaint-condition', target: 'ec-autoresolve', sourceHandle: 'false' },
    { id: 'ee-escalate-end', source: 'ec-escalate', target: 'ec-end-complaint' },
    { id: 'ee-auto-end', source: 'ec-autoresolve', target: 'ec-end-complaint' },

    // Agent flow
    { id: 'ee-agent-wait', source: 'ec-agent-msg', target: 'ec-agent-wait' },
    { id: 'ee-wait-connect', source: 'ec-agent-wait', target: 'ec-agent-connect' },
    { id: 'ee-connect-end', source: 'ec-agent-connect', target: 'ec-end-agent' },

    // Farewell flow
    { id: 'ee-farewell-end', source: 'ec-farewell-msg', target: 'ec-end-farewell' },

    // Fallback flow
    { id: 'ee-fallback-end', source: 'ec-fallback-msg', target: 'ec-end-fallback' },
  ],
};

export const analyticsIntents = [
  {
    name: 'greeting',
    examples: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'ei', 'opa', 'hey'],
    answers: ['Olá! Como posso ajudar?'],
    language: 'pt',
  },
  {
    name: 'products',
    examples: [
      'quero ver produtos',
      'me mostra os produtos',
      'vocês têm eletrônicos',
      'quero comprar algo',
      'ver catálogo',
      'quais produtos vocês têm',
      'produtos disponíveis',
      'preciso comprar um presente',
    ],
    answers: ['Temos muitos produtos!'],
    language: 'pt',
  },
  {
    name: 'order_status',
    examples: [
      'qual o status do meu pedido',
      'onde está meu pedido',
      'rastrear pedido',
      'meu pedido já chegou',
      'quando chega meu pedido',
      'status do pedido',
      'meu pedido está onde',
    ],
    answers: ['Vou consultar seu pedido.'],
    language: 'pt',
  },
  {
    name: 'return_request',
    examples: [
      'quero devolver um produto',
      'fazer devolução',
      'trocar produto',
      'produto com defeito',
      'quero trocar o tamanho',
      'política de devolução',
      'como fazer devolução',
      'quero pedir devolução',
    ],
    answers: ['Posso ajudar com a devolução.'],
    language: 'pt',
  },
  {
    name: 'complaint',
    examples: [
      'quero reclamar',
      'estou insatisfeito',
      'problema com meu pedido',
      'recebi produto errado',
      'produto chegou danificado',
      'estou muito decepcionado',
      'quero fazer uma reclamação',
      'péssimo atendimento',
    ],
    answers: ['Lamento muito pelo transtorno.'],
    language: 'pt',
  },
  {
    name: 'human_agent',
    examples: [
      'quero falar com um humano',
      'atendimento humano',
      'falar com atendente',
      'preciso de um atendente',
      'humano por favor',
      'não quero falar com robô',
    ],
    answers: ['Vou te conectar a um atendente.'],
    language: 'pt',
  },
  {
    name: 'farewell',
    examples: [
      'tchau',
      'até logo',
      'obrigado',
      'até mais',
      'foi ótimo',
      'valeu',
      'encerrar atendimento',
      'não preciso mais de ajuda',
    ],
    answers: ['Até logo!'],
    language: 'pt',
  },
];
