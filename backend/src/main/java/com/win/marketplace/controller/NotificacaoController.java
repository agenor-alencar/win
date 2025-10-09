package com.win.marketplace.controller;

import com.win.marketplace.dto.request.NotificacaoRequestDTO;
import com.win.marketplace.dto.response.NotificacaoResponseDTO;
import com.win.marketplace.service.NotificacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notificacao")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @PostMapping("/create")
    public ResponseEntity<NotificacaoResponseDTO> criarNotificacao(@RequestBody NotificacaoRequestDTO requestDTO) {
        NotificacaoResponseDTO response = notificacaoService.criarNotificacao(requestDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list/usuario/{usuarioId}")
    public ResponseEntity<List<NotificacaoResponseDTO>> listarPorUsuario(@PathVariable UUID usuarioId) {
        List<NotificacaoResponseDTO> notificacoes = notificacaoService.listarNotificacoesPorUsuario(usuarioId);
        return ResponseEntity.ok(notificacoes);
    }

    @GetMapping("/list/nao-lidas/usuario/{usuarioId}")
    public ResponseEntity<List<NotificacaoResponseDTO>> listarNaoLidas(@PathVariable UUID usuarioId) {
        List<NotificacaoResponseDTO> notificacoes = notificacaoService.listarNotificacoesNaoLidas(usuarioId);
        return ResponseEntity.ok(notificacoes);
    }

    @GetMapping("/count-nao-lidas/usuario/{usuarioId}")
    public ResponseEntity<Long> contarNaoLidas(@PathVariable UUID usuarioId) {
        Long count = notificacaoService.contarNotificacoesNaoLidas(usuarioId);
        return ResponseEntity.ok(count);
    }

    @PatchMapping("/lida/{id}")
    public ResponseEntity<NotificacaoResponseDTO> marcarComoLida(@PathVariable UUID id) {
        NotificacaoResponseDTO response = notificacaoService.marcarComoLida(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/todas-lidas/usuario/{usuarioId}")
    public ResponseEntity<Void> marcarTodasComoLidas(@PathVariable UUID usuarioId) {
        notificacaoService.marcarTodasComoLidas(usuarioId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletarNotificacao(@PathVariable UUID id) {
        notificacaoService.deletarNotificacao(id);
        return ResponseEntity.noContent().build();
    }
}
