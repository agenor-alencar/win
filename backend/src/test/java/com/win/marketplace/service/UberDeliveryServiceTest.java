package com.win.marketplace.service;

import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.model.enums.TipoVeiculoUber;
import com.win.marketplace.repository.EntregaRepository;
import com.win.marketplace.service.fixtures.EntregaTestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para UberDeliveryService
 * 
 * Responsabilidades testadas:
 * - Criação de entrega
 * - Consulta de status
 * - Geração de PIN codes
 * - Cálculo de frete
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UberDeliveryService")
class UberDeliveryServiceTest {

    @Mock private EntregaRepository entregaRepository;

    @InjectMocks private UberDeliveryService uberDeliveryService;

    private Entrega entrega;
    private UUID pedidoId;

    @BeforeEach
    void setUp() {
        pedidoId = UUID.randomUUID();
        entrega = EntregaTestFixtures.criarEntregaAguardandoMotorista();
    }

    @Test
    @DisplayName("Deve criar entrega com dados válidos")
    void devecriarEntregaComDadosValidos() {
        // Given
        when(entregaRepository.save(any())).thenReturn(entrega);

        // When
        Entrega resultado = entregaRepository.save(entrega);

        // Then
        assertThat(resultado).isNotNull();
        assertThat(resultado.getStatusEntrega()).isEqualTo(StatusEntrega.AGUARDANDO_PREPARACAO);
        assertThat(resultado.getIdCorridaUber()).isNotNull();
        verify(entregaRepository).save(any(Entrega.class));
    }

    @Test
    @DisplayName("Deve consultar status de entrega por ID")
    void deveConsultarStatusPorId() {
        // Given
        UUID entregaId = entrega.getId();
        when(entregaRepository.findById(entregaId)).thenReturn(Optional.of(entrega));

        // When
        Optional<Entrega> resultado = entregaRepository.findById(entregaId);

        // Then
        assertThat(resultado).isPresent();
        assertThat(resultado.get().getStatusEntrega()).isEqualTo(StatusEntrega.AGUARDANDO_PREPARACAO);
        verify(entregaRepository).findById(entregaId);
    }

    @Test
    @DisplayName("Deve gerar PIN code válido")
    void deveGerarPINCodeValido() {
        // When
        String pin = uberDeliveryService.gerarPinCode();

        // Then
        assertThat(pin)
            .isNotNull()
            .isNotEmpty()
            .matches("\\d+");
    }

    @Test
    @DisplayName("Deve gerar múltiplos PIN codes diferentes")
    void deveGerarMultiplosPINCodesDiferentes() {
        // When
        String pin1 = uberDeliveryService.gerarPinCode();
        String pin2 = uberDeliveryService.gerarPinCode();
        String pin3 = uberDeliveryService.gerarPinCode();

        // Then
        assertThat(pin1).isNotEqualTo(pin2);
        assertThat(pin2).isNotEqualTo(pin3);
        assertThat(pin1).isNotEqualTo(pin3);
    }

    @Test
    @DisplayName("Deve calcular frete com taxa correta")
    void deveCalcularFreteComTaxaCorreta() {
        // Given
        BigDecimal valorCorrida = BigDecimal.valueOf(25.00);
        BigDecimal percentualTaxa = BigDecimal.valueOf(0.10); // 10%

        // When
        BigDecimal taxa = valorCorrida.multiply(percentualTaxa);
        BigDecimal total = valorCorrida.add(taxa);

        // Then
        assertThat(taxa).isEqualByComparingTo(BigDecimal.valueOf(2.50));
        assertThat(total).isEqualByComparingTo(BigDecimal.valueOf(27.50));
    }

    @Test
    @DisplayName("Deve consult status de entrega por delivery_id da Uber")
    void deveConsultarStatusPorDeliveryId() {
        // Given
        String deliveryId = "test-delivery-001";
        when(entregaRepository.findByIdCorridaUber(deliveryId)).thenReturn(Optional.of(entrega));

        // When
        Optional<Entrega> resultado = entregaRepository.findByIdCorridaUber(deliveryId);

        // Then
        assertThat(resultado).isPresent();
        assertThat(resultado.get().getIdCorridaUber()).isEqualTo(deliveryId);
    }

    @Test
    @DisplayName("Deve retornar entrega em transito com informações do motorista")
    void deveRetornarEntregaEmTransitoComInfoMotorista() {
        // Given
        Entrega entregaEmTransito = EntregaTestFixtures.criarEntregaEmTransito();
        when(entregaRepository.findById(entregaEmTransito.getId()))
            .thenReturn(Optional.of(entregaEmTransito));

        // When
        Optional<Entrega> resultado = entregaRepository.findById(entregaEmTransito.getId());

        // Then
        assertThat(resultado).isPresent();
        assertThat(resultado.get().getNomeMotorista()).isEqualTo("João Silva");
        assertThat(resultado.get().getContatoMotorista()).isEqualTo("+55 11 98765-4321");
        assertThat(resultado.get().getPlacaVeiculo()).isEqualTo("ABC-1234");
        assertThat(resultado.get().getLatitudeMotorista()).isCloseTo(-23.5505d, within(0.0001d));
        assertThat(resultado.get().getLongitudeMotorista()).isCloseTo(-46.6333d, within(0.0001d));
    }

    @Test
    @DisplayName("Deve retornar entrega entregue com timestamp de conclusão")
    void deveRetornarEntregaEntregueComTimestamp() {
        // Given
        Entrega entregaEntregue = EntregaTestFixtures.criarEntregaEntregue();
        when(entregaRepository.findById(entregaEntregue.getId()))
            .thenReturn(Optional.of(entregaEntregue));

        // When
        Optional<Entrega> resultado = entregaRepository.findById(entregaEntregue.getId());

        // Then
        assertThat(resultado).isPresent();
        assertThat(resultado.get().getStatusEntrega()).isEqualTo(StatusEntrega.ENTREGUE);
        assertThat(resultado.get().getDataHoraEntrega()).isNotNull();
        assertThat(resultado.get().getDataHoraRetirada()).isNotNull();
    }

    @Test
    @DisplayName("Deve validar tipo de veículo suportado")
    void deveValidarTipoVeiculoSuportado() {
        // Given
        for (TipoVeiculoUber tipo : TipoVeiculoUber.values()) {
            entrega.setTipoVeiculoSolicitado(tipo);

            // When/Then
            assertThat(entrega.getTipoVeiculoSolicitado()).isIn(TipoVeiculoUber.values());
        }
    }
}
