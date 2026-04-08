# 🚀 PLANO DE AÇÃO - Correção dos Problemas de Produção
**Data de Criação:** 7 de Abril de 2026  
**Prioridade:** 🔴 CRÍTICA  
**Tempo Estimado:** 4-8 horas  
**Responsável:** DevOps/Backend

---

## 📋 PROBLEMAS IDENTIFICADOS (Ordem de Prioridade)

### 1. 🔴 **CRÍTICO: Lojistas sem Geocodificação** 
**Impacto:** 0% de operação no fluxo de entregas  
**Tempo para fix:** 2-3 horas

### 2. 🔴 **CRÍTICO: Marketplace Recipient ID não configurado**  
**Impacto:** Split de pagamentos desabilitado  
**Tempo para fix:** 30 minutos

### 3. 🟡 **IMPORTANTE: Webhook de Entregas não implementado**  
**Impacto:** Rastreamento em tempo real não funciona  
**Tempo para fix:** 4-6 horas

---

## 🔧 SOLUÇÃO 1: GEOCODIFICAÇÃO DE LOJISTAS

### **O que é o problema?**
```
Lojista cadastrado:
{
  "nome": "AGENOR ALENCAR",
  "endereco": "Setor Comercial Sul, 1, Brasília, DF 72006200",
  "latitude": null,      ← ❌ VAZIO!
  "longitude": null      ← ❌ VAZIO!
}

Sistema precisa: latitude + longitude para calcular distância → frete
Resultado: ❌ Frete não pode ser calculado
```

### **Solução A: Implementar Endpoint Automático (RECOMENDADO)**

#### Passo 1: Adicionar Dependência Google Maps (Backend)

**Arquivo:** `backend/pom.xml`

```xml
<!-- Adicionar dentro de <dependencies> -->
<dependency>
    <groupId>com.google.maps</groupId>
    <artifactId>google-maps-services</artifactId>
    <version>2.1.1</version>
</dependency>

<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>2.0.7</version>
</dependency>
```

#### Passo 2: Configurar API Key do Google Maps

**Arquivo:** `backend/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: win-marketplace

# Adicione esta seção:
google:
  maps:
    api-key: ${GOOGLE_MAPS_API_KEY}
    geocoding-enabled: true

logging:
  level:
    com.win.marketplace: DEBUG
```

**Na VPS:** Adicionar variável ao `.env`:

```bash
ssh root@137.184.87.106

cat >> /root/win/.env << 'EOF'

# Google Maps Geocoding
GOOGLE_MAPS_API_KEY=AIzaSyD_YOUR_KEY_HERE
EOF

# Salvar e sair
```

#### Passo 3: Criar Service de Geocodificação

**Arquivo:** `backend/src/main/java/com/win/marketplace/service/GeocodingService.java`

```java
package com.win.marketplace.service;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class GeocodingService {

    private final GeoApiContext geoApiContext;
    private final boolean geocodingEnabled;

    public GeocodingService(
            @Value("${google.maps.api-key}") String apiKey,
            @Value("${google.maps.geocoding-enabled:true}") boolean geocodingEnabled) {
        this.geocodingEnabled = geocodingEnabled;
        this.geoApiContext = new GeoApiContext.Builder()
                .apiKey(apiKey)
                .build();
    }

    /**
     * Geocodifica um endereço e retorna latitude/longitude
     */
    public LatLng geocodeAddress(String endereco, String numero, 
                                  String bairro, String cidade, 
                                  String uf, String cep) {
        if (!geocodingEnabled) {
            log.warn("⚠️ Geocoding desabilitado na configuração");
            return null;
        }

        try {
            // Montar endereço completo
            String fullAddress = String.format("%s, %s, %s, %s, %s - %s",
                    endereco, numero, bairro, cidade, uf, cep);

            log.info("🔍 Geocodificando: {}", fullAddress);

            // Chamar API Google Maps
            GeocodingResult[] results = GeocodingApi.geocode(geoApiContext, fullAddress).await();

            if (results != null && results.length > 0) {
                LatLng latLng = results[0].geometry.location;
                log.info("✅ Geocodificação bem-sucedida: {}, {} para {}",
                        latLng.lat, latLng.lng, fullAddress);
                return latLng;
            } else {
                log.warn("⚠️ Nenhum resultado encontrado para: {}", fullAddress);
                return null;
            }
        } catch (Exception e) {
            log.error("❌ Erro ao geocodificar: {}", endereco, e);
            return null;
        }
    }
}
```

#### Passo 4: Criar Controller Admin para Geocodificar

**Arquivo:** `backend/src/main/java/com/win/marketplace/controller/AdminGeocodingController.java`

```java
package com.win.marketplace.controller;

import com.win.marketplace.entity.Lojista;
import com.win.marketplace.repository.LojistasRepository;
import com.win.marketplace.service.GeocodingService;
import com.google.maps.model.LatLng;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/geocoding")
@RequiredArgsConstructor
public class AdminGeocodingController {

    private final LojistasRepository lojistasRepository;
    private final GeocodingService geocodingService;

    /**
     * Geocodificar TODOS os lojistas
     */
    @PostMapping("/lojistas/geocodificar-todos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> geocodificarTodos() {
        log.info("🚀 Iniciando geocodificação em massa de todos os lojistas...");

        List<Lojista> lojistas = lojistasRepository.findAll();
        int success = 0;
        int failed = 0;
        int skipped = 0;

        for (Lojista lojista : lojistas) {
            try {
                // Verificar se já tem coordenadas
                if (lojista.getLatitude() != null && lojista.getLongitude() != null) {
                    skipped++;
                    log.info("⏭️  Pulando lojista {} - já geocodificado", lojista.getId());
                    continue;
                }

                // Geocodificar
                LatLng coords = geocodingService.geocodeAddress(
                        lojista.getLogradouro(),
                        lojista.getNumero(),
                        lojista.getBairro(),
                        lojista.getCidade(),
                        lojista.getUf(),
                        lojista.getCep()
                );

                if (coords != null) {
                    lojista.setLatitude(coords.lat);
                    lojista.setLongitude(coords.lng);
                    lojistasRepository.save(lojista);
                    success++;
                    log.info("✅ Geocodificado: {} ({}, {})",
                            lojista.getNomeFantasia(), coords.lat, coords.lng);
                } else {
                    failed++;
                    log.error("❌ Falha ao geocodificar: {}", lojista.getNomeFantasia());
                }

                // Respeitar limite de API (100 req/min)
                Thread.sleep(600);

            } catch (Exception e) {
                failed++;
                log.error("❌ Erro processando lojista {}: ", lojista.getId(), e);
            }
        }

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_lojistas", lojistas.size());
        resultado.put("geocodificados", success);
        resultado.put("falhados", failed);
        resultado.put("saltados", skipped);
        resultado.put("mensagem", String.format(
                "Geocodificação concluída: %d sucesso, %d falha, %d saltados",
                success, failed, skipped));

        log.info("🏁 Geocodificação em massa finalizada - {}", resultado);
        return ResponseEntity.ok(resultado);
    }

    /**
     * Geocodificar lojista específico
     */
    @PostMapping("/lojistas/{lojistaId}/geocodificar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> geocodificarLojista(
            @PathVariable String lojistaId) {

        Lojista lojista = lojistasRepository.findById(lojistaId)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        LatLng coords = geocodingService.geocodeAddress(
                lojista.getLogradouro(),
                lojista.getNumero(),
                lojista.getBairro(),
                lojista.getCidade(),
                lojista.getUf(),
                lojista.getCep()
        );

        if (coords != null) {
            lojista.setLatitude(coords.lat);
            lojista.setLongitude(coords.lng);
            lojistasRepository.save(lojista);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("id", lojista.getId());
            resultado.put("nome", lojista.getNomeFantasia());
            resultado.put("latitude", coords.lat);
            resultado.put("longitude", coords.lng);
            resultado.put("status", "✅ Geocodificado com sucesso");

            return ResponseEntity.ok(resultado);
        } else {
            throw new RuntimeException("Falha ao geocodificar endereço");
        }
    }
}
```

#### Passo 5: Executar em Produção

```bash
# 1. Fazer build local
cd frontend
npm run build
cd ../backend
./mvnw clean package

# 2. Fazer commit das alterações
git add -A
git commit -m "feat(geocoding): Implementar geocodificação automática de lojistas

- Add Google Maps Geocoding API integration
- Add GeocodingService para geocodificar endereços
- Add AdminGeocodingController para endpoint de geocodificação
- Add configurações no application.yml
- Permite geocodificar todos os lojistas em massa ou individuais"

# 3. Push para repositório
git push origin main

# 4. Atualizar na VPS
ssh root@137.184.87.106

# Entrar no diretório
cd /root/win

# Fazer pull das mudanças
git pull origin main

# Definir API Key do Google Maps (se não tiver)
# Obter em: https://console.cloud.google.com/
# Criar uma API key com Geocoding API habilitada

# Adicionar ao .env
echo "GOOGLE_MAPS_API_KEY=AIzaSyD_<sua_chave_aqui>" >> .env

# Fazer rebuild e reiniciar
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 5. Aguardar backend inicializar
sleep 10

# 6. Executar geocodificação em massa (como ADMIN)
curl -X POST http://localhost:8080/api/v1/admin/geocoding/lojistas/geocodificar-todos \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Content-Type: application/json"

# 7. Verificar resultado
docker logs win-marketplace-backend | grep -E "(Geocodificando|Geocodificação bem-sucedida|Geocodificação em massa finalizada)"

# 8. Validar banco de dados
docker exec win-marketplace-db psql -U postgres -d win_marketplace << EOF
SELECT id, nome_fantasia, latitude, longitude FROM lojistas;
EOF
```

---

## 🔧 SOLUÇÃO 2: CONFIGURAR MARKETPLACE RECIPIENT ID

### **O que é o problema?**
```
Split de pagamentos desabilitado!
├─ Marketplace deve receber 12% de comissão
└─ Mas sem Recipient ID, não consegue separar
```

### **Solução Rápida (30 minutos)**

#### Passo 1: Obter Recipient ID da Pagar.me

1. Acessar: https://dashboard.pagar.me
2. Ir para: **Configurações** → **Recebedores** ou **Recipients**
3. Procurar por um recebedor com nome que indique "Marketplace" ou "WIN"
4. Se não existir, criar um novo:
   - Nome: `WIN Marketplace`
   - Tipo: Pessoa Jurídica
   - CNPJ: [CNPJ da WIN]
   - Preencher dados bancários
   - Salvar
5. Copiar o **ID** do recebedor (formato: `re_XXXXXXXXXXXXX`)

#### Passo 2: Configurar na VPS

```bash
ssh root@137.184.87.106

# Editar arquivo .env
nano /root/win/.env

# Adicionar/atualizar:
MARKETPLACE_RECIPIENT_ID=re_<seu_id_aqui>
MARKETPLACE_COMMISSION_RATE=12
LOJISTA_REPASSE_RATE=88

# Salvar: Ctrl+X, Y, Enter

# Reiniciar apenas o backend para aplicar mudança
cd /root/win
docker-compose restart win-marketplace-backend

# Aguardar inicializar (10-15 segundos)
sleep 15

# Validar se está configurado
docker logs win-marketplace-backend | grep -i "split\|recipient" | tail -5
```

#### Passo 3: Validar nos logs

```bash
# Você deve ver:
# ✅ Split CONFIGURADO - Recipients informados
# ✅ Marketplace recipient: re_XXXXXXXXXXXXX
# ✅ Lojista recipient: re_XXXXXXXXXXXXX
```

---

## 🔧 SOLUÇÃO 3: IMPLEMENTAR WEBHOOKS DE UBER (OPCIONAL - Fase 2)

### **Problema**
- Rastreamento usa polling a cada 5 segundos
- Ineficiente e consome muita API
- Ideal: receber eventos via webhook em tempo real

### **Solução (futura)**

```java
// Endpoint de webhook para eventos da Uber
POST /api/v1/webhooks/uber/delivery-status

// Recebe eventos como:
{
  "type": "delivery.status_changed",
  "delivery_id": "d123456",
  "status": "on_arrival",
  "timestamp": "2026-04-07T21:30:00Z"
}

// Atualizar status da entrega em tempo real
// Notificar cliente via WebSocket
```

**Status:** ⏰ Implementar na semana 2

---

## ✅ CHECKLIST DE EXECUÇÃO

### FASE 1: Geocodificação (2-3 horas)

- [ ] Clonar repositório atualizado localmente
- [ ] Adicionar dependência Google Maps no pom.xml
- [ ] Criar GeocodingService
- [ ] Criar AdminGeocodingController
- [ ] Atualizar application.yml
- [ ] Testar localmente com `mvn clean package`
- [ ] Fazer commit e push
- [ ] Atualizar VPS com `git pull`
- [ ] Adicionar GOOGLE_MAPS_API_KEY ao .env da VPS
- [ ] Fazer rebuild: `docker-compose build --no-cache`
- [ ] Reiniciar containers: `docker-compose up -d`
- [ ] Testar endpoint:
  ```bash
  curl -X POST http://localhost:8080/api/v1/admin/geocoding/lojistas/geocodificar-todos \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json"
  ```
- [ ] Validar no banco: todos lojistas têm latitude/longitude preenchidas
- [ ] **Testar fluxo de frete:**
  ```bash
  curl -X POST http://localhost:8080/api/v1/fretes/calcular \
    -H "Authorization: Bearer <TOKEN>" \
    -d '{"cepDestino": "01310100", "lojista_id": "..."}'
  ```

### FASE 2: Configurar Marketplace Recipient (30 min)

- [ ] Obter Recipient ID em Pagar.me dashboard
- [ ] Atualizar .env na VPS: `MARKETPLACE_RECIPIENT_ID=re_...`
- [ ] Reiniciar backend: `docker-compose restart win-marketplace-backend`
- [ ] Validar nos logs: "Split CONFIGURADO"
- [ ] **Testar com novo pedido PIX:**
  ```bash
  # Frontend: fazer novo pedido
  # Backend: validar logs com "Split"
  # Pagar.me: validar split de receita
  ```

### FASE 3: Validação Completa

- [ ] Teste E2E do fluxo completo:
  1. Login
  2. Adicionar produto ao carrinho
  3. Ir para checkout
  4. **Calcular frete** ← Deve funcionar agora
  5. Escolher endereço de entrega
  6. Escolher método de pagamento PIX
  7. Gerar QR Code
  8. Pagar (mock ou real)
  9. **Criar entrega Uber** ← Deve funcionar agora
  10. Rastrear entrega
  11. **Confirmar PIN de coleta/entrega**

### FASE 4: Deploy em Produção

- [ ] Executar testes automatizados
- [ ] Fazer backup do banco de dados
- [ ] Fazer deploy das mudanças
- [ ] Monitorar logs por 2 horas
- [ ] Testar manualmente todos los fluxos
- [ ] Documentar status no README.md

---

## 📞 SUPORTE & DEBUGGING

### Se Geocodificação Falhar

```bash
# 1. Verificar API Key
docker logs win-marketplace-backend | grep -i "api.key\|authentication"

# 2. Verificar limite de quota
# Google Cloud Console: Geocoding API → Quotas

# 3. Testar API Key manualmente
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Brasilia,DF&key=YOUR_KEY"

# 4. Se retornar status "ZERO_RESULTS", endereço não é válido
# → Atualizar endereço do lojista manualmente
```

### Se Split Falhar

```bash
# 1. Verificar Recipient ID está correto
grep MARKETPLACE_RECIPIENT_ID /root/win/.env

# 2. Validar no Pagar.me dashboard
# → Recipient existe?
# → Está ativo?
# → Tem dados bancários?

# 3. Testar criar pedido com logs verbosos
docker logs -f win-marketplace-backend | grep -i split
```

---

## 📊 EXPECTED OUTCOMES

### Após Implementação

**Antes:**
```
❌ Frete: Não foi possível geocodificar
❌ Split: Desabilitado
❌ Entregas: Não funciona
```

**Depois:**
```
✅ Frete: R$ XX.XX (calculado com sucesso)
✅ Split: Marketplace 12% + Lojista 88%
✅ Entregas: Criação de delivery com sucesso
```

---

**Próximo passo:** Implementar as soluções seguindo este plano! 🚀

Dúvidas? Consulte a análise completa em: `_DOCS/ANALISE_STATUS_VPS_2026-04-07.md`
