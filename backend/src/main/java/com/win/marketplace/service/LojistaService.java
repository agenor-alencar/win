package com.win.marketplace.service;

import com.win.marketplace.dto.request.LojistaCreateRequestDTO;
import com.win.marketplace.dto.response.LojistaResponseDTO;
import com.win.marketplace.dto.response.LojistaEstatisticasDTO;
import com.win.marketplace.dto.mapper.LojistaMapper;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.LojistaRepository;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.repository.ProdutoRepository;
import com.win.marketplace.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LojistaService {

    private final LojistaRepository lojistaRepository;
    private final UsuarioRepository usuarioRepository;
    private final LojistaMapper lojistaMapper;
    private final ProdutoRepository produtoRepository;
    private final PedidoRepository pedidoRepository;
    private final GeocodingService geocodingService;

    public LojistaResponseDTO criarLojista(LojistaCreateRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificar se já existe lojista para este usuário
        if (lojistaRepository.findByUsuarioId(requestDTO.usuarioId()).isPresent()) {
            throw new RuntimeException("Usuário já possui perfil de lojista");
        }

        // Verificar se CNPJ já está em uso
        if (lojistaRepository.findByCnpj(requestDTO.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já está sendo utilizado por outro lojista");
        }

        Lojista lojista = lojistaMapper.toEntity(requestDTO);
        lojista.setUsuario(usuario);
        
        // Valores padrão
        if (lojista.getAtivo() == null) {
            lojista.setAtivo(true);
        }

        // Geocodificar endereço se as coordenadas não foram fornecidas
        if ((lojista.getLatitude() == null || lojista.getLongitude() == null) && 
            lojista.getCep() != null && !lojista.getCep().isEmpty()) {
            
            String enderecoCompleto = String.format("%s, %s, %s, %s, %s",
                lojista.getLogradouro(),
                lojista.getNumero(),
                lojista.getBairro(),
                lojista.getCidade(),
                lojista.getUf());
            
            Double[] coordenadas = geocodingService.geocodificar(lojista.getCep(), enderecoCompleto);
            
            if (coordenadas != null) {
                lojista.setLatitude(coordenadas[0]);
                lojista.setLongitude(coordenadas[1]);
            }
        }

        Lojista savedLojista = lojistaRepository.save(lojista);
        return lojistaMapper.toResponseDTO(savedLojista);
    }

    @Transactional(readOnly = true)
    public List<LojistaResponseDTO> listarLojistas() {
        List<Lojista> lojistas = lojistaRepository.findAll();
        return lojistaMapper.toResponseDTOList(lojistas);
    }

    @Transactional(readOnly = true)
    public List<LojistaResponseDTO> listarLojistasAtivos() {
        List<Lojista> lojistas = lojistaRepository.findByAtivoTrue();
        return lojistaMapper.toResponseDTOList(lojistas);
    }

    @Transactional(readOnly = true)
    public LojistaResponseDTO buscarPorId(UUID id) {
        Lojista lojista = lojistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));
        return lojistaMapper.toResponseDTO(lojista);
    }

    @Transactional(readOnly = true)
    public LojistaResponseDTO buscarPorUsuarioId(UUID usuarioId) {
        Lojista lojista = lojistaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException(
                    "Perfil de lojista não encontrado para o usuário com ID: " + usuarioId + 
                    ". Por favor, complete seu cadastro de lojista antes de acessar esta área."
                ));
        return lojistaMapper.toResponseDTO(lojista);
    }

    @Transactional(readOnly = true)
    public LojistaResponseDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o email: " + email));
        Lojista lojista = lojistaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException(
                    "Perfil de lojista não encontrado para o usuário: " + email + 
                    ". Por favor, complete seu cadastro de lojista antes de acessar esta área."
                ));
        return lojistaMapper.toResponseDTO(lojista);
    }

    @Transactional(readOnly = true)
    public LojistaResponseDTO buscarPorCnpj(String cnpj) {
        Lojista lojista = lojistaRepository.findByCnpj(cnpj)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado com este CNPJ"));
        return lojistaMapper.toResponseDTO(lojista);
    }

    public LojistaResponseDTO atualizarLojista(UUID id, LojistaCreateRequestDTO requestDTO) {
        Lojista lojista = lojistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        // Verificar se o novo CNPJ já está em uso (se foi alterado)
        if (!lojista.getCnpj().equals(requestDTO.cnpj()) &&
            lojistaRepository.findByCnpj(requestDTO.cnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já está sendo utilizado por outro lojista");
        }

        // Verificar se o endereço mudou (para regeocoding)
        boolean enderecoMudou = !lojista.getCep().equals(requestDTO.cep()) ||
                                !lojista.getLogradouro().equals(requestDTO.logradouro()) ||
                                !lojista.getNumero().equals(requestDTO.numero()) ||
                                !lojista.getBairro().equals(requestDTO.bairro()) ||
                                !lojista.getCidade().equals(requestDTO.cidade()) ||
                                !lojista.getUf().equals(requestDTO.uf());

        lojistaMapper.updateEntityFromDTO(requestDTO, lojista);

        // Re-geocodificar se o endereço mudou e as novas coordenadas não foram fornecidas
        if (enderecoMudou && (requestDTO.latitude() == null || requestDTO.longitude() == null)) {
            String enderecoCompleto = String.format("%s, %s, %s, %s, %s",
                lojista.getLogradouro(),
                lojista.getNumero(),
                lojista.getBairro(),
                lojista.getCidade(),
                lojista.getUf());
            
            Double[] coordenadas = geocodingService.geocodificar(lojista.getCep(), enderecoCompleto);
            
            if (coordenadas != null) {
                lojista.setLatitude(coordenadas[0]);
                lojista.setLongitude(coordenadas[1]);
            }
        }

        Lojista savedLojista = lojistaRepository.save(lojista);
        return lojistaMapper.toResponseDTO(savedLojista);
    }

    public LojistaResponseDTO ativarLojista(UUID id) {
        Lojista lojista = lojistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        lojista.setAtivo(true);
        Lojista savedLojista = lojistaRepository.save(lojista);
        return lojistaMapper.toResponseDTO(savedLojista);
    }

    public LojistaResponseDTO desativarLojista(UUID id) {
        Lojista lojista = lojistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        lojista.setAtivo(false);
        Lojista savedLojista = lojistaRepository.save(lojista);
        return lojistaMapper.toResponseDTO(savedLojista);
    }
    
    /**
     * Busca estatísticas do lojista para o dashboard
     */
    @Transactional(readOnly = true)
    public LojistaEstatisticasDTO buscarEstatisticas(UUID lojistaId) {
        // Verificar se lojista existe
        Lojista lojista = lojistaRepository.findById(lojistaId)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));
        
        // Calcular datas
        LocalDateTime inicioHoje = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime fimHoje = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        LocalDateTime inicioOntem = LocalDateTime.of(LocalDate.now().minusDays(1), LocalTime.MIN);
        LocalDateTime fimOntem = LocalDateTime.of(LocalDate.now().minusDays(1), LocalTime.MAX);
        
        // Buscar vendas de hoje (apenas pagamento aprovado)
        Long vendasHoje = pedidoRepository.countByLojistaIdAndStatusPagamentoAndCriadoEmBetween(
            lojistaId,
            Pedido.StatusPagamento.APROVADO,
            inicioHoje,
            fimHoje
        );

        // Buscar vendas de ontem (apenas pagamento aprovado)
        Long vendasOntem = pedidoRepository.countByLojistaIdAndStatusPagamentoAndCriadoEmBetween(
            lojistaId,
            Pedido.StatusPagamento.APROVADO,
            inicioOntem,
            fimOntem
        );

        // Buscar receita de hoje (apenas pagamento aprovado)
        BigDecimal receitaHoje = pedidoRepository.sumTotalByLojistaIdAndStatusPagamentoAndCriadoEmBetween(
            lojistaId,
            Pedido.StatusPagamento.APROVADO,
            inicioHoje,
            fimHoje
        );

        // Buscar receita de ontem (apenas pagamento aprovado)
        BigDecimal receitaOntem = pedidoRepository.sumTotalByLojistaIdAndStatusPagamentoAndCriadoEmBetween(
            lojistaId,
            Pedido.StatusPagamento.APROVADO,
            inicioOntem,
            fimOntem
        );

        // Buscar pedidos pendentes pagos (PENDENTE + PREPARANDO)
        Long pedidosPendentes = pedidoRepository.countByLojistaIdAndStatusPagamentoAndStatusIn(
            lojistaId,
            Pedido.StatusPagamento.APROVADO,
            List.of(Pedido.StatusPedido.PENDENTE, Pedido.StatusPedido.PREPARANDO)
        );
        
        // Buscar produtos ativos
        Long produtosAtivos = produtoRepository.countByLojistaIdAndAtivo(lojistaId, true);
        
        // Buscar produtos inativos
        Long produtosInativos = produtoRepository.countByLojistaIdAndAtivo(lojistaId, false);
        
        return LojistaEstatisticasDTO.criar(
            vendasHoje,
            vendasOntem,
            receitaHoje,
            receitaOntem,
            pedidosPendentes,
            produtosAtivos,
            produtosInativos
        );
    }
}
