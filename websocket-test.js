/**
 * Teste de WebSocket para WIN Marketplace
 * Simula cliente conectando e escutando atualizações
 */

const SockJS = require('sockjs-client');
const StompJS = require('@stomp/stompjs');

const DELIVERY_ID = 'test-delivery-12345';
let receivedMessages = [];

console.log('🔧 Teste WebSocket WIN Marketplace\n');
console.log(`📦 Delivery ID: ${DELIVERY_ID}`);
console.log('🎯 Targets:');
console.log(`  - /topic/entrega/${DELIVERY_ID}/status`);
console.log(`  - /topic/entrega/${DELIVERY_ID}/courier`);
console.log(`  - /topic/entrega/${DELIVERY_ID}/action`);
console.log(`  - /topic/entrega/${DELIVERY_ID}/alert\n`);

// Criar socket
const socket = new SockJS('http://localhost:8080/ws/connect');
const stompClient = StompJS.Stomp.over(socket);

// Desabilitar logs
stompClient.debug = () => {};

console.log('🔌 Conectando ao WebSocket...');

stompClient.connect(
  {},
  () => {
    console.log('✅ Conectado!\n');

    // 1. Escutar status
    stompClient.subscribe(`/topic/entrega/${DELIVERY_ID}/status`, (message) => {
      console.log('📊 [STATUS] Mensagem recebida:');
      const payload = JSON.parse(message.body);
      console.log(JSON.stringify(payload, null, 2));
      receivedMessages.push({ type: 'STATUS', data: payload });
      console.log('');
    });

    // 2. Escutar courier
    stompClient.subscribe(`/topic/entrega/${DELIVERY_ID}/courier`, (message) => {
      console.log('📍 [COURIER] Mensagem recebida:');
      const payload = JSON.parse(message.body);
      console.log(JSON.stringify(payload, null, 2));
      receivedMessages.push({ type: 'COURIER', data: payload });
      console.log('');
    });

    // 3. Escutar ações
    stompClient.subscribe(`/topic/entrega/${DELIVERY_ID}/action`, (message) => {
      console.log('⚠️ [ACTION] Mensagem recebida:');
      const payload = JSON.parse(message.body);
      console.log(JSON.stringify(payload, null, 2));
      receivedMessages.push({ type: 'ACTION', data: payload });
      console.log('');
    });

    // 4. Escutar alertas
    stompClient.subscribe(`/topic/entrega/${DELIVERY_ID}/alert`, (message) => {
      console.log('🔔 [ALERT] Mensagem recebida:');
      const payload = JSON.parse(message.body);
      console.log(JSON.stringify(payload, null, 2));
      receivedMessages.push({ type: 'ALERT', data: payload });
      console.log('');
    });

    console.log('✅ Subscriptions ativas!');
    console.log('⏱️  Aguardando mensagens...');
    console.log('💡 Envie um webhook para receber atualizações\n');
    console.log('Comando para testar:');
    console.log(`curl -X POST http://localhost:8080/api/v1/webhooks/uber \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"idCorridaUber":"test-delivery-12345","statusUber":"DELIVERED",...}'\n`);

    // Desconectar após 30 segundos
    setTimeout(() => {
      console.log('\n📉 Timeout - Desconectando...');
      console.log(`Total de mensagens recebidas: ${receivedMessages.length}`);
      receivedMessages.forEach((msg) => {
        console.log(`  - ${msg.type}`);
      });
      process.exit(0);
    }, 30000);
  },
  (error) => {
    console.error('❌ Erro de conexão:', error);
    process.exit(1);
  },
);

// Capturar erros de socket
socket.addEventListener('error', () => {
  console.error('❌ Erro de socket');
  process.exit(1);
});

socket.addEventListener('close', () => {
  console.log('\n🔌 Socket fechado');
  console.log(`Total de mensagens: ${receivedMessages.length}`);
  process.exit(0);
});
