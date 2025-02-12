{
  timestamp: 1739358427083,
  type: 'status-update',
  status: 'ended',
  endedReason: 'customer-ended-call',
  artifact: {
    messages: [ [Object], [Object], [Object], [Object], [Object], [Object] ],
    messagesOpenAIFormatted: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
  },
  call: {
    id: '9c961570-cf62-45a9-983f-358e15c17cb7',
    orgId: 'e535f1ab-fbfe-4db0-86a7-91449b9c477b',
    createdAt: '2025-02-12T11:06:30.009Z',
    updatedAt: '2025-02-12T11:06:30.009Z',
    type: 'webCall',
    monitor: {
      listenUrl: 'wss://phone-call-websocket.aws-us-west-2-backend-production1.vapi.ai/9c961570-cf62-45a9-983f-358e15c17cb7/listen',
      controlUrl: 'https://phone-call-websocket.aws-us-west-2-backend-production1.vapi.ai/9c961570-cf62-45a9-983f-358e15c17cb7/control'
    },
    transport: { assistantVideoEnabled: false },
    webCallUrl: 'https://vapi.daily.co/hwwMaiMESb3Uk45ZNzUg',
    status: 'queued',
    assistantId: '77248279-497f-4486-acdb-6d3fbd61a785',
    assistantOverrides: { clientMessages: [Array] }
  },
  assistant: {
    id: '77248279-497f-4486-acdb-6d3fbd61a785',
    orgId: 'e535f1ab-fbfe-4db0-86a7-91449b9c477b',
    name: 'Leo',
    voice: {
      model: 'eleven_multilingual_v2',
      style: 0.1,
      voiceId: 'kMdYHZK2wkocJnpZxE08',
      provider: '11labs',
      stability: 0.3,
      similarityBoost: 0.5,
      fillerInjectionEnabled: false,
      inputPunctuationBoundaries: [Array]
    },
    createdAt: '2025-02-10T17:01:17.246Z',
    updatedAt: '2025-02-12T11:00:24.708Z',
    model: {
      model: 'gpt-4o-mini',
      messages: [Array],
      provider: 'openai',
      temperature: 0.4,
      emotionRecognitionEnabled: true
    },
    recordingEnabled: false,
    firstMessage: 'Grüazii, ich bin Leo von der e-ntegration GmbH. Wir möchten unseren Eltern ihr Angebot vorstellen. Dazu hätte ich einige Fragen, wenn Sie gerade 5 Minuten Zeit für mich haben.',
    voicemailMessage: 'Hi, this is Leo from SmartHome Innovations. Could you please reach back at your earliest convenience?.',
    endCallMessage: 'Danke, Sie haben mir sehr weitergeholfen! Ihnen noch einen wunderschönen Tag!',
    transcriber: { model: 'nova-2', language: 'de-CH', provider: 'deepgram' },
    silenceTimeoutSeconds: 10,
    clientMessages: [
      'transcript',
      'hang',
      'function-call',
      'speech-update',
      'metadata',
      'conversation-update',
      'transfer-update'
    ],
    serverMessages: [ 'end-of-call-report', 'status-update', 'hang', 'function-call' ],
    serverUrl: 'https://149d18b5-fe3f-4ba0-b982-a82b868464c8-00-24mbvbm32azaf.spock.replit.dev/api/webhook',
    endCallPhrases: [ 'bye for now', 'talk soon' ],
    maxDurationSeconds: 176,
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: false,
    messagePlan: { idleMessages: [Array], idleTimeoutSeconds: 10.1 },
    startSpeakingPlan: { smartEndpointingEnabled: true }
  }
}