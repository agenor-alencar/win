package com.win.marketplace.service;

import com.win.marketplace.dto.request.MotoristaCreateRequestDTO;
import com.win.marketplace.dto.response.MotoristaResponseDTO;
import com.win.marketplace.dto.mapper.MotoristaMapper;
import com.win.marketplace.model.Motorista;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.MotoristaRepository;
import com.win.marketplace.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MotoristaService {

    private final MotoristaRepository motoristaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MotoristaMapper motoristaMapper;

    public MotoristaResponseDTO criarMotorista(MotoristaCreateRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar se já existe motorista para este usuário
        if (motoristaRepository.findByUsuarioId(requestDTO.usuarioId()).isPresent()) {
            throw new RuntimeException("Usuário já possui perfil de motorista");
        }

        // Verificar se a CNH já está cadastrada
        if (motoristaRepository.findByCnh(requestDTO.cnh()).isPresent()) {
            throw new RuntimeException("CNH já cadastrada no sistema");
        }

        Motorista motorista = motoristaMapper.toEntity(requestDTO);
        motorista.setUsuario(usuario);
        motorista.setDisponivel(true);
        motorista.setAtivo(true);

        Motorista savedMotorista = motoristaRepository.save(motorista);
        return motoristaMapper.toResponseDTO(savedMotorista);
    }

    @Transactional(readOnly = true)
    public List<MotoristaResponseDTO> listarMotoristas() {
        List<Motorista> motoristas = motoristaRepository.findAll();
        return motoristaMapper.toResponseDTOList(motoristas);
    }

    @Transactional(readOnly = true)
    public List<MotoristaResponseDTO> listarMotoristasDisponiveis() {
        List<Motorista> motoristas = motoristaRepository.findByDisponivelTrueAndAtivoTrue();
        return motoristaMapper.toResponseDTOList(motoristas);
    }

    @Transactional(readOnly = true)
    public MotoristaResponseDTO buscarPorId(UUID id) {
        Motorista motorista = motoristaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));
        return motoristaMapper.toResponseDTO(motorista);
    }

    @Transactional(readOnly = true)
    public MotoristaResponseDTO buscarPorUsuarioId(UUID usuarioId) {
        Motorista motorista = motoristaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado para este usuário"));
        return motoristaMapper.toResponseDTO(motorista);
    }

    public MotoristaResponseDTO alterarDisponibilidade(UUID id, boolean disponivel) {
        Motorista motorista = motoristaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));

        motorista.setDisponivel(disponivel);

        Motorista savedMotorista = motoristaRepository.save(motorista);
        return motoristaMapper.toResponseDTO(savedMotorista);
    }

    public MotoristaResponseDTO atualizarMotorista(UUID id, MotoristaCreateRequestDTO requestDTO) {
        Motorista motorista = motoristaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));

        // Verificar se a CNH já está cadastrada para outro motorista
        motoristaRepository.findByCnh(requestDTO.cnh())
                .ifPresent(m -> {
                    if (!m.getId().equals(id)) {
                        throw new RuntimeException("CNH já cadastrada para outro motorista");
                    }
                });

        motoristaMapper.updateEntityFromDTO(requestDTO, motorista);

        Motorista savedMotorista = motoristaRepository.save(motorista);
        return motoristaMapper.toResponseDTO(savedMotorista);
    }

    public void desativarMotorista(UUID id) {
        Motorista motorista = motoristaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));

        motorista.setAtivo(false);
        motorista.setDisponivel(false);

        motoristaRepository.save(motorista);
    }
}