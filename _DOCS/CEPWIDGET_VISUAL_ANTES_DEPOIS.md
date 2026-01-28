# 🎨 CEPWidget - Antes e Depois

## ANTES ❌

```
┌─────────────────────────────────────────────────────────────┐
│  WIN Marketplace                    [Buscar]  🛒 👤         │
├─────────────────────────────────────────────────────────────┤
│  📞 (61) 99533-4141  🚚 Frete grátis na primeira compra     │
│                                                              │
│                                     Venda no WIN  Central   │
└─────────────────────────────────────────────────────────────┘

    [Grande Banner]
    [Categorias]
    [Produtos]                              🔴 PROBLEMA: CEPWidget
                                               estava flutuando no canto
                                               direito mas NÃO APARECIA
```

---

## DEPOIS ✅

```
┌─────────────────────────────────────────────────────────────┐
│  WIN Marketplace                    [Buscar]  🛒 👤         │
├─────────────────────────────────────────────────────────────┤
│  📞 (61) 99533-4141                                          │
│  🚚 Frete grátis na primeira compra  [📍 Informar CEP] ✅   │
│                                    ↑                         │
│                                    └── NOVO: Botão compacto  │
│                                         ao lado do texto     │
└─────────────────────────────────────────────────────────────┘
```

**Quando clicado:**
```
┌─────────────────────────────────────────────────────────────┐
│  📞 (61) 99533-4141                                          │
│  🚚 Frete grátis na primeira compra  [📍 Informar CEP]      │
│     ┌─────────────────────────────────────┐                 │
│     │ 📍 Informar CEP               ✕     │                 │
│     ├─────────────────────────────────────┤                 │
│     │ Digite seu CEP para calcular o      │                 │
│     │ frete no checkout                   │                 │
│     │                                      │                 │
│     │ [_________] [Salvar]                │                 │
│     │                                      │                 │
│     │ ✅ CEP salvo! Será usado no         │                 │
│     │    checkout.                        │                 │
│     └─────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## CÓDIGO ANTES

**Index.tsx:**
```typescript
return (
  <div>
    <Header />
    <MainCarousel />
    <CEPWidget />  ← estava aqui (position: fixed)
    ...
  </div>
);
```

**CEPWidget.tsx:**
```typescript
return (
  <div className="fixed top-20 right-4 z-40">  ← canto direito fixo
    <button>...</button>
  </div>
);
```

---

## CÓDIGO DEPOIS

**Header.tsx:**
```typescript
<div className="flex items-center gap-3">
  <div className="flex items-center">
    <Truck className="h-3 w-3 mr-1" />
    Frete grátis na primeira compra
  </div>
  <CEPWidget />  ← agora integrado no Header
</div>
```

**CEPWidget.tsx:**
```typescript
return (
  <div className="relative">  ← inline, não fixed
    <button className="flex items-center gap-1.5 px-2.5 py-1 
                       bg-orange-50 border border-orange-200 
                       rounded-md text-xs">
      <MapPin className="h-3.5 w-3.5" />
      {enderecoSalvo ? (
        <>CEP: {cep} <CheckCircle /></>
      ) : (
        "Informar CEP"
      )}
    </button>
    
    {mostrarForm && (
      <div className="absolute top-full left-0 mt-2 
                      bg-white shadow-xl rounded-lg p-4 w-80 z-50">
        {/* Formulário dropdown */}
      </div>
    )}
  </div>
);
```

---

## BENEFÍCIOS DA MUDANÇA

1. ✅ **Visibilidade:** Usuário vê o botão imediatamente (canto superior esquerdo)
2. ✅ **Contexto:** Está ao lado de "Frete grátis" = associação mental clara
3. ✅ **UX:** Não fica flutuando no meio da tela (menos intrusivo)
4. ✅ **Mobile:** Design responsivo mantido (Header já trata mobile)
5. ✅ **Consistência:** Parte do layout principal, não um elemento isolado

---

## ESTADOS VISUAIS

### Estado 1: Sem CEP salvo
```
[📍 Informar CEP]
   ↓ hover
[📍 Informar CEP]  ← botão laranja claro
```

### Estado 2: CEP salvo
```
[📍 CEP: 70040-902 ✅]  ← botão com check verde
   ↓ hover
[📍 CEP: 70040-902 ✅]  ← destaca check
```

### Estado 3: Dropdown aberto
```
[📍 Informar CEP]
   ↓
  ┌─────────────────────────┐
  │ 📍 Informar CEP    ✕    │
  ├─────────────────────────┤
  │ Digite seu CEP...       │
  │                         │
  │ [70040-902] [Salvar]    │
  │                         │
  │ ✅ CEP salvo!           │
  └─────────────────────────┘
```

---

## INTEGRAÇÃO COM SISTEMA DE FRETE

### Fluxo Completo:

1. **Header (CEPWidget):**
   ```
   Usuário digita CEP → Valida com ViaCEP
   ↓
   Salva no localStorage: 'win_cep_cliente'
   ↓
   Se logado: Cria endereço temporário via API
   ↓
   localStorage: 'win_endereco_temp_id'
   ```

2. **Checkout:**
   ```
   useEffect detecta: 'win_endereco_temp_id'
   ↓
   GET /api/v1/enderecos/{id}
   ↓
   ✅ Valida: latitude && longitude existe?
   ↓
   SIM: Calcula frete automático
   NÃO: Aguarda preenchimento completo
   ```

3. **Backend:**
   ```
   POST /api/v1/enderecos → Salva endereço
   ↓
   GeocodingService: CEP → coordenadas
   ↓
   UberFlashService: coordenadas → cotação
   ↓
   Retorna: valor frete + tempo estimado
   ```

---

## TESTES VISUAIS

### Checklist de Aceitação:

- [ ] Botão aparece ao lado de "Frete grátis na primeira compra"
- [ ] Cor laranja suave (não muito chamativo)
- [ ] Ícone de pin (📍) visível
- [ ] Hover muda para laranja mais escuro
- [ ] Click abre dropdown centralizado abaixo do botão
- [ ] Dropdown tem sombra e borda arredondada
- [ ] Input de CEP tem máscara (00000-000)
- [ ] Botão "Salvar" desabilitado se CEP incompleto
- [ ] Após salvar, mostra check verde (✅)
- [ ] Dropdown fecha ao clicar "✕"
- [ ] CEP salvo persiste após reload da página

---

## RESPONSIVIDADE

### Desktop (>768px):
```
[📞] [🚚 Frete grátis] [📍 CEP]  ← tudo visível
```

### Tablet (768px):
```
[📞] [🚚 Frete grátis] [📍 CEP]  ← mantém layout
```

### Mobile (<768px):
```
Top bar com menu hamburger
[📍 CEP] ← mantém visível no menu mobile
```

---

**Documentação visual criada em:** 27/01/2026 22:35  
**Design aprovado:** ✅ SIM  
**Implementado:** ✅ SIM  
**Testado:** ⏳ PENDENTE (deploy)

