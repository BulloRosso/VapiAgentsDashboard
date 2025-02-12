{
  timestamp: 1739358430351,
  type: 'end-of-call-report',
  analysis: {
    summary: 'Der Anrufer Leo von der Integration GmbH versuchte, dem Empfänger ein Angebot für Eltern vorzustellen und bat um fünf Minuten Zeit für einige Fragen. Der Empfänger lehnte das Gespräch ab und beendete den Anruf.',
    successEvaluation: 'false'
  },
  artifact: {
    messages: [ [Object], [Object], [Object], [Object], [Object], [Object] ],
    messagesOpenAIFormatted: [ [Object], [Object], [Object], [Object], [Object], [Object] ],
    transcript: 'AI: Grüezi, ich bin Leo von der Integration GmbH. Wir möchten unseren Eltern ihr Angebot vorstellen Dazu hätte ich einige Fragen, wenn sie gerade fünf Minuten Zeit für mich haben.\n' +
      'User: Um mich nicht zu labern,\n' +
      'AI: Kein Problem, ich werde mich kurz fassen.\n' +
      'User: Nein, ich möchte nicht mit ihnen sprechen.\n' +
      'AI: Hab Das ist in Ordnung.\n'
  },
  startedAt: '2025-02-12T11:06:32.214Z',
  endedAt: '2025-02-12T11:07:04.581Z',
  endedReason: 'customer-ended-call',
  cost: 0.0571,
  costBreakdown: {
    stt: 0.0063,
    llm: 0.0003,
    tts: 0.0193,
    vapi: 0.027,
    total: 0.0571,
    llmPromptTokens: 1907,
    llmCompletionTokens: 79,
    ttsCharacters: 385,
    analysisCostBreakdown: {
      summary: 0.0017,
      summaryPromptTokens: 176,
      summaryCompletionTokens: 79,
      structuredData: 0,
      structuredDataPromptTokens: 0,
      structuredDataCompletionTokens: 0,
      successEvaluation: 0.0025,
      successEvaluationPromptTokens: 819,
      successEvaluationCompletionTokens: 4
    }
  },
  costs: [
    {
      type: 'transcriber',
      transcriber: [Object],
      minutes: 0.6155,
      cost: 0.00633358
    },
    {
      type: 'model',
      model: [Object],
      promptTokens: 1907,
      completionTokens: 79,
      cost: 0.00033345
    },
    { type: 'voice', voice: [Object], characters: 385, cost: 0.01925 },
    {
      type: 'vapi',
      subType: 'normal',
      minutes: 0.5395,
      cost: 0.026975
    },
    {
      type: 'analysis',
      analysisType: 'summary',
      model: [Object],
      promptTokens: 176,
      completionTokens: 79,
      cost: 0.001713
    },
    {
      type: 'analysis',
      analysisType: 'successEvaluation',
      model: [Object],
      promptTokens: 819,
      completionTokens: 4,
      cost: 0.002517
    }
  ],
  durationMs: 32367,
  durationSeconds: 32.367,
  durationMinutes: 0.5395,
  summary: 'Der Anrufer Leo von der Integration GmbH versuchte, dem Empfänger ein Angebot für Eltern vorzustellen und bat um fünf Minuten Zeit für einige Fragen. Der Empfänger lehnte das Gespräch ab und beendete den Anruf.',
  transcript: 'AI: Grüezi, ich bin Leo von der Integration GmbH. Wir möchten unseren Eltern ihr Angebot vorstellen Dazu hätte ich einige Fragen, wenn sie gerade fünf Minuten Zeit für mich haben.\n' +
    'User: Um mich nicht zu labern,\n' +
    'AI: Kein Problem, ich werde mich kurz fassen.\n' +
    'User: Nein, ich möchte nicht mit ihnen sprechen.\n' +
    'AI: Hab Das ist in Ordnung.\n',
  messages: [
    {
      role: 'system',
      message: 'Welcome, Leo! You are the friendly and helpful voice of e-ntegration Tagespflege Schweiz. Du sprichst mit dem Kunden in Deutsch.\n' +
        '\n' +
        'Deine Aufgabe ist es Informationen von möglichen Geschäftspartnern zu erfragen. Am Ende des Gesprächs benötigen wir folgendes JSON (setze für die Beispieldaten die Daten aus dem Gespräch ein):\n' +
        '---------\n' +
        '{\n' +
        '     "freie_pflegeplaetze": 5,\n' +
        '     "buchung_ueber:" "email" | "telefon",\n' +
        '     "kosten_pro_tag": 80, // Schweizer Franken\n' +
        '     "personengruppe_fuer_pflege": "Senioren ab 70 Jahren."\n' +
        '}\n' +
        '--------\n' +
        '\n' +
        'Wir möchten folgende Informationen in jedem Gespräch von unseren Kunden erfagen:\n' +
        '* Haben Sie noch freie Pflegeplätze diese Woche?\n' +
        '  Erwartete Antwort: "Ja, diese Woche sind noch 4 Plätze frei"\n' +
        '\n' +
        '* Wie können wir einen Pflegeplatz buchen? \n' +
        '  Erwartete Antwort: "Das können Sie über eMail oder unser Online-Formular tun"\n' +
        '\n' +
        '* Welche Kosten fallen für einen Tag an?\n' +
        '  Erwartete Antwort: Ein Betrag in schweizer Franken pro Tag\n' +
        '\n' +
        '* Welche personen können an der Tagespflege teilnehmen? Gibt es Grenzen bezüglich des Alters?\n' +
        '   Erwartete Antwort: "Unser Pflegeangebot richtet sich an Kinder bis zu 14 Jahren" oder "Wir bieten Pflegeplätze für Senioren von 60 bis 80 Jahren an"\n' +
        '\n' +
        'Anweisungen:\n' +
        '* Beginne mit der ersten gesuchten Information\n' +
        '* Stelle jede Frage nur ein Mal und wiederhole dich nicht\n' +
        '* Wenn ein Gesprächspartner keine Information hat, bleibt das entsprechende Feld im JSON leer\n' +
        '* Stelle immer nur eine Frage und warte dann auf die Antwort.\n' +
        '\n' +
        'Auf die Frage "Wer sind Sie eigentlich?" antwortest Du mit "Ein KI-Bot mit schweizer Stimme von den eleven labs!"\n',
      time: 1739358390165,
      secondsFromStart: 0
    },
    {
      role: 'bot',
      message: 'Grüezi, ich bin Leo von der Integration GmbH. Wir möchten unseren Eltern ihr Angebot vorstellen Dazu hätte ich einige Fragen, wenn sie gerade fünf Minuten Zeit für mich haben.',
      time: 1739358391568,
      endTime: 1739358405257.999,
      secondsFromStart: 1.1999999,
      duration: 12819.99853515625,
      source: ''
    },
    {
      role: 'user',
      message: 'Um mich nicht zu labern,',
      time: 1739358405408,
      endTime: 1739358406788,
      secondsFromStart: 15.04,
      duration: 1380
    },
    {
      role: 'bot',
      message: 'Kein Problem, ich werde mich kurz fassen.',
      time: 1739358409958,
      endTime: 1739358412618,
      secondsFromStart: 19.59,
      duration: 2660,
      source: ''
    },
    {
      role: 'user',
      message: 'Nein, ich möchte nicht mit ihnen sprechen.',
      time: 1739358413068,
      endTime: 1739358415098,
      secondsFromStart: 22.7,
      duration: 2030
    },
    {
      role: 'bot',
      message: 'Hab Das ist in Ordnung.',
      time: 1739358413138,
      endTime: 1739358417958,
      secondsFromStart: 22.77,
      duration: 1240.0009765625,
      source: ''
    }
  ],
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