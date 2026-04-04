package com.win.marketplace.service.fixtures;

import com.win.marketplace.dto.webhook.UberWebhookEventDTO;
import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.enums.StatusEntrega;
import com.win.marketplace.model.enums.TipoVeiculoUber;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.Instant;
import java.util.UUID;

/**
 * Factory para criar objetos de teste
 * Centralizamos criação de fixtures para reutilização em testes
 */
public class EntregaTestFixtures {

    public static Entrega criarEntregaAguardandoMotorista() {
        Entrega entrega = new Entrega();
        entrega.setId(UUID.randomUUID());
        entrega.setIdCorridaUber("test-delivery-001");
        entrega.setStatusEntrega(StatusEntrega.AGUARDANDO_PREPARACAO);
        entrega.setTipoVeiculoSolicitado(TipoVeiculoUber.UBER_MOTO);
        entrega.setValorCorridaUber(BigDecimal.valueOf(25.00));
        entrega.setValorFreteCliente(BigDecimal.valueOf(27.50));
        entrega.setTaxaWinmarket(BigDecimal.valueOf(2.50));
        entrega.setDataHoraSolicitacao(OffsetDateTime.now());
        return entrega;
    }

    public static Entrega criarEntregaEmTransito() {
        Entrega entrega = criarEntregaAguardandoMotorista();
        entrega.setStatusEntrega(StatusEntrega.EM_TRANSITO);
        entrega.setNomeMotorista("João Silva");
        entrega.setContatoMotorista("+55 11 98765-4321");
        entrega.setPlacaVeiculo("ABC-1234");
        entrega.setLatitudeMotorista(-23.5505d);
        entrega.setLongitudeMotorista(-46.6333d);
        entrega.setDataHoraRetirada(OffsetDateTime.now());
        return entrega;
    }

    public static Entrega criarEntregaEntregue() {
        Entrega entrega = criarEntregaEmTransito();
        entrega.setStatusEntrega(StatusEntrega.ENTREGUE);
        entrega.setDataHoraEntrega(OffsetDateTime.now());
        return entrega;
    }

    public static UberWebhookEventDTO criarWebhookPickupCompleted(String deliveryId) {
        UberWebhookEventDTO event = new UberWebhookEventDTO();
        event.setEventType("deliveries.pickup_completed");
        event.setDeliveryId(deliveryId);
        event.setTimestamp(Instant.now());
        
        UberWebhookEventDTO.CourierData courier = new UberWebhookEventDTO.CourierData();
        courier.setName("João Silva");
        courier.setPhoneNumber("+55 11 98765-4321");
        
        UberWebhookEventDTO.LocationCoordinates location = new UberWebhookEventDTO.LocationCoordinates();
        location.setLatitude(-23.5505d);
        location.setLongitude(-46.6333d);
        courier.setLocation(location);
        
        UberWebhookEventDTO.VehicleData vehicle = new UberWebhookEventDTO.VehicleData();
        vehicle.setLicensePlate("ABC-1234");
        courier.setVehicle(vehicle);
        
        event.setCourier(courier);
        return event;
    }

    public static UberWebhookEventDTO criarWebhookDeliveryCompleted(String deliveryId) {
        UberWebhookEventDTO event = new UberWebhookEventDTO();
        event.setEventType("deliveries.delivery_completed");
        event.setDeliveryId(deliveryId);
        event.setTimestamp(Instant.now());
        event.setStatus("delivered");
        
        UberWebhookEventDTO.CourierData courier = new UberWebhookEventDTO.CourierData();
        courier.setName("João Silva");
        
        UberWebhookEventDTO.LocationCoordinates location = new UberWebhookEventDTO.LocationCoordinates();
        location.setLatitude(-23.5520d);
        location.setLongitude(-46.6348d);
        courier.setLocation(location);
        
        event.setCourier(courier);
        return event;
    }

    public static UberWebhookEventDTO criarWebhookDeliveryCancelled(String deliveryId) {
        UberWebhookEventDTO event = new UberWebhookEventDTO();
        event.setEventType("deliveries.delivery_cancelled");
        event.setDeliveryId(deliveryId);
        event.setTimestamp(Instant.now());
        event.setCancellationReason("Motorista não conseguiu acessar o endereço");
        return event;
    }

    public static UberWebhookEventDTO criarWebhookMotoristaAtribuido(String deliveryId) {
        UberWebhookEventDTO event = new UberWebhookEventDTO();
        event.setEventType("deliveries.courier_assigned");
        event.setDeliveryId(deliveryId);
        event.setTimestamp(Instant.now());
        
        UberWebhookEventDTO.CourierData courier = new UberWebhookEventDTO.CourierData();
        courier.setName("João Silva");
        courier.setPhoneNumber("+55 11 98765-4321");
        
        UberWebhookEventDTO.VehicleData vehicle = new UberWebhookEventDTO.VehicleData();
        vehicle.setLicensePlate("ABC-1234");
        courier.setVehicle(vehicle);
        
        event.setCourier(courier);
        return event;
    }

    public static Pedido criarPedido() {
        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setCriadoEm(OffsetDateTime.now());
        pedido.setStatus(Pedido.StatusPedido.CONFIRMADO);
        return pedido;
    }
}
